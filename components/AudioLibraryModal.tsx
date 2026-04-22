import React, { useState, useRef, useEffect } from 'react';

interface AudioLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AudioOption {
    key: string;
    label: string;
    audioFile: string;
    isTest?: boolean;
}

const audioOptions: AudioOption[] = [
    {
        key: 'FATIGUE_DEMOTIVATION',
        label: 'Cansancio o desmotivación',
        audioFile: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        isTest: true
    },
    { key: 'EMOTIONAL_UNCERTAINTY', label: 'Incertidumbre emocional', audioFile: 'audio-incertidumbre-emocional.mp3' },
    { key: 'INSPIRATION_CREATIVITY', label: 'Inspiración o creatividad', audioFile: 'audio-inspiracion-o-creatividad.mp3' },
    { key: 'POSITIVE_IMPULSE', label: 'Impulso positivo', audioFile: 'audio-impulso-positivo.mp3' },
    { key: 'INSECURITY_REJECTION', label: 'Inseguridad o miedo al rechazo', audioFile: 'audio-inseguridad-o-miedo-al-rechazo.mp3' },
    { key: 'PROCRASTINATION_DOUBT', label: 'Postergación o duda', audioFile: 'audio-postergacion-o-duda.mp3' },
    { key: 'SHAME_PERFECTIONISM', label: 'Vergüenza o autoexigencia', audioFile: 'audio-verguenza-o-autoexigencia.mp3' },
    { key: 'ENTHUSIASM_NEW_BEGINNINGS', label: 'Entusiasmo o nuevos comienzos', audioFile: 'audio-entusiasmo-o-nuevos-comienzos.mp3' }
];

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
);

const AudioLibraryModal: React.FC<AudioLibraryModalProps> = ({ isOpen, onClose }) => {
    const [selectedAudio, setSelectedAudio] = useState<AudioOption | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedAudio(null);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [isOpen]);

    const handleSelectAudio = (option: AudioOption) => {
        console.log('📀 Selected audio option:', option);
        setSelectedAudio(option);
        setIsPlaying(false);
        setCurrentTime(0);

        if (audioRef.current) {
            const audioSrc = option.isTest ? option.audioFile : `/audios/${option.audioFile}`;
            console.log('🔊 Loading audio from:', audioSrc);
            console.log('🔊 Is test audio?', option.isTest);
            audioRef.current.src = audioSrc;
            audioRef.current.load();
            console.log('🔊 Audio element src after load:', audioRef.current.src);

            audioRef.current.onerror = (e) => {
                console.error('❌ Error loading audio:', e);
                console.error('❌ Failed src:', audioRef.current?.src);
                alert('Error al cargar el audio. Verifica la URL o que el archivo exista.');
            };

            audioRef.current.onloadeddata = () => {
                console.log('✅ Audio loaded successfully, duration:', audioRef.current?.duration);
            };
        } else {
            console.error('❌ audioRef.current is null!');
        }
    };

    const togglePlayPause = async () => {
        if (!audioRef.current) {
            console.error('❌ audioRef.current is null in togglePlayPause!');
            return;
        }

        console.log('🎵 Current audio src:', audioRef.current.src);
        console.log('🎵 Current readyState:', audioRef.current.readyState);

        try {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
                console.log('⏸️ Paused');
            } else {
                console.log('🎵 Attempting to play:', audioRef.current.src);
                await audioRef.current.play();
                setIsPlaying(true);
                console.log('✅ Playback started successfully');
            }
        } catch (error) {
            console.error('❌ Error playing audio:', error);
            alert(`Error al reproducir el audio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-white">
                <header className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-gray-300">Biblioteca de Audios de Apoyo</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar">
                        <CloseIcon />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto p-4">
                    <p className="text-sm text-gray-400 mb-4">Selecciona el estado emocional que mejor describe cómo te sientes:</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {audioOptions.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => handleSelectAudio(option)}
                                className={`p-4 rounded-xl border-2 transition text-left ${selectedAudio?.key === option.key
                                        ? 'border-green-500 bg-green-500/20'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold text-white">{option.label}</div>
                                    {option.isTest && (
                                        <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full ml-2">
                                            DEMO
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedAudio && (
                    <div className="p-4 border-t border-white/10 bg-gray-800/50">
                        <div className="text-center mb-3">
                            <p className="text-sm text-gray-400">Reproduciendo:</p>
                            <p className="font-bold text-green-400">{selectedAudio.label}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={togglePlayPause}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 transition flex-shrink-0"
                                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                            >
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>

                            <div className="flex-grow">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

export default AudioLibraryModal;
