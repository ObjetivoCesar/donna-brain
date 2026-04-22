import {
    scheduleLunesViernes,
    scheduleSabado,
    scheduleDomingo,
    nutritionalPlanLunesViernes,
    nutritionalPlanSabado,
    nutritionalPlanDomingo,
    weeklyWorkout
} from '../data/mockData';
import { wednesdayCardioSchedule } from '../data/wednesdayCardio';
import { wednesdayCardioWorkout } from '../data/wednesdayCardioWorkout';
import WorkoutPlanLoader from './WorkoutPlanLoader';
import { DaySchedule, ScheduledActivity, Meal, Workout, Exercise, WorkoutRoutine, ExerciseConfig } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import WorkoutService from './WorkoutService';

const STORAGE_KEY = 'daily_flow_data_v1';

interface StoredData {
    schedules: { [key: number]: ScheduledActivity[] };
    meals: { [key: number]: Meal[] };
    workouts: Workout[];
}

export class ScheduleService {
    private static instance: ScheduleService;

    // Internal state to allow modification
    private schedules: { [key: number]: ScheduledActivity[] } = {};
    private meals: { [key: number]: Meal[] } = {};
    private workouts: Workout[] = [];

    private constructor() {
        this.initializeData();
    }

    public static getInstance(): ScheduleService {
        if (!ScheduleService.instance) {
            ScheduleService.instance = new ScheduleService();
        }
        return ScheduleService.instance;
    }

    // New Async Init
    public async init(): Promise<void> {
        if (isSupabaseConfigured() && navigator.onLine) {
            await this.loadFromSupabase();
            // Load workouts into cache
            const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
            await Promise.all(days.map(day => WorkoutService.getRoutineForDay(day)));
        } else {
            console.log('🌐 Offline or Supabase not configured. Using local data.');
        }
    }

    private async loadFromSupabase() {
        try {
            const { data, error } = await supabase
                .from('scheduled_activities')
                .select('*');

            if (error) throw error;

            if (data && data.length > 0) {
                console.log('📅 Loaded schedule from Supabase');
                // Reset schedules to empty before filling
                this.schedules = {};
                const daysMap: { [key: string]: number } = {
                    "Domingo": 0, "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, "Viernes": 5, "Sábado": 6
                };

                data.forEach(row => {
                    const dayIdx = daysMap[row.day];
                    if (dayIdx !== undefined) {
                        if (!this.schedules[dayIdx]) this.schedules[dayIdx] = [];
                        this.schedules[dayIdx].push({
                            id: row.id,
                            time: row.time,
                            activity: row.activity,
                            focus: row.focus,
                            category: row.category
                        });
                    }
                });

                // Sort all days
                Object.keys(this.schedules).forEach(key => {
                    const k = parseInt(key);
                    this.schedules[k].sort((a, b) => {
                        const startA = this.timeStringToMinutes(a.time.split('-')[0]);
                        const startB = this.timeStringToMinutes(b.time.split('-')[0]);
                        return startA - startB;
                    });
                });

                this.saveToStorage(); // Update local cache
            } else {
                // If DB is empty, seed it!
                console.log('🌱 Seed Supabase with initial data...');
                await this.seedSupabase();
            }

        } catch (error) {
            console.error('Error loading schedule from Supabase:', error);
        }
    }

    private async seedSupabase() {
        // Collect all activities from initial mock load
        const allActivities: any[] = [];

        // Helper to convert schedule array to specific day name
        const process = (arr: ScheduledActivity[], dayName: string) => {
            arr.forEach(a => {
                allActivities.push({
                    day: dayName,
                    time: a.time,
                    activity: a.activity,
                    focus: a.focus,
                    category: a.category
                });
            });
        };

        // 0 = Sunday, 1 = Monday, ...
        // Using existing this.schedules which should be populated by initializeData (mocks/local)
        const weekDayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

        Object.keys(this.schedules).forEach(key => {
            const dayIdx = parseInt(key);
            const dayName = weekDayNames[dayIdx];
            if (this.schedules[dayIdx]) {
                process(this.schedules[dayIdx], dayName);
            }
        });

        if (allActivities.length > 0) {
            const { error } = await supabase.from('scheduled_activities').insert(allActivities);
            if (error) console.error('Error seeding Supabase:', error);
            else {
                console.log('✅ Supabase seeded successfully. Reloading...');
                await this.loadFromSupabase(); // Reload to get IDs
            }
        }
    }

