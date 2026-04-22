import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

type AmbientSound = 'none' | 'rain' | 'whitenoise' | 'forest' | 'cafe';

const FocusScreen: React.FC = () => {
    const { currentActivity, nextActivity } = useApp();
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
    const [showChecklist, setShowChecklist] = useState(false);
    const [checklistItems, setChecklistItems] = useState<{ text: string; done: boolean }[]>([]);
    const [newCheckItem, setNewCheckItem] = useState('');

    useEffect(() => {
        if (!currentActivity) {
            setTimeLeft("");
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const [_, endTimeStr] = currentActivity.time.split('-');
            if (!endTimeStr) return;

            const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
            const endDate = new Date(now);
            endDate.setHours(endHours, endMinutes, 0, 0);

            const diff = endDate.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeLeft("00:00:00");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [currentActivity]);

    // --- Audio Logic ---
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const [playbackError, setPlaybackError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize audio element if not exists
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }

        const audio = audioRef.current;

        if (ambientSound === 'none') {
            audio.pause();
            audio.currentTime = 0;
        } else {
            // Mapping sound IDs to filenames in public/audios
            const soundMap: Record<AmbientSound, string> = {
                'none': '',
                'rain': '/audios/focus/rain.mp3',
                'whitenoise': '/audios/focus/whitenoise.mp3',
                'forest': '/audios/focus/forest.mp3',
                'cafe': '/audios/focus/cafe.mp3'
            };

            const src = soundMap[ambientSound];
            if (src) {
                // Only switch source if it's different to prevent restart on re-renders (though dependency array handles this)
                if (!audio.src.includes(src)) {
                    audio.src = src;
                    audio.load();
                }

                audio.play().catch(err => {
                    console.error("Error playing ambient sound:", err);
                    // User interaction policy might block auto-play if no interaction happened first,
                    // but since user clicked the button, it should be fine.
                });
            }
        }

        // Cleanup on unmount
        return () => {
            audio.pause();
        };
    }, [ambientSound]);

    const handleAddCheckItem = () => {
        if (newCheckItem.trim()) {
            setChecklistItems([...checklistItems, { text: newCheckItem, done: false }]);
            setNewCheckItem('');
        }
    };

    const toggleCheckItem = (index: number) => {
        const updated = [...checklistItems];
        updated[index].done = !updated[index].done;
        setChecklistItems(updated);
    };

    const ambientSounds: { id: AmbientSound; label: string; icon: string }[] = [
        { id: 'none', label: 'Silencio', icon: '🔇' },
        { id: 'rain', label: 'Lluvia', icon: '🌧️' },
        { id: 'whitenoise', label: 'Ruido Blanco', icon: '📻' },
        { id: 'forest', label: 'Bosque', icon: '🌲' },
        { id: 'cafe', label: 'Café', icon: '☕' },
    ];

    if (!currentActivity) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-400">No hay actividad actual</h2>
                <p className="text-gray-500 mt-2">Disfruta tu tiempo libre.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8">
            {/* Activity Title */}
            <div className="space-y-2">
                <span className="text-green-400 font-semibold tracking-wider uppercase text-sm">Modo Enfoque</span>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight max-w-2xl">
                    {currentActivity.activity}
                </h1>
            </div>

            {/* Timer Display */}
            <div className="bg-black/40 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl">
                <div className="text-7xl md:text-8xl font-mono font-bold text-white tracking-widest tabular-nums">
                    {timeLeft}
                </div>
                <p className="text-gray-400 mt-4 text-lg">Tiempo restante</p>
            </div>

            {/* Focus Description */}
            <div className="max-w-md w-full bg-white/5 p-6 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold text-gray-200 mb-2">Enfoque</h3>
                <p className="text-gray-300 text-base leading-relaxed">
                    {currentActivity.focus}
                </p>
            </div>

            {/* Error Message Toast */}
            {playbackError && (
                <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm animate-bounce">
                    ⚠️ {playbackError}
                </div>
            )}

            {/* Ambient Sound Controls */}
            <div className="max-w-md w-full bg-white/5 p-5 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-gray-200 mb-3">Ambiente Sonoro</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                    {ambientSounds.map((sound) => (
                        <button
                            key={sound.id}
                            onClick={() => setAmbientSound(sound.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${ambientSound === sound.id
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {sound.icon} {sound.label}
                        </button>
                    ))}
                </div>
                {ambientSound !== 'none' && (
                    <p className="text-green-400 text-sm mt-3 text-center">
                        🎵 Reproduciendo: {ambientSounds.find(s => s.id === ambientSound)?.label}
                    </p>
                )}
            </div>

            {/* Checklist Toggle */}
            <button
                onClick={() => setShowChecklist(!showChecklist)}
                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {showChecklist ? 'Ocultar' : 'Mostrar'} Checklist
            </button>

            {/* Checklist Section */}
            {showChecklist && (
                <div className="max-w-md w-full bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                    <h3 className="text-lg font-bold text-gray-200">Checklist de Tareas</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCheckItem}
                            onChange={(e) => setNewCheckItem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCheckItem()}
                            placeholder="Nueva tarea..."
                            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                        />
                        <button
                            onClick={handleAddCheckItem}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                        >
                            +
                        </button>
                    </div>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {checklistItems.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => toggleCheckItem(index)}
                                className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition"
                            >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.done ? 'bg-green-500 border-green-500' : 'border-gray-500'
                                    }`}>
                                    {item.done && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-sm ${item.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                    {item.text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Next Activity */}
            {nextActivity && (
                <div className="text-gray-500 text-sm mt-8">
                    Siguiente: <span className="text-gray-300">{nextActivity.activity}</span> ({nextActivity.time})
                </div>
            )}
        </div>
    );
};

export default FocusScreen;
