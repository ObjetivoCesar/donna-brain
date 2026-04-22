import { WorkoutRoutine, ExerciseConfig, WorkoutSession, WorkoutSet } from '../types';
import { supabase } from './supabase';
import SyncQueueService from './SyncQueue';

const ROUTINES_KEY = 'daily-flow-routines';
const HISTORY_KEY = 'daily-flow-workout-history';

interface ExerciseHistory {
    exerciseId: string;
    exerciseName: string;
    sessions: WorkoutSession[];
}

class WorkoutService {
    private getStoredRoutines(): WorkoutRoutine[] {
        try {
            const stored = localStorage.getItem(ROUTINES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading routines:', error);
            return [];
        }
    }

    private saveRoutines(routines: WorkoutRoutine[]): void {
        localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
    }

    private getExerciseHistories(): ExerciseHistory[] {
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading exercise histories:', error);
            return [];
        }
    }

    private saveExerciseHistories(histories: ExerciseHistory[]): void {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(histories));
    }

    /**
     * Obtiene la rutina activa para un día específico (o la crea si no existe)
     */
    async getRoutineForDay(dayName: string): Promise<WorkoutRoutine> {
        try {
            const { data, error } = await supabase
                .from('workout_routines')
                .select('*')
                .ilike('name', `%${dayName}%`)
                .single();

            if (data) {
                const routine = {
                    id: data.id,
                    name: data.name,
                    exercises: data.exercises || []
                };
                // Cache local
                this.updateLocalRoutine(routine);
                return routine;
            }
        } catch (error) {
            console.warn('Supabase not available, using local storage');
        }

        // Fallback local
        const routines = this.getStoredRoutines();
        let routine = routines.find(r => r.name.includes(dayName));

        if (!routine) {
            routine = {
                id: crypto.randomUUID(),
                name: `Rutina de ${dayName}`,
                exercises: []
            };
            await this.saveRoutine(routine);
        }

        return routine;
    }

    private updateLocalRoutine(routine: WorkoutRoutine) {
        const routines = this.getStoredRoutines();
        const index = routines.findIndex(r => r.id === routine.id);
        if (index >= 0) {
            routines[index] = routine;
        } else {
            routines.push(routine);
        }
        this.saveRoutines(routines);
    }

    /**
     * Guarda la configuración de una rutina
     */
    async saveRoutine(routine: WorkoutRoutine): Promise<void> {
        // Optimistic update local
        this.updateLocalRoutine(routine);

        // Queue for Supabase
        SyncQueueService.getInstance().enqueue('workout_routines', 'UPSERT', {
            id: routine.id,
            name: routine.name,
            exercises: routine.exercises,
            updated_at: new Date().toISOString()
        });
    }

    /**
     * Registra una sesión de entrenamiento para un ejercicio específico
     */
    async logExerciseSession(exerciseId: string, exerciseName: string, sets: WorkoutSet[], notes?: string): Promise<void> {
        const newSession: WorkoutSession = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            sets: sets,
            notes: notes
        };

        // Cache local update
        const histories = this.getExerciseHistories();
        let exerciseHistory = histories.find(h => h.exerciseId === exerciseId);
        if (!exerciseHistory) {
            exerciseHistory = { exerciseId, exerciseName, sessions: [] };
            histories.push(exerciseHistory);
        }
        exerciseHistory.sessions.push(newSession);
        if (exerciseHistory.sessions.length > 20) exerciseHistory.sessions.shift();
        this.saveExerciseHistories(histories);

        // Queue for Supabase
        SyncQueueService.getInstance().enqueue('workout_logs', 'INSERT', {
            id: newSession.id,
            exercise_id: exerciseId,
            date: newSession.date,
            sets: sets, // JSONB en DB
            notes: notes
        });

        console.log(`✅ Sesión encolada para ${exerciseName}`);
    }

    /**
     * Obtiene el último peso y reps usados en un ejercicio
     */
    async getLastSessionStats(exerciseId: string): Promise<{ weight: number, reps: number } | null> {
        // Intento desde Supabase para datos más frescos si es posible
        try {
            const { data } = await supabase
                .from('workout_logs')
                .select('sets')
                .eq('exercise_id', exerciseId)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            if (data && data.sets && data.sets.length > 0) {
                const sets = data.sets as WorkoutSet[];
                const workingSet = sets.find(s => s.type === 'working') || sets[0];
                return { weight: workingSet.weight, reps: workingSet.reps };
            }
        } catch (e) {
            // Ignorar y usar local
        }

        // De lo contrario local
        const histories = this.getExerciseHistories();
        const exerciseHistory = histories.find(h => h.exerciseId === exerciseId);

        if (exerciseHistory && exerciseHistory.sessions.length > 0) {
            const lastSession = exerciseHistory.sessions[exerciseHistory.sessions.length - 1];
            const workingSet = lastSession.sets.find(s => s.type === 'working') || lastSession.sets[0];
            if (workingSet) {
                return { weight: workingSet.weight, reps: workingSet.reps };
            }
        }

        return null;
    }

    /**
     * Obtiene todo el historial de un ejercicio
     */
    async getExerciseHistory(exerciseId: string): Promise<WorkoutSession[]> {
        try {
            const { data } = await supabase
                .from('workout_logs')
                .select('*')
                .eq('exercise_id', exerciseId)
                .order('date', { ascending: false });

            if (data) {
                return data.map(d => ({
                    id: d.id,
                    date: d.date,
                    sets: d.sets,
                    notes: d.notes
                }));
            }
        } catch (e) { }

        const histories = this.getExerciseHistories();
        const exerciseHistory = histories.find(h => h.exerciseId === exerciseId);
        return exerciseHistory ? exerciseHistory.sessions : [];
    }

    /**
     * Get all workout history for export
     */
    getHistory(): ExerciseHistory[] {
        return this.getExerciseHistories();
    }

    /**
     * Import workout history from backup
     */
    importHistory(histories: ExerciseHistory[]): void {
        if (Array.isArray(histories)) {
            this.saveExerciseHistories(histories);
            console.log('✅ Workout history imported');
        }
    }

    /**
     * Export all workout data
     */
    exportData(): any {
        return {
            routines: this.getStoredRoutines(),
            history: this.getExerciseHistories()
        };
    }

    /**
     * Import all workout data
     */
    importData(data: any): void {
        if (data.routines && Array.isArray(data.routines)) {
            this.saveRoutines(data.routines);
        }
        if (data.history && Array.isArray(data.history)) {
            this.saveExerciseHistories(data.history);
        }
        console.log('✅ Workout data imported');
    }
}

export default new WorkoutService();
