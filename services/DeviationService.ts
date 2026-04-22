import { ActivityDeviation } from '../types';
import { supabase } from './supabase';
import SyncQueueService from './SyncQueue';

const STORAGE_KEY = 'daily-flow-deviations';

class DeviationService {
    private getStoredDeviations(): ActivityDeviation[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading deviations from localStorage:', error);
            return [];
        }
    }

    private saveDeviations(deviations: ActivityDeviation[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(deviations));
        } catch (error) {
            console.error('Error saving deviations to localStorage:', error);
        }
    }

    /**
     * Agrega una nueva desviación al registro
     */
    async addDeviation(deviation: Omit<ActivityDeviation, 'id' | 'timestamp'>): Promise<ActivityDeviation> {
        const newDeviation: ActivityDeviation = {
            ...deviation,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };

        // Cache local update
        const deviations = this.getStoredDeviations();
        deviations.push(newDeviation);
        this.saveDeviations(deviations);

        // Queue for Supabase
        SyncQueueService.getInstance().enqueue('activity_deviations', 'INSERT', {
            id: newDeviation.id,
            date: newDeviation.date,
            original_activity: `${newDeviation.scheduledTime} - ${newDeviation.scheduledActivity}`,
            actual_activity: newDeviation.actualActivity,
            reason: newDeviation.reason,
            timestamp: newDeviation.timestamp
        });

        return newDeviation;
    }

    /**
     * Obtiene todas las desviaciones de una fecha específica
     */
    async getDeviationsForDate(date: string): Promise<ActivityDeviation[]> {
        try {
            const { data } = await supabase
                .from('activity_deviations')
                .select('*')
                .eq('date', date);

            if (data && data.length > 0) {
                return data.map(row => {
                    const [time, ...actParts] = (row.original_activity || '').split(' - ');
                    const activity = actParts.join(' - ');
                    return {
                        id: row.id,
                        date: row.date,
                        scheduledActivity: activity || row.original_activity,
                        scheduledTime: time || '',
                        actualActivity: row.actual_activity,
                        reason: row.reason,
                        timestamp: row.timestamp || new Date().toISOString()
                    };
                });
            }
        } catch (error) {
            console.warn('Supabase not available, using local deviations');
        }

        const allDeviations = this.getStoredDeviations();
        return allDeviations.filter(d => d.date === date);
    }

    /**
     * Obtiene todas las desviaciones registradas
     */
    async getAllDeviations(): Promise<ActivityDeviation[]> {
        if (!isSupabaseConfigured()) {
            return this.getStoredDeviations();
        }
        // ... implementation similar to getDeviationsForDate but no filter
        return []; // Placeholder for now as mainly date filtered is used
    }

    /**
     * Elimina las desviaciones de una fecha específica
     */
    async clearDeviationsForDate(date: string): Promise<void> {
        // Cache local update
        const allDeviations = this.getStoredDeviations();
        const filtered = allDeviations.filter(d => d.date !== date);
        this.saveDeviations(filtered);

        // Queue for Supabase
        SyncQueueService.getInstance().enqueue('activity_deviations', 'DELETE', { date });
    }

    /**
     * Elimina todas las desviaciones
     */
    async clearAllDeviations(): Promise<void> {
        if (!isSupabaseConfigured()) {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }
        // Safety: maybe don't allow clearing ALL DB?
        console.warn('Clear all deviations on DB not implemented for safety.');
    }
}

export default new DeviationService();
