
import React, { useState, useEffect } from 'react';
import { ScheduledActivity, ActivityFormData } from '../types';

interface ActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ActivityFormData) => void;
    initialData?: ScheduledActivity;
    mode: 'add' | 'edit';
}

const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, onSave, initialData, mode }) => {
    const [timeVal, setTimeVal] = useState('');
    const [activityVal, setActivityVal] = useState('');
    const [focusVal, setFocusVal] = useState('');
    const [categoryVal, setCategoryVal] = useState<'living' | 'motivation' | 'work'>('living');

    useEffect(() => {
        if (isOpen && initialData) {
            setTimeVal(initialData.time);
            setActivityVal(initialData.activity);
            setFocusVal(initialData.focus);
            setCategoryVal(initialData.category || 'living');
        } else if (isOpen) {
            setTimeVal('');
            setActivityVal('');
            setFocusVal('');
            setCategoryVal('living');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            time: timeVal,
            activity: activityVal,
            focus: focusVal,
            category: categoryVal
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
                    {mode === 'add' ? 'Nueva Actividad' : 'Editar Actividad'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Horario (ej. 7:00-8:00)</label>
                        <input
                            type="text"
                            value={timeVal}
                            onChange={(e) => setTimeVal(e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition"
                            placeholder="00:00-00:00"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Actividad</label>
                        <input
                            type="text"
                            value={activityVal}
                            onChange={(e) => setActivityVal(e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition"
                            placeholder="Nombre de la actividad"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Enfoque / Descripción</label>
                        <input
                            type="text"
                            value={focusVal}
                            onChange={(e) => setFocusVal(e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition"
                            placeholder="¿Cuál es el objetivo?"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
                        <select
                            value={categoryVal}
                            onChange={(e) => setCategoryVal(e.target.value as any)}
                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition"
                        >
                            <option value="living">Vida / Rutina</option>
                            <option value="work">Trabajo / Estudio</option>
                            <option value="motivation">Motivación / Ejercicio</option>
                        </select>
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
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-green-900/20 transition transform active:scale-95"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityModal;
