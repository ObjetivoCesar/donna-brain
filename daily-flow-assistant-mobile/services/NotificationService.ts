import * as Notifications from 'expo-notifications';
import { scheduleLunesViernes, scheduleSabado, scheduleDomingo } from '../data/mockData';
import { ScheduledActivity } from '../types';

// 1. Define how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const getTodaySchedule = (): ScheduledActivity[] => {
  const day = new Date().getDay();
  if (day >= 1 && day <= 5) return scheduleLunesViernes;
  if (day === 6) return scheduleSabado;
  return scheduleDomingo;
};

const parseTime = (timeStr: string): [number, number] => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return [hour, minute];
};

export const scheduleDailyNotifications = async () => {
  // 2. Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('¡No se pudieron programar las notificaciones! Se necesitan permisos.');
    return;
  }

  // 3. Cancel all previously scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Previous notifications cancelled.');

  // 4. Schedule new notifications for the day
  const schedule = getTodaySchedule();
  let scheduledCount = 0;

  for (const activity of schedule) {
    const [startTimeStr] = activity.time.split('-');
    const [hour, minute] = parseTime(startTimeStr);
    
    const now = new Date();
    const trigger = new Date();
    trigger.setHours(hour, minute, 0, 0);

    // If the time is in the past, don't schedule it
    if (trigger < now) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Próxima Actividad',
        body: `${activity.activity} - ${activity.focus}`,
        sound: 'default',
      },
      trigger,
    });
    scheduledCount++;
  }

  console.log(`Scheduled ${scheduledCount} notifications for today.`);
};
