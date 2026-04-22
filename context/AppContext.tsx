import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ScheduleService } from '../services/ScheduleService';
import { DaySchedule, ScheduledActivity, Meal, Workout, AmbientSound } from '../types';

interface AppContextType {
    currentTime: Date;
    currentSchedule: DaySchedule;
    currentActivity: ScheduledActivity | null;
    nextActivity: ScheduledActivity | null;
    refreshSchedule: () => void;
    updateActivity: (activity: ScheduledActivity) => void;
    addActivity: (activity: ScheduledActivity) => void;
    deleteActivity: (activityId: string) => void;
    updateMeal: (meal: Meal, index: number) => void;
    addMeal: (meal: Meal) => void;
    deleteMeal: (index: number) => void;
    updateWorkout: (workout: Workout) => void;
    ambientSound: AmbientSound;
    setAmbientSound: (sound: AmbientSound) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentSchedule, setCurrentSchedule] = useState<DaySchedule>(
        ScheduleService.getInstance().getScheduleForDay(new Date())
    );
    const [currentActivity, setCurrentActivity] = useState<ScheduledActivity | null>(null);
    const [nextActivity, setNextActivity] = useState<ScheduledActivity | null>(null);
    const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');

    const scheduleService = ScheduleService.getInstance();

    // Initialize ScheduleService from Supabase
    useEffect(() => {
        const initService = async () => {
            await scheduleService.init();
            refreshSchedule();
        };
        initService();
    }, [scheduleService]); // Remove refreshSchedule dependency to avoid potential loops if not memoized correctly (it is, but safer)

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // 1 minute

        return () => clearInterval(timer);
    }, []);

    const refreshSchedule = useCallback(() => {
        const schedule = scheduleService.getScheduleForDay(currentTime);
        const activity = scheduleService.getCurrentActivity(currentTime);
        const next = scheduleService.getNextActivity(currentTime);

        setCurrentSchedule(schedule);
        setCurrentActivity(activity);
        setNextActivity(next);
    }, [currentTime, scheduleService]);

    // Update schedule and activities when time changes
    useEffect(() => {
        refreshSchedule();
    }, [currentTime, refreshSchedule]);

    const updateActivity = (activity: ScheduledActivity) => {
        scheduleService.updateActivity(currentTime, activity);
        refreshSchedule();
    };

    const addActivity = (activity: ScheduledActivity) => {
        scheduleService.addActivity(currentTime, activity);
        refreshSchedule();
    };

    const deleteActivity = (activityId: string) => {
        scheduleService.deleteActivity(currentTime, activityId);
        refreshSchedule();
    };

    const updateMeal = (meal: Meal, index: number) => {
        scheduleService.updateMeal(currentTime, meal, index);
        refreshSchedule();
    };

    const addMeal = (meal: Meal) => {
        scheduleService.addMeal(currentTime, meal);
        refreshSchedule();
    };

    const deleteMeal = (index: number) => {
        scheduleService.deleteMeal(currentTime, index);
        refreshSchedule();
    };

    const updateWorkout = (workout: Workout) => {
        scheduleService.updateWorkout(currentTime, workout);
        refreshSchedule();
    };

    return (
        <AppContext.Provider value={{
            currentTime,
            currentSchedule,
            currentActivity,
            nextActivity,
            refreshSchedule,
            updateActivity,
            addActivity,
            deleteActivity,
            updateMeal,
            addMeal,
            deleteMeal,
            updateWorkout
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
