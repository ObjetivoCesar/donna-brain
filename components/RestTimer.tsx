import React, { useState, useEffect, useRef } from 'react';

interface RestTimerProps {
    initialSeconds: number;
    onComplete?: () => void;
    autoStart?: boolean;
}

const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds, onComplete, autoStart = false }) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [customTime, setCustomTime] = useState({ minutes: Math.floor(initialSeconds / 60), seconds: initialSeconds % 60 });
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        if (onComplete) onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, onComplete]);

    const handleStart = () => {
        if (timeLeft === 0) {
            // Reset to custom time if timer is at 0
            const totalSeconds = customTime.minutes * 60 + customTime.seconds;
            setTimeLeft(totalSeconds);
        }
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        setIsRunning(false);
        const totalSeconds = customTime.minutes * 60 + customTime.seconds;
        setTimeLeft(totalSeconds);
    };

    const handleSetCustomTime = () => {
        const totalSeconds = customTime.minutes * 60 + customTime.seconds;
        setTimeLeft(totalSeconds);
        setIsRunning(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = initialSeconds > 0 ? ((initialSeconds - timeLeft) / initialSeconds) * 100 : 0;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">⏱️ Cronómetro de Descanso</h4>

            {/* Timer Display */}
            <div className="relative mb-4">
                <div className="text-center">
                    <div className={`text-4xl font-bold font-mono ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-3">
                {!isRunning ? (
                    <button
                        onClick={handleStart}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                    >
                        ▶️ Iniciar
                    </button>
                ) : (
                    <button
                        onClick={handlePause}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                    >
                        ⏸️ Pausar
                    </button>
                )}
                <button
                    onClick={handleReset}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                >
                    🔄 Reiniciar
                </button>
            </div>

            {/* Custom Time Setter */}
            <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-gray-400 mb-2">Configurar tiempo:</p>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={customTime.minutes}
                        onChange={(e) => setCustomTime({ ...customTime, minutes: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-sm text-center"
                        placeholder="Min"
                    />
                    <span className="text-white text-sm">:</span>
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={customTime.seconds}
                        onChange={(e) => setCustomTime({ ...customTime, seconds: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-sm text-center"
                        placeholder="Seg"
                    />
                    <button
                        onClick={handleSetCustomTime}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded text-xs transition"
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestTimer;
