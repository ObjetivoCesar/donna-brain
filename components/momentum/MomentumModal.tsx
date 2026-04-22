import React, { useRef, useEffect } from 'react';

interface MomentumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MomentumModal: React.FC<MomentumModalProps> = ({ isOpen, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isOpen && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
            videoRef.current.currentTime = 0;
        } else if (!isOpen && videoRef.current) {
            videoRef.current.pause();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in-up">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[101]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Video Logic */}
            <div className="w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center p-4">
                {/* Placeholder for user video - using a generic motivational placeholder or empty src */}
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain rounded-lg shadow-2xl"
                    controls
                    playsInline
                    // User needs to replace this with their actual video file
                    src="/videos/momentum.mp4"
                    poster="/images/momentum-poster.jpg"
                >
                    <div className="text-white text-center p-10">
                        <h2 className="text-2xl font-bold mb-4">Tu "Yo del Futuro" te habla...</h2>
                        <p className="mb-4">Sube tu video motivacional a: <code>public/videos/momentum.mp4</code></p>
                        <button onClick={onClose} className="px-6 py-3 bg-red-600 rounded-full font-bold">
                            VOLVER A LA ACCIÓN
                        </button>
                    </div>
                </video>
            </div>

            {/* Action Button - Always visible below video */}
            <div className="absolute bottom-10 w-full flex justify-center z-[101]">
                <button
                    onClick={onClose}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xl px-12 py-4 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.6)] transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                >
                    <span>🔥</span>
                    <span>VOLVER AL ATAQUE</span>
                </button>
            </div>
        </div>
    );
};

export default MomentumModal;
