import { useEffect, useRef, useState } from 'react';
import { ScheduledActivity } from '../types';

export const useScheduledNotifications = (schedule: ScheduledActivity[]) => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [audioEnabled, setAudioEnabled] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const lastTriggeredExact = useRef<string | null>(null);
    const lastTriggeredWarning = useRef<string | null>(null);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);

            // Auto-request permissions if not already granted or denied
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(result => {
                    setPermission(result);
                    console.log('📢 Notification permission:', result);
                });
            }
        }

        // Enable audio by default
        setAudioEnabled(true);

        // Initialize AudioContext on first user interaction (required by browsers)
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                console.log('🔊 Audio context initialized');
            }
            // Remove listener after first interaction
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);

        return () => {
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
        };
    }, []);

    // Function to play a beep sound using Web Audio API
    const playBeep = (duration: number = 1000, frequency: number = 800) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000);

        console.log(`🔊 Playing beep at ${frequency}Hz for ${duration}ms`);
    };

    // Play a 10-second insistent alarm (multiple beeps)
    const playLongAlarm = () => {
        // Pattern: beep-beep-pause-beep-beep-pause (repeating for ~10 seconds)
        const pattern = [
            { delay: 0, freq: 880, duration: 400 },
            { delay: 500, freq: 880, duration: 400 },
            { delay: 1200, freq: 1046, duration: 600 },

            { delay: 2200, freq: 880, duration: 400 },
            { delay: 2700, freq: 880, duration: 400 },
            { delay: 3400, freq: 1046, duration: 600 },

            { delay: 4400, freq: 880, duration: 400 },
            { delay: 4900, freq: 880, duration: 400 },
            { delay: 5600, freq: 1046, duration: 600 },

            { delay: 6600, freq: 880, duration: 400 },
            { delay: 7100, freq: 880, duration: 400 },
            { delay: 7800, freq: 1046, duration: 600 },

            { delay: 8800, freq: 1318, duration: 800 }, // Final high pitch
        ];

        pattern.forEach(({ delay, freq, duration }) => {
            setTimeout(() => playBeep(duration, freq), delay);
        });
    };

    // Play a shorter warning alarm (5 minutes before)
    const playWarningAlarm = () => {
        // Softer, shorter pattern for warning
        const pattern = [
            { delay: 0, freq: 659, duration: 300 },
            { delay: 400, freq: 784, duration: 300 },
            { delay: 800, freq: 880, duration: 500 },
        ];

        pattern.forEach(({ delay, freq, duration }) => {
            setTimeout(() => playBeep(duration, freq), delay);
        });
    };

    const requestPermission = async () => {
        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
        }
        setAudioEnabled(true);

        // TEST: Play a short beep to verify it works
        try {
            playBeep(500, 880);
            console.log("✅ Alarm test successful!");
        } catch (e) {
            console.error("❌ Error playing alarm test:", e);
        }
    };

    const checkSchedule = (now: Date) => {
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeString = `${currentHours}:${currentMinutes < 10 ? '0' + currentMinutes : currentMinutes}`;

        // Check for activities starting NOW
        const activityStartingNow = schedule.find(activity => {
            const [start] = activity.time.split('-');
            if (!start) return false;

            const [h, m] = start.split(':').map(Number);
            return h === currentHours && m === currentMinutes;
        });

        if (activityStartingNow && lastTriggeredExact.current !== currentTimeString) {
            lastTriggeredExact.current = currentTimeString;
            triggerExactNotification(activityStartingNow);
        }

        // Check for activities starting in 5 minutes
        const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
        const futureHours = fiveMinutesLater.getHours();
        const futureMinutes = fiveMinutesLater.getMinutes();
        const warningTimeString = `${futureHours}:${futureMinutes < 10 ? '0' + futureMinutes : futureMinutes}`;

        const activityIn5Minutes = schedule.find(activity => {
            const [start] = activity.time.split('-');
            if (!start) return false;

            const [h, m] = start.split(':').map(Number);
            return h === futureHours && m === futureMinutes;
        });

        if (activityIn5Minutes && lastTriggeredWarning.current !== warningTimeString) {
            lastTriggeredWarning.current = warningTimeString;
            triggerWarningNotification(activityIn5Minutes);
        }
    };

    const triggerWarningNotification = (activity: ScheduledActivity) => {
        console.log("⚠️ 5-minute warning for:", activity.activity);

        // Browser Notification
        if (permission === 'granted') {
            new Notification(`⏰ En 5 minutos: ${activity.activity}`, {
                body: `Prepárate para cambiar de actividad`,
                icon: '/vite.svg',
                tag: 'warning-' + activity.activity
            });
        }

        // Softer warning alarm
        if (audioEnabled) {
            playWarningAlarm();
        }
    };

    const triggerExactNotification = (activity: ScheduledActivity) => {
        console.log("🚨 EXACT TIME for:", activity.activity);

        // Browser Notification
        if (permission === 'granted') {
            new Notification(`🚨 ¡ES HORA! ${activity.activity}`, {
                body: `Enfoque: ${activity.focus}`,
                icon: '/vite.svg',
                tag: 'exact-' + activity.activity,
                requireInteraction: true // Keeps notification visible until user interacts
            });
        }

        // Long, insistent alarm (10 seconds)
        if (audioEnabled) {
            playLongAlarm();
        }
    };

    // Check every second
    useEffect(() => {
        const interval = setInterval(() => {
            checkSchedule(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, [schedule, permission, audioEnabled]);

    return {
        permission,
        audioEnabled,
        requestPermission
    };
};
