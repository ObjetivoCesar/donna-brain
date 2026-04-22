import React from 'react';
import { X } from 'lucide-react';

interface MeasurementGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

const MeasurementGuide: React.FC<MeasurementGuideProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Guía de Medición Corporal</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 bg-white/5 flex justify-center overflow-auto">
                    <img
                        src="/images/measurement-guide.png"
                        alt="Guía visual de cómo tomar medidas corporales"
                        className="max-h-[70vh] w-auto object-contain rounded-lg"
                    />
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                    <p className="text-sm text-gray-400 text-center">
                        Sigue las líneas indicadas para asegurar consistencia en tus registros semanales.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MeasurementGuide;
