
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AmbientSound } from '../types';
import AudioLibraryModal from '../components/AudioLibraryModal';

const SupportScreen: React.FC = () => {
    const { currentActivity, ambientSound, setAmbientSound } = useApp();
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isSOSOpen, setIsSOSOpen] = useState(false);

    // Filter out 'none' for display
    const ambientSounds: { id: AmbientSound; label: string; icon: string }[] = [
        { id: 'rain', label: 'Lluvia', icon: '🌧️' },
        { id: 'whitenoise', label: 'Ruido Blanco', icon: '📻' },
        { id: 'forest', label: 'Bosque', icon: '🌲' },
        { id: 'cafe', label: 'Café', icon: '☕' },
    ];

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

    const toggleSound = (soundId: AmbientSound) => {
        if (ambientSound === soundId) {
            setAmbientSound('none');
        } else {
            setAmbientSound(soundId);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-6 pb-24 text-white">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Apoyo</h1>
                <p className="text-gray-400">Herramientas de Enfoque y Calma</p>
            </header>

            <div className="space-y-6">
                {/* Focus Timer Section */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <span className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2 block">Modo Enfoque</span>
                    <h2 className="text-2xl font-bold text-white mb-4 line-clamp-1">{currentActivity?.activity || "Descanso"}</h2>

                    <div className="text-6xl font-mono font-bold text-white tracking-widest mb-6 tabular-nums">
                        {timeLeft || "--:--:--"}
                    </div>

                    <div className="text-gray-400 text-sm italic mb-4">
                        "{currentActivity?.focus || "Recarga energía para la siguiente tarea."}"
                    </div>
                </section>

                {/* Ambient Sound Section */}
                <section>
                    <h3 className="text-lg font-bold text-gray-200 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        Ambiente Sonoro
                        {ambientSound !== 'none' && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">Reproduciendo</span>}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {ambientSounds.map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => toggleSound(sound.id)}
                                className={`p-4 rounded-xl transition flex items-center justify-between group ${ambientSound === sound.id
                                    ? 'bg-green-500 text-white shadow-green-500/20 shadow-lg'
                                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{sound.icon}</span>
                                    <span className="font-semibold">{sound.label}</span>
                                </div>
                                {ambientSound === sound.id && (
                                    <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                                )}
                            </button>
                        ))}
                    </div>
                    {ambientSound !== 'none' && (
                        <button
                            onClick={() => setAmbientSound('none')}
                            className="w-full mt-3 py-2 text-sm text-red-400 hover:text-red-300 font-medium transition"
                        >
                            Detener Audio
                        </button>
                    )}
                </section>

                {/* SOS Section */}
                <section>
                    <h3 className="text-lg font-bold text-gray-200 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Ayuda Inmediata
                    </h3>
                    <button
                        onClick={() => setIsSOSOpen(true)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl shadow-lg shadow-red-500/20 transition transform active:scale-95 flex items-center justify-center gap-3"
                    >
                        <span className="text-2xl">🆘</span>
                        <div className="text-left">
                            <div className="font-bold text-lg">Biblioteca SOS</div>
                            <div className="text-xs text-red-100 opacity-80">Audios para ansiedad, insomnio y crisis</div>
                        </div>
                    </button>
                </section>

                {/* Quick Guides Section (Placeholder for future) */}
                <section>
                    <h3 className="text-lg font-bold text-gray-200 mb-3">Guías Rápidas</h3>
                    <div className="bg-white/5 rounded-xl p-4 text-gray-400 text-sm flex items-center gap-3">
                        <span className="text-2xl">📚</span>
                        Próximamente: Guías visuales para tomar medidas y calibrar alimentos.
                    </div>
                </section>
            </div>

            <AudioLibraryModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
        </div>
    );
};

export default SupportScreen;
