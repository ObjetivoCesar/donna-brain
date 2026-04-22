import { scheduleLunesViernes, scheduleSabado, scheduleDomingo } from '../data/mockData';
import { ScheduledActivity } from '../types';

export const getTodaySchedule = (): ScheduledActivity[] => {
    const day = new Date().getDay();
    if (day >= 1 && day <= 5) { // Monday to Friday
        return scheduleLunesViernes;
    } else if (day === 6) { // Saturday
        return scheduleSabado;
    } else { // Sunday
        return scheduleDomingo;
    }
};

const parseTime = (timeStr: string): [number, number] => {
    const [hour, minute] = timeStr.split(':').map(Number);
    return [hour, minute];
};

export const getCurrentActivity = (): ScheduledActivity | null => {
    const now = new Date();
    const schedule = getTodaySchedule();

    for (const activity of schedule) {
        const [startTimeStr, endTimeStr] = activity.time.split('-');
        const [startHour, startMinute] = parseTime(startTimeStr);
        const [endHour, endMinute] = parseTime(endTimeStr);

        const startTime = new Date();
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);

        if (now >= startTime && now <= endTime) {
            return activity;
        }
    }

    return null;
};

export const calculateProgress = (): number => {
    const now = new Date();
    const schedule = getTodaySchedule();
    if (schedule.length === 0) {
        return 0;
    }

    let completedActivities = 0;
    for (const activity of schedule) {
        const [, endTimeStr] = activity.time.split('-');
        const [endHour, endMinute] = parseTime(endTimeStr);

        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);

        if (now > endTime) {
            completedActivities++;
        }
    }

    return completedActivities / schedule.length;
};
