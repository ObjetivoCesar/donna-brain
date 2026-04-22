
import React, { useState, useEffect } from 'react';
import { Workout, WorkoutFormData, Exercise } from '../types';

interface WorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: WorkoutFormData) => void;
    initialData?: Workout;
}

const WorkoutModal: React.FC<WorkoutModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [focusVal, setFocusVal] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        if (isOpen && initialData) {
            setFocusVal(initialData.focus);
            setExercises(initialData.exercises || []);
        } else if (isOpen) {
            setFocusVal('');
            setExercises([]);
        }
    }, [isOpen, initialData]);

    const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
        const updated = [...exercises];
        updated[index] = { ...updated[index], [field]: value };
        setExercises(updated);
    };

    const addExercise = () => {
        setExercises([...exercises, { name: '', setsReps: '3x10' }]);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            focus: focusVal,
            exercises: exercises
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold text-white mb-6">
                    Editar Rutina de Entrenamiento
                </h2>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Enfoque (ej. Pecho y Tríceps)</label>
                        <input
                            type="text"
                            value={focusVal}
                            onChange={(e) => setFocusVal(e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition"
                            placeholder="Nombre de la rutina"
                            required
                        />
                    </div>

                    <div className="mb-4 flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-400">Ejercicios</label>
                        <button
                            type="button"
                            onClick={addExercise}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded transition"
                        >
                            + Agregar Ejercicio
                        </button>
                    </div>

                    <div className="space-y-3 mb-6">
                        {exercises.map((ex, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={ex.name}
                                    onChange={(e) => handleExerciseChange(i, 'name', e.target.value)}
                                    className="flex-1 bg-black/30 border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-red-500"
                                    placeholder="Nombre del Ejercicio"
                                    required
                                />
                                <input
                                    type="text"
                                    value={ex.setsReps}
                                    onChange={(e) => handleExerciseChange(i, 'setsReps', e.target.value)}
                                    className="w-24 bg-black/30 border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-red-500 text-center"
                                    placeholder="Sets x Reps"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeExercise(i)}
                                    className="text-gray-500 hover:text-red-400 px-2"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </form>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        type="button"
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-red-900/20 transition transform active:scale-95"
                    >
                        Guardar Rutina
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutModal;
