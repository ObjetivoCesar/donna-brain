import { FoodItem, SavedMeal, UserGoals, MealType } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import SyncQueueService from './SyncQueue';

const STORAGE_KEYS = {
    LOGS: 'fitai_logs',
    FAVORITES: 'fitai_favorites',
    GOALS: 'fitai_goals'
};

const DEFAULT_GOALS: UserGoals = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80,
    waterIntakeMl: 3000
};

export class NutritionService {
    private static instance: NutritionService;

    private constructor() { }

    public static getInstance(): NutritionService {
        if (!NutritionService.instance) {
            NutritionService.instance = new NutritionService();
        }
        return NutritionService.instance;
    }

    // --- Goals Management ---

    public async getUserGoals(): Promise<UserGoals> {
        if (!isSupabaseConfigured()) {
            const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
            return stored ? JSON.parse(stored) : DEFAULT_GOALS;
        }

        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('nutrition_goals')
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows"

            return data?.nutrition_goals || DEFAULT_GOALS;
        } catch (error) {
            console.error('Error fetching goals from Supabase:', error);
            return DEFAULT_GOALS;
        }
    }

    public async saveUserGoals(goals: UserGoals): Promise<void> {
        if (!isSupabaseConfigured()) {
            localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
            return;
        }

        try {
            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    nutrition_goals: goals,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving goals to Supabase:', error);
            // Local fallback
            localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
        }
    }

    // --- Food Logs Management ---

    public async getFoodLogs(date: Date): Promise<FoodItem[]> {
        const dateStr = date.toISOString().split('T')[0];

        if (!isSupabaseConfigured()) {
            const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
            if (!stored) return [];
            const allLogs: FoodItem[] = JSON.parse(stored);
            return allLogs.filter(item => item.timestamp.startsWith(dateStr));
        }

        try {
            const { data, error } = await supabase
                .from('nutrition_logs')
                .select('*')
                .eq('date', dateStr)
                .order('created_at', { ascending: true });

            if (error) throw error;

            return data.map(row => ({
                id: row.id,
                name: row.name,
                calories: Number(row.calories),
                protein: Number(row.protein),
                carbs: Number(row.carbs),
                fat: Number(row.fat),
                meal: row.meal_type as MealType,
                timestamp: row.created_at,
                summary: row.summary
            }));
        } catch (error) {
            console.error('Error fetching food logs from Supabase:', error);
            return [];
        }
    }

    public async addFoodLog(item: FoodItem): Promise<void> {
        if (!isSupabaseConfigured()) {
            const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
            const allLogs: FoodItem[] = stored ? JSON.parse(stored) : [];
            allLogs.push(item);
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(allLogs));
            return;
        }

        const dbRow = {
            id: item.id,
            date: item.timestamp.split('T')[0],
            name: item.name,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            meal_type: item.meal,
            summary: item.summary
        };

        try {
            const { error } = await supabase.from('nutrition_logs').insert(dbRow);
            if (error) throw error;
            console.log('✅ Food log saved to Supabase');
        } catch (error) {
            console.error('Error saving food log to Supabase:', error);
            SyncQueueService.getInstance().enqueue('nutrition_logs', 'INSERT', dbRow);
        }
    }

    public async deleteFoodLog(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
            if (!stored) return;
            let allLogs: FoodItem[] = JSON.parse(stored);
            allLogs = allLogs.filter(item => item.id !== id);
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(allLogs));
            return;
        }

        try {
            const { error } = await supabase.from('nutrition_logs').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting food log from Supabase:', error);
            SyncQueueService.getInstance().enqueue('nutrition_logs', 'DELETE', { id });
        }
    }

    // --- Favorites / Saved Meals ---

    public async getSavedMeals(): Promise<SavedMeal[]> {
        if (!isSupabaseConfigured()) {
            const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
            return stored ? JSON.parse(stored) : [];
        }

        try {
            const { data, error } = await supabase
                .from('nutrition_favorites')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            return data.map(row => ({
                id: row.id,
                name: row.name,
                calories: Number(row.calories),
                protein: Number(row.protein),
                carbs: Number(row.carbs),
                fat: Number(row.fat),
                defaultMealType: row.default_meal_type as MealType
            }));
        } catch (error) {
            console.error('Error fetching favorites from Supabase:', error);
            return [];
        }
    }

    public async addSavedMeal(meal: SavedMeal): Promise<void> {
        if (!isSupabaseConfigured()) {
            const meals = await this.getSavedMeals();
            meals.push(meal);
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(meals));
            return;
        }

        const dbRow = {
            id: meal.id,
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            default_meal_type: meal.defaultMealType
        };

        try {
            const { error } = await supabase.from('nutrition_favorites').insert(dbRow);
            if (error) throw error;
        } catch (error) {
            console.error('Error saving favorite to Supabase:', error);
            SyncQueueService.getInstance().enqueue('nutrition_favorites', 'INSERT', dbRow);
        }
    }

    public async deleteSavedMeal(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            let meals = await this.getSavedMeals();
            meals = meals.filter(m => m.id !== id);
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(meals));
            return;
        }

        try {
            const { error } = await supabase.from('nutrition_favorites').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting favorite from Supabase:', error);
            SyncQueueService.getInstance().enqueue('nutrition_favorites', 'DELETE', { id });
        }
    }

    // --- Export / Import (Legacy/Local) ---

    public exportData(): string {
        const data = {
            logs: localStorage.getItem(STORAGE_KEYS.LOGS),
            favorites: localStorage.getItem(STORAGE_KEYS.FAVORITES),
            goals: localStorage.getItem(STORAGE_KEYS.GOALS)
        };
        return JSON.stringify(data);
    }

    public importData(jsonString: string): boolean {
        try {
            const data = JSON.parse(jsonString);
            if (data.logs) localStorage.setItem(STORAGE_KEYS.LOGS, data.logs);
            if (data.favorites) localStorage.setItem(STORAGE_KEYS.FAVORITES, data.favorites);
            if (data.goals) localStorage.setItem(STORAGE_KEYS.GOALS, data.goals);
            return true;
        } catch (e) {
            console.error("Failed to import data", e);
            return false;
        }
    }

    // --- Helpers ---

    public calculateDailyTotals(logs: FoodItem[]) {
        return logs.reduce((acc, item) => ({
            calories: acc.calories + item.calories,
            protein: acc.protein + item.protein,
            carbs: acc.carbs + item.carbs,
            fat: acc.fat + item.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
}

export const nutritionService = NutritionService.getInstance();
