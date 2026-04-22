export interface SyncAction {
    id: string;
    table: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT';
    payload: any;
    timestamp: number;
    retryCount: number;
}

const QUEUE_KEY = 'daily-flow-sync-queue';

class SyncQueueService {
    private static instance: SyncQueueService;
    private queue: SyncAction[] = [];
    private isSyncing = false;

    private constructor() {
        this.loadQueue();
        // Try to sync on startup
        if (navigator.onLine) {
            this.processQueue();
        }
        // Listen for online status
        window.addEventListener('online', () => {
            console.log('🌐 Online detected. Processing sync queue...');
            this.processQueue();
        });
    }

    public static getInstance(): SyncQueueService {
        if (!SyncQueueService.instance) {
            SyncQueueService.instance = new SyncQueueService();
        }
        return SyncQueueService.instance;
    }

    private loadQueue() {
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            this.queue = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load sync queue', e);
            this.queue = [];
        }
    }

    private saveQueue() {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    }

    public enqueue(table: string, action: SyncAction['action'], payload: any) {
        const item: SyncAction = {
            id: crypto.randomUUID(),
            table,
            action,
            payload,
            timestamp: Date.now(),
            retryCount: 0
        };
        this.queue.push(item);
        this.saveQueue();
        console.log(`📥 Action enqueued: ${action} on ${table}`);

        // Try to process immediately if online
        if (navigator.onLine) {
            this.processQueue();
        }
    }

    public async processQueue() {
        if (this.isSyncing || this.queue.length === 0 || !navigator.onLine) return;

        this.isSyncing = true;
        const { supabase } = await import('./supabase'); // Lazy load to avoid circular deps if any

        console.log(`🔄 Processing ${this.queue.length} offline actions...`);

        // Process copy of queue to modify original safely
        const currentQueue = [...this.queue];
        const remainingQueue: SyncAction[] = [];

        for (const item of currentQueue) {
            try {
                let error;

                if (item.action === 'INSERT') {
                    const res = await supabase.from(item.table).insert(item.payload);
                    error = res.error;
                } else if (item.action === 'UPDATE') {
                    // Assuming payload has ID
                    const { id, ...data } = item.payload;
                    if (!id) throw new Error('Update requires ID');
                    const res = await supabase.from(item.table).update(data).eq('id', id);
                    error = res.error;
                } else if (item.action === 'UPSERT') {
                    const res = await supabase.from(item.table).upsert(item.payload);
                    error = res.error;
                } else if (item.action === 'DELETE') {
                    // Assuming payload has ID or conditions
                    const { id, ...conditions } = item.payload;
                    let query = supabase.from(item.table).delete();

                    if (id) {
                        query = query.eq('id', id);
                    } else if (Object.keys(conditions).length > 0) {
                        // Support multiple conditions if no ID
                        Object.entries(conditions).forEach(([key, value]) => {
                            query = query.eq(key, value);
                        });
                    } else {
                        throw new Error('Delete requires ID or conditions');
                    }

                    const res = await query;
                    error = res.error;
                }

                if (error) throw error;
                console.log(`✅ Synced: ${item.action} ${item.table}`);

            } catch (err) {
                console.error(`❌ Sync failed for ${item.id}:`, err);
                item.retryCount++;
                if (item.retryCount < 5) {
                    remainingQueue.push(item); // Keep for retry
                } else {
                    console.error(`💀 Dropping action ${item.id} after 5 retries`);
                }
            }
        }

        this.queue = remainingQueue;
        this.saveQueue();
        this.isSyncing = false;

        if (this.queue.length > 0) {
            // Retry remaining later
            setTimeout(() => this.processQueue(), 30000);
        }
    }

    public getQueueLength(): number {
        return this.queue.length;
    }
}

export default SyncQueueService;
