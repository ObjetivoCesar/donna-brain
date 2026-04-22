/**
 * PhotoStorageService
 * 
 * Manages photo storage using IndexedDB instead of localStorage Base64.
 * Provides better scalability (50-100GB vs 5-10MB) and prevents silent data loss.
 */

const DB_NAME = 'daily-flow-photos';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

import BunnyStorageService from './BunnyStorageService';

export interface PhotoMetadata {
    id: string;
    blob: Blob;
    uploadedAt: string;
}

class PhotoStorageService {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    /**
     * Initialize IndexedDB connection
     */
    private async init(): Promise<void> {
        if (this.db) return;

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            if (!this.isSupported()) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('❌ Error opening IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB initialized');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    objectStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
                    console.log('✅ Object store created');
                }
            };
        });

        return this.initPromise;
    }

    /**
     * Check if IndexedDB is supported in the current browser
     */
    isSupported(): boolean {
        return typeof indexedDB !== 'undefined';
    }

    /**
     * Save a photo file to IndexedDB
     * @param file - The image file to save
     * @returns Promise with the unique photo ID
     */
    async savePhoto(file: File): Promise<string> {
        // [MODIFIED] Try BunnyNet first
        if (BunnyStorageService.isConfigured()) {
            try {
                const url = await BunnyStorageService.uploadFile(file, 'progress-photos');
                return url; // Return the full URL as the "ID"
            } catch (error) {
                console.error('⚠️ BunnyNet upload failed, falling back to IndexedDB:', error);
                // Fallback continues below...
            }
        }

        await this.init();

        const id = crypto.randomUUID();
        const photoData: PhotoMetadata = {
            id,
            blob: file,
            uploadedAt: new Date().toISOString(),
        };

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(photoData);

            request.onsuccess = () => {
                console.log('✅ Photo saved to IndexedDB:', id);
                resolve(id);
            };

            request.onerror = () => {
                console.error('❌ Error saving photo:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get a photo URL from IndexedDB
     * @param id - The photo ID
     * @returns Promise with blob URL or null if not found
     */
    async getPhotoUrl(id: string): Promise<string | null> {
        await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                const result = request.result as PhotoMetadata | undefined;
                if (result && result.blob) {
                    const url = URL.createObjectURL(result.blob);
                    resolve(url);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error('❌ Error retrieving photo:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Delete a photo from IndexedDB
     * @param id - The photo ID to delete
     */
    async deletePhoto(id: string): Promise<void> {
        await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('✅ Photo deleted from IndexedDB:', id);
                resolve();
            };

            request.onerror = () => {
                console.error('❌ Error deleting photo:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Migrate a Base64 photo string to IndexedDB
     * @param base64 - The Base64 encoded image string
     * @returns Promise with the new photo ID
     */
    async migrateBase64Photo(base64: string): Promise<string> {
        await this.init();

        // Convert Base64 to Blob
        const blob = await this.base64ToBlob(base64);

        const id = crypto.randomUUID();
        const photoData: PhotoMetadata = {
            id,
            blob,
            uploadedAt: new Date().toISOString(),
        };

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(photoData);

            request.onsuccess = () => {
                console.log('✅ Base64 photo migrated to IndexedDB:', id);
                resolve(id);
            };

            request.onerror = () => {
                console.error('❌ Error migrating photo:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Convert Base64 string to Blob
     */
    private async base64ToBlob(base64: string): Promise<Blob> {
        const response = await fetch(base64);
        return response.blob();
    }

    /**
     * Get all photo IDs in the database
     */
    async getAllPhotoIds(): Promise<string[]> {
        await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAllKeys();

            request.onsuccess = () => {
                resolve(request.result as string[]);
            };

            request.onerror = () => {
                console.error('❌ Error getting photo IDs:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Clean up orphaned photos (photos not referenced in measurements)
     */
    async cleanupOrphanedPhotos(referencedPhotoIds: string[]): Promise<number> {
        const allPhotoIds = await this.getAllPhotoIds();
        const orphanedIds = allPhotoIds.filter(id => !referencedPhotoIds.includes(id));

        for (const id of orphanedIds) {
            await this.deletePhoto(id);
        }

        console.log(`🧹 Cleaned up ${orphanedIds.length} orphaned photos`);
        return orphanedIds.length;
    }
}

export default new PhotoStorageService();
