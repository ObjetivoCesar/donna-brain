import { BodyMeasurements, DailyLog, WeeklyCheckin } from '../types';
import PhotoStorageService from './PhotoStorageService';
import { supabase, isSupabaseConfigured } from './supabase';



import SyncQueueService from './SyncQueue';

const STORAGE_KEY = 'daily-flow-measurements';

const LOGS_KEY = 'daily-flow-logs';
const CHECKINS_KEY = 'daily-flow-weeklies';
const MIGRATION_FLAG_KEY = 'daily-flow-photos-migrated';

class MeasurementService {
    private migrationInProgress = false;

    private getStoredMeasurements(): BodyMeasurements[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading measurements from localStorage:', error);
            return [];
        }
    }

    private saveMeasurements(measurements: BodyMeasurements[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
        } catch (error) {
            console.error('Error saving measurements to localStorage:', error);
        }
    }

    /**
     * Check if a photo string is in Base64 format (old format)
     */
    private isBase64Photo(photo: string): boolean {
        return photo.startsWith('data:image/');
    }

    /**
     * Migrate old Base64 photos to IndexedDB
     * This runs automatically on first load after migration
     */
    async migrateOldMeasurements(): Promise<void> {
        // Migration logic is complex and might be better handled separately or kept as is for local fallback
        // For now, checks existing localStorage and could upload to Supabase if needed.
        // Skipping implementation to focus on new data flow.
    }

    async addMeasurement(data: Omit<BodyMeasurements, 'id'>): Promise<BodyMeasurements> {
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured, using local storage fallback.');
            // Fallback to local
            const newMeasurement: BodyMeasurements = {
                ...data,
                id: crypto.randomUUID(),
            };
            const measurements = this.getStoredMeasurements();
            measurements.push(newMeasurement);
            measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            this.saveMeasurements(measurements);
            return newMeasurement;
        }

        try {
            // Check for existing checkin on this date
            const { data: existing } = await supabase
                .from('weekly_checkins')
                .select('id')
                .eq('date', data.date)
                .single();

            const dbRow = {
                date: data.date,
                week_start_date: data.date, // Simplifying: treating checkin as daily measurement for now
                weight: data.weight,
                chest: data.chest,
                // approximate mapping for single 'arms'/'legs' to left/right if needed, or just map to right
                arm_right: data.arms,
                waist_navel: data.waist,
                hips: data.hips,
                thigh_right: data.legs,
                calf_right: data.calves,
                notes: data.notes,
                photos: data.photos
            };

            let resultId = existing?.id;

            if (existing) {
                const { error } = await supabase
                    .from('weekly_checkins')
                    .update(dbRow)
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { data: inserted, error } = await supabase
                    .from('weekly_checkins')
                    .insert(dbRow)
                    .select('id')
                    .single();
                if (error) throw error;
                resultId = inserted.id;
            }

            return { ...data, id: resultId };

            return { ...data, id: resultId };

        } catch (error) {
            console.error('Error adding measurement to Supabase:', error);
            // OFFLINE FALLBACK: Enqueue action
            const newId = crypto.randomUUID();
            SyncQueueService.getInstance().enqueue('weekly_checkins', 'INSERT', {
                id: newId,
                date: data.date,
                week_start_date: data.date,
                weight: data.weight,
                chest: data.chest,
                arm_right: data.arms,
                waist_navel: data.waist,
                hips: data.hips,
                thigh_right: data.legs,
                calf_right: data.calves,
                notes: data.notes,
                photos: data.photos
            });
            // Return optimistic response (local mock)
            return {
                ...data,
                id: newId
            };
        }
    }

    async getHistory(limit: number = 50): Promise<BodyMeasurements[]> {
        if (!isSupabaseConfigured()) {
            return this.getStoredMeasurements();
        }

        try {
            const { data, error } = await supabase
                .from('weekly_checkins')
                .select('*')
                .order('date', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data.map(row => ({
                id: row.id,
                date: row.date,
                weight: row.avg_weight || 0, // Fallback if weight is stored as avg
                chest: row.chest,
                arms: row.arm_right, // Mapping back
                waist: row.waist_navel,
                hips: row.hips,
                legs: row.thigh_right,
                calves: row.calf_right,
                notes: row.notes,
                photos: row.photos
            }));
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    }

    getLatestMeasurement(): BodyMeasurements | null {
        // Valid for sync usage only, maybe deprecate or return null
        return null;
    }

    async deleteMeasurement(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            // Local delete logic
            const measurements = this.getStoredMeasurements();
            const filtered = measurements.filter(m => m.id !== id);
            this.saveMeasurements(filtered);
            return;
        }

        try {
            const { error } = await supabase
                .from('weekly_checkins')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting measurement:', error);
            throw error;
        }
    }

    /**
     * Get all photo IDs referenced in measurements
     */
    getAllReferencedPhotoIds(): string[] {
        const measurements = this.getStoredMeasurements();
        const photoIds: string[] = [];

        for (const measurement of measurements) {
            if (measurement.photos) {
                photoIds.push(...measurement.photos.filter(id => !this.isBase64Photo(id)));
            }
        }

        return photoIds;
    }

    /**
     * Clean up orphaned photos in IndexedDB
     */
    async cleanupOrphanedPhotos(): Promise<number> {
        if (!PhotoStorageService.isSupported()) {
            return 0;
        }

        const referencedIds = this.getAllReferencedPhotoIds();
        return PhotoStorageService.cleanupOrphanedPhotos(referencedIds);
    }


    // --- Advanced Tracking Methods (Phase 4) ---

    async getDailyLogs(limit: number = 30): Promise<DailyLog[]> {
        if (!isSupabaseConfigured()) return [];

        try {
            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .order('date', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data.map(row => ({
                id: row.id,
                date: row.date,
                weight: row.weight,
                steps: row.steps,
                habits: {
                    sleepQuality: row.sleep_quality,
                    stressLevel: row.stress_level,
                    hungerLevel: row.hunger_level,
                    fatigueLevel: row.fatigue_level
                },
                notes: row.notes,
                createdAt: row.created_at
            }));
        } catch (error) {
            console.error('Error fetching daily logs:', error);
            return [];
        }
    }

    async saveDailyLog(log: DailyLog): Promise<void> {
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured, log not saved to cloud.');
            return;
        }

        const dbRow = {
            date: log.date,
            weight: log.weight,
            steps: log.steps,
            sleep_quality: log.habits.sleepQuality,
            stress_level: log.habits.stressLevel,
            hunger_level: log.habits.hungerLevel,
            fatigue_level: log.habits.fatigueLevel,
            notes: log.notes
        };

        try {
            // Check if exists
            const { data: existing } = await supabase
                .from('daily_logs')
                .select('id')
                .eq('date', log.date)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('daily_logs')
                    .update(dbRow)
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('daily_logs')
                    .insert(dbRow);
                if (error) throw error;
            }
            console.log('✅ Daily log saved to Supabase:', log);
        } catch (error) {
            console.error('Error saving daily log to Supabase:', error);
            // OFFLINE: Queue it
            SyncQueueService.getInstance().enqueue('daily_logs', 'UPSERT', {
                id: log.id,
                date: log.date,
                weight: log.weight,
                steps: log.steps,
                sleep_quality: log.habits.sleepQuality,
                stress_level: log.habits.stressLevel,
                hunger_level: log.habits.hungerLevel,
                fatigue_level: log.habits.fatigueLevel,
                notes: log.notes
            });
        }
    }

    async getWeeklyCheckins(limit: number = 12): Promise<WeeklyCheckin[]> {
        if (!isSupabaseConfigured()) {
            try {
                const stored = localStorage.getItem(CHECKINS_KEY);
                return stored ? JSON.parse(stored) : [];
            } catch (error) {
                console.error('Error reading weekly checkins:', error);
                return [];
            }
        }

        try {
            const { data, error } = await supabase
                .from('weekly_checkins')
                .select('*')
                .order('date', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data.map(row => ({
                id: row.id,
                date: row.date,
                weekStartDate: row.week_start_date,

                averageWeight: row.avg_weight || 0,
                averageSleep: row.avg_sleep,
                averageStress: row.avg_stress,
                averageHunger: row.avg_hunger,
                averageFatigue: row.avg_fatigue,
                averageSteps: row.avg_steps,

                measurements: {
                    chest: row.chest || 0,
                    armLeft: row.arm_left || 0,
                    armRight: row.arm_right || 0,
                    waistUpper: row.waist_upper || 0,
                    waistNavel: row.waist_navel || 0,
                    waistLower: row.waist_lower || 0,
                    hips: row.hips || 0,
                    thighLeft: row.thigh_left || 0,
                    thighRight: row.thigh_right || 0,
                    calfLeft: row.calf_left || 0,
                    calfRight: row.calf_right || 0
                },

                photos: row.photos || [],
                notes: row.notes
            }));
        } catch (error) {
            console.error('Error fetching weekly checkins from Supabase:', error);
            return [];
        }
    }

    async saveWeeklyCheckin(checkin: WeeklyCheckin): Promise<void> {
        if (!isSupabaseConfigured()) {
            const checkins = await this.getWeeklyCheckins(); // Local fallback
            const existingIndex = checkins.findIndex(c => c.id === checkin.id);

            if (existingIndex >= 0) {
                checkins[existingIndex] = checkin;
            } else {
                checkins.push(checkin);
            }

            checkins.sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
            localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins));
            console.log('✅ Weekly checkin saved:', checkin);
            return;
        }

        const dbRow = {
            date: checkin.date,
            week_start_date: checkin.weekStartDate,

            avg_weight: checkin.averageWeight,
            avg_sleep: checkin.averageSleep,
            avg_stress: checkin.averageStress,
            avg_hunger: checkin.averageHunger,
            avg_fatigue: checkin.averageFatigue,
            avg_steps: checkin.averageSteps,

            chest: checkin.measurements.chest,
            arm_left: checkin.measurements.armLeft,
            arm_right: checkin.measurements.armRight,
            waist_upper: checkin.measurements.waistUpper,
            waist_navel: checkin.measurements.waistNavel,
            waist_lower: checkin.measurements.waistLower,
            hips: checkin.measurements.hips,
            thigh_left: checkin.measurements.thighLeft,
            thigh_right: checkin.measurements.thighRight,
            calf_left: checkin.measurements.calfLeft,
            calf_right: checkin.measurements.calfRight,

            photos: checkin.photos,
            notes: checkin.notes
        };

        try {
            const { data: existing } = await supabase
                .from('weekly_checkins')
                .select('id')
                .eq('week_start_date', checkin.weekStartDate)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('weekly_checkins')
                    .update(dbRow)
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('weekly_checkins')
                    .insert(dbRow);
                if (error) throw error;
            }
            console.log('✅ Weekly checkin saved to Supabase:', checkin);

        } catch (error) {
            console.error('Error saving weekly checkin:', error);
            // OFFLINE: Queue it
            SyncQueueService.getInstance().enqueue('weekly_checkins', 'UPSERT', {
                id: checkin.id,
                date: checkin.date,
                week_start_date: checkin.weekStartDate,
                avg_weight: checkin.averageWeight,
                avg_sleep: checkin.averageSleep,
                avg_stress: checkin.averageStress,
                chest: checkin.measurements.chest,
                arm_right: checkin.measurements.armRight,
                waist_navel: checkin.measurements.waistNavel,
                hips: checkin.measurements.hips,
                thigh_right: checkin.measurements.thighRight,
                calf_right: checkin.measurements.calfRight,
                notes: checkin.notes,
                photos: checkin.photos
            });
        }
    }

    /**
     * Calculate weekly averages based on daily logs for a given week
     * @param weekStartDate YYYY-MM-DD (Monday)
     * @param weekEndDate YYYY-MM-DD (Sunday)
     */
    async calculateWeeklyAverages(weekStartDate: string, weekEndDate: string) {
        const logs = await this.getDailyLogs();
        const start = new Date(weekStartDate).getTime();
        const end = new Date(weekEndDate).getTime();

        const weekLogs = logs.filter(log => {
            const date = new Date(log.date).getTime();
            return date >= start && date <= end;
        });

        if (weekLogs.length === 0) {
            return null;
        }

        const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
        const avg = (arr: number[]) => arr.length ? parseFloat((sum(arr) / arr.length).toFixed(1)) : 0;

        return {
            averageWeight: avg(weekLogs.map(l => l.weight)),
            averageSteps: Math.round(avg(weekLogs.map(l => l.steps || 0))),
            averageSleep: avg(weekLogs.map(l => l.habits.sleepQuality)),
            averageStress: avg(weekLogs.map(l => l.habits.stressLevel)),
            averageHunger: avg(weekLogs.map(l => l.habits.hungerLevel)),
            averageFatigue: avg(weekLogs.map(l => l.habits.fatigueLevel)),
            logsCount: weekLogs.length
        };
    }
}



export default new MeasurementService();
