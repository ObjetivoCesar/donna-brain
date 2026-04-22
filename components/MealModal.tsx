
import React, { useState, useEffect } from 'react';
import { Meal, MealFormData } from '../types';

interface MealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: MealFormData) => void;
    initialData?: Meal;
    mode: 'add' | 'edit';
}

const MealModal: React.FC<MealModalProps> = ({ isOpen, onClose, onSave, initialData, mode }) => {
    const [timeVal, setTimeVal] = useState('');
    const [mealVal, setMealVal] = useState('');
    const [descVal, setDescVal] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setTimeVal(initialData.time);
            setMealVal(initialData.meal);
            setDescVal(initialData.description);
        } else if (isOpen) {
            setTimeVal('');
            setMealVal('');
            setDescVal('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            time: timeVal,
            meal: mealVal,
            description: descVal
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold text-white mb-6">
                    {mode === 'add' ? 'Nueva Comida' : 'Editar Comida'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Horario (ej. 8:00 a.m.)</label>
                        <input
                            type="text"
                            value={timeVal}
                            onChange={(e) => setTimeVal(e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition"
                            placeholder="00:00 a.m."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nombre de la Comida</label>
                        <input
                            type="text"
                            value={mealVal}
                            onChange={(e) => setMealVal(e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition"
                            placeholder="ej. Desayuno"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Descripción / Plan</label>
                        <textarea
                            value={descVal}
                            onChange={(e) => setDescVal(e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition h-24 resize-none"
                            placeholder="Detalle de los alimentos..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-orange-900/20 transition transform active:scale-95"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MealModal;