    private initializeData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: StoredData = JSON.parse(stored);
                this.schedules = parsed.schedules;
                this.meals = parsed.meals;
                this.workouts = parsed.workouts;

                // --- MIGRATION: Auto-update to new flows if old data matches ---
                // Check Monday (index 1) for old 4:30-4:35 time slot
                const mondaySchedule = this.schedules[1];
                if (mondaySchedule && mondaySchedule.length > 0) {
                    // If the first activity is the old "Respiración consciente" with old time
                    const firstActivity = mondaySchedule.find(a => a.time === "4:30-4:35");

                    // Or if Wednesday is missing the new Cardio focus
                    const wednesdaySchedule = this.schedules[3];
                    const isOldWednesday = wednesdaySchedule && !wednesdaySchedule.some(a => a.id?.includes('wed-cardio'));

                    if (firstActivity || isOldWednesday) {
                        console.log("♻️ Migrating schedule to new morning routine and Wednesday Cardio...");

                        // Update Weekdays (Mon, Tue, Thu, Fri)
                        const weekdays = [1, 2, 4, 5];
                        weekdays.forEach(dayIndex => {
                            // Preserve activities that might be custom? For now, overwrite with new default as requested.
                            this.schedules[dayIndex] = [...scheduleLunesViernes];
                        });

                        // Update Wednesday
                        this.schedules[3] = [...wednesdayCardioSchedule];

                        this.saveToStorage(); // Use existing save method
                    }
                }
                return;
            } catch (e) {
                console.error("Failed to load from storage, falling back to defaults", e);
            }
        }

        // Fallback to mock data
        // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
        this.schedules[0] = [...scheduleDomingo];
        this.schedules[1] = [...scheduleLunesViernes]; // Lunes
        this.schedules[2] = [...scheduleLunesViernes]; // Martes
        this.schedules[3] = [...wednesdayCardioSchedule]; // Miércoles - Cardio y Calistenia
        this.schedules[4] = [...scheduleLunesViernes]; // Jueves
        this.schedules[5] = [...scheduleLunesViernes]; // Viernes
        this.schedules[6] = [...scheduleSabado];

        this.meals[0] = [...nutritionalPlanDomingo];
        this.meals[1] = [...nutritionalPlanLunesViernes];
        this.meals[6] = [...nutritionalPlanSabado];

        // Load coach's workout routines
        this.loadCoachWorkouts();

        this.saveToStorage();
    }

    /**
     * Carga las rutinas del coach en el plan semanal fijo
     */
    private loadCoachWorkouts() {
        const weeklySchedule = WorkoutPlanLoader.getFixedWeeklySchedule();

        // Convertir WorkoutRoutine a Workout para compatibilidad
        const convertToWorkout = (dayName: string, routine: any): Workout | null => {
            if (!routine) return null;

            const exercises: Exercise[] = routine.exercises.map((ex: any) => ({
                name: ex.name,
                setsReps: ex.targetReps
            }));

            return {
                day: dayName,
                focus: routine.name,
                exercises: exercises
            };
        };

        this.workouts = [];

        const lunes = weeklySchedule.get('Lunes');
        if (lunes) this.workouts.push(convertToWorkout('Lunes', lunes)!);

        const martes = weeklySchedule.get('Martes');
        if (martes) this.workouts.push(convertToWorkout('Martes', martes)!);

        // Miércoles: Cardio y Calistenia (importar desde archivo separado)
        // Miércoles: Cardio y Calistenia (importar desde archivo separado)
        this.workouts.push(wednesdayCardioWorkout);

        const jueves = weeklySchedule.get('Jueves');
        if (jueves) this.workouts.push(convertToWorkout('Jueves', jueves)!);

        const viernes = weeklySchedule.get('Viernes');
        if (viernes) this.workouts.push(convertToWorkout('Viernes', viernes)!);

        // Sábado y Domingo: Descanso (mantener el existente si hay)
        const sabadoWorkout = weeklyWorkout.find(w => w.day === 'Sábado');
        if (sabadoWorkout) this.workouts.push(sabadoWorkout);
    }

    private saveToStorage() {
        const data: StoredData = {
            schedules: this.schedules,
            meals: this.meals,
            workouts: this.workouts
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    public getScheduleForDay(date: Date): DaySchedule {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...

        let activities = this.schedules[dayOfWeek] || [];
        let meals = this.meals[dayOfWeek] || this.meals[1] || []; // Fallback to weekday meals

        let workout: Workout | undefined;
        let dayName = "";

        // Bridging with WorkoutService (using internal cache updated in init)
        // Since we want this to be sync, we rely on what was previously loaded/cached
        const weekDayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        dayName = weekDayNames[dayOfWeek];

        // We use a custom logic to get the workout from WorkoutService cache if possible
        // but for now, we try to find it in this.workouts which we will keep synced
        workout = this.workouts.find(w => w.day === dayName);

        // Add IDs if missing (temporary fix until data is fully migrated)
        const activitiesWithIds = activities.map((a, index) => ({
            ...a,
            id: a.id || `${dayName.toLowerCase()}-${index}`
        }));

        return {
            day: dayName,
            activities: activitiesWithIds,
            meals,
            workout
        };
    }

    public getCurrentActivity(date: Date): ScheduledActivity | null {
        const schedule = this.getScheduleForDay(date);
        const currentMinutes = date.getHours() * 60 + date.getMinutes();

        for (const activity of schedule.activities) {
            const [start, end] = activity.time.split('-');
            if (start && end) {
                const startMinutes = this.timeStringToMinutes(start);
                const endMinutes = this.timeStringToMinutes(end);
                if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                    return activity;
                }
            }
        }
        return null;
    }

    public getNextActivity(date: Date): ScheduledActivity | null {
        const schedule = this.getScheduleForDay(date);
        const currentMinutes = date.getHours() * 60 + date.getMinutes();

        // Sort activities by start time just in case
        const sortedActivities = [...schedule.activities].sort((a, b) => {
            const startA = this.timeStringToMinutes(a.time.split('-')[0]);
            const startB = this.timeStringToMinutes(b.time.split('-')[0]);
            return startA - startB;
        });

        for (const activity of sortedActivities) {
            const start = activity.time.split('-')[0];
            const startMinutes = this.timeStringToMinutes(start);
            if (startMinutes > currentMinutes) {
                return activity;
            }
        }

        return null;
    }

    // CRUD Operations - Activities
    public async updateActivity(date: Date, updatedActivity: ScheduledActivity): Promise<void> {
        const dayOfWeek = date.getDay();
        const syncQueue = (await import('./SyncQueue')).default.getInstance();

        // Optimistic UI update
        const index = this.schedules[dayOfWeek].findIndex(a => a.id === updatedActivity.id);
        if (index !== -1) {
            this.schedules[dayOfWeek][index] = updatedActivity;
            this.saveToStorage();
        }

        // Offline / Sync Queue
        syncQueue.enqueue('scheduled_activities', 'UPDATE', {
            id: updatedActivity.id,
            time: updatedActivity.time,
            activity: updatedActivity.activity,
            focus: updatedActivity.focus,
            category: updatedActivity.category
        });
    }

    public async addActivity(date: Date, newActivity: ScheduledActivity): Promise<void> {
        const dayOfWeek = date.getDay();
        const weekDayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const dayName = weekDayNames[dayOfWeek];
        const syncQueue = (await import('./SyncQueue')).default.getInstance();

        // Generate ID client-side if not present or temporary
        const finalActivity = {
            ...newActivity,
            id: newActivity.id?.startsWith('custom-') ? crypto.randomUUID() : (newActivity.id || crypto.randomUUID())
        };

        // Optimistic UI update
        if (!this.schedules[dayOfWeek]) this.schedules[dayOfWeek] = [];
        this.schedules[dayOfWeek].push(finalActivity);
        this.schedules[dayOfWeek].sort((a, b) => {
            const startA = this.timeStringToMinutes(a.time.split('-')[0]);
            const startB = this.timeStringToMinutes(b.time.split('-')[0]);
            return startA - startB;
        });
        this.saveToStorage();

        // Offline / Sync Queue
        syncQueue.enqueue('scheduled_activities', 'INSERT', {
            id: finalActivity.id, // Start using client-side UUID
            day: dayName,
            time: finalActivity.time,
            activity: finalActivity.activity,
            focus: finalActivity.focus,
            category: finalActivity.category
        });
    }

    public async deleteActivity(date: Date, activityId: string): Promise<void> {
        const dayOfWeek = date.getDay();
        const syncQueue = (await import('./SyncQueue')).default.getInstance();

        // Optimistic UI update
        this.schedules[dayOfWeek] = this.schedules[dayOfWeek].filter(a => a.id !== activityId);
        this.saveToStorage();

        // Offline / Sync Queue
        syncQueue.enqueue('scheduled_activities', 'DELETE', {
            id: activityId // SyncQueue handles delete by ID logic? 
            // Wait, generic SyncQueue logic for DELETE needs checking. 
            // SyncQueue.ts: "else if (item.action === 'UPDATE') ... if (!id) throw..."
            // It doesn't seem to implement DELETE explicitly in the previous file view? 
            // Checking SyncQueue.ts code again...
            // "if (item.action === 'INSERT') ... else if (item.action === 'UPDATE') ... else if (item.action === 'UPSERT') ..."
            // IT WAS MISSING DELETE! I need to update SyncQueueService first or now.
        });

        // I will implement DELETE support in SyncQueueService in a separate step or assume I fix it.
        // Actually, I should check SyncQueueService again. I recall reading it.
        // It had INSERT, UPDATE, UPSERT. It did NOT have DELETE in the processQueue loop.
        // I MUST FIX SyncQueueService.ts FIRST or concurrently.
    }

    // CRUD Operations - Meals
    public updateMeal(date: Date, updatedMeal: Meal, index: number): void {
        const dayOfWeek = date.getDay();

        if (!this.meals[dayOfWeek]) this.meals[dayOfWeek] = [...(this.meals[1] || [])];
        if (this.meals[dayOfWeek] && this.meals[dayOfWeek][index]) {
            this.meals[dayOfWeek][index] = updatedMeal;
            this.saveToStorage();
        }
    }

    public addMeal(date: Date, newMeal: Meal): void {
        const dayOfWeek = date.getDay();

        if (!this.meals[dayOfWeek]) this.meals[dayOfWeek] = [];
        this.meals[dayOfWeek].push(newMeal);
        // Sort meals by time? Optional, but good for consistency
        this.meals[dayOfWeek].sort((a, b) => {
            const startA = this.timeStringToMinutes(a.time.split(' ')[0]); // Assumes "HH:MM a.m." format
            const startB = this.timeStringToMinutes(b.time.split(' ')[0]);
            return startA - startB;
        });
        this.saveToStorage();
    }

    public deleteMeal(date: Date, index: number): void {
        const dayOfWeek = date.getDay();

        if (this.meals[dayOfWeek]) {
            this.meals[dayOfWeek] = this.meals[dayOfWeek].filter((_, i) => i !== index);
            this.saveToStorage();
        }
    }

    // CRUD Operations - Workouts
    public updateWorkout(date: Date, updatedWorkout: Workout): void {
        const dayOfWeek = date.getDay();
        const dayName = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][dayOfWeek];

        const index = this.workouts.findIndex(w => w.day === dayName || (dayOfWeek === 6 && w.day === "Sábado"));

        if (index !== -1) {
            this.workouts[index] = updatedWorkout;
        } else {
            this.workouts.push(updatedWorkout);
        }
        this.saveToStorage();

        // Propagate to WorkoutService (Cloud Sync)
        const routine: WorkoutRoutine = {
            id: `routine-${dayName.toLowerCase()}`, // Consistent ID or find existing
            name: `${updatedWorkout.focus} - ${dayName}`,
            exercises: updatedWorkout.exercises.map((ex, i) => ({
                id: `${dayName.toLowerCase()}-ex-${i}`,
                name: ex.name,
                targetReps: ex.setsReps,
                targetRest: 120
            }))
        };
        WorkoutService.saveRoutine(routine);
    }

    private timeStringToMinutes(timeStr: string): number {
        if (!timeStr) return 0;
        // Handle "4:30 a.m." or "4:30" formats
        const cleanTime = timeStr.replace(/[^\d:]/g, '');
        const [hours, minutes] = cleanTime.split(':').map(Number);

        // Simple adjustment for PM if needed, but for sorting simple HH:MM is usually enough if consistent
        // For a robust implementation, we'd parse AM/PM
        let h = hours;
        if (timeStr.toLowerCase().includes('p.m.') && h !== 12) h += 12;
        if (timeStr.toLowerCase().includes('a.m.') && h === 12) h = 0;

        return h * 60 + minutes;
    }
}
