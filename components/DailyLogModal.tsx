import React, { useState, useEffect } from 'react';
import { X, Save, Activity, Scale, Moon, Zap, Brain, Battery } from 'lucide-react';
import MeasurementService from '../services/MeasurementService';
import { DailyLog } from '../types';

interface DailyLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
    initialDate?: string;
}

const HABIT_LABELS = {
    sleepQuality: { label: 'Calidad de Sueño', icon: Moon, desc: '0 (Pésimo) - 5 (Excelente)' },
    stressLevel: { label: 'Nivel de Estrés', icon: Brain, desc: '0 (Zen) - 5 (Pánico)' },
    hungerLevel: { label: 'Nivel de Hambre', icon: Zap, desc: '0 (Saciado) - 5 (Hambriento)' },
    fatigueLevel: { label: 'Fatiga / Letargo', icon: Battery, desc: '0 (Energético) - 5 (Agotado)' }
};

const DailyLogModal: React.FC<DailyLogModalProps> = ({ isOpen, onClose, onSave, initialDate }) => {
    // Current date YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(initialDate || today);

    const [formData, setFormData] = useState({
        weight: '',
        steps: '',
        notes: ''
    });

    const [habits, setHabits] = useState({
        sleepQuality: 3,
        stressLevel: 2,
        hungerLevel: 2,
        fatigueLevel: 2
    });

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                // Try to load existing log for this date
                const logs = await MeasurementService.getDailyLogs();
                const existing = logs.find(l => l.date === date);
                if (existing) {
                    setFormData({
                        weight: existing.weight.toString(),
                        steps: existing.steps?.toString() || '',
                        notes: existing.notes || ''
                    });
                    setHabits(existing.habits);
                } else {
                    // Reset defaults
                    setFormData({ weight: '', steps: '', notes: '' });
                    setHabits({ sleepQuality: 3, stressLevel: 2, hungerLevel: 2, fatigueLevel: 2 });
                }
            };
            loadData();
        }
    }, [isOpen, date]);

    const handleHabitChange = (key: keyof typeof habits, value: number) => {
        setHabits(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!formData.weight) {
            alert('El peso es obligatorio');
            return;
        }

        const log: DailyLog = {
            id: crypto.randomUUID(),
            date: date,
            weight: parseFloat(formData.weight),
            steps: formData.steps ? parseInt(formData.steps) : undefined,
            habits: habits,
            notes: formData.notes,
            createdAt: new Date().toISOString()
        };

        await MeasurementService.saveDailyLog(log);
        if (onSave) onSave();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
            <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-blue-500" size={20} />
                        Registro Diario
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">

                    {/* Date Picker */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-400">Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Metrics: Weight & Steps */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-2 text-blue-400">
                                <Scale size={18} />
                                <span className="text-sm font-medium">Peso (kg)</span>
                            </div>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={formData.weight}
                                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder-gray-600"
                            />
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-2 text-green-400">
                                <Zap size={18} />
                                <span className="text-sm font-medium">Pasos</span>
                            </div>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.steps}
                                onChange={(e) => setFormData(prev => ({ ...prev, steps: e.target.value }))}
                                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Habits Sliders */}
                    <div className="space-y-4">
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Hábitos Diarios</h3>

                        {(Object.keys(habits) as Array<keyof typeof habits>).map((key) => {
                            const info = HABIT_LABELS[key];
                            const Icon = info.icon;

                            return (
                                <div key={key} className="bg-gray-800/30 p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Icon size={16} />
                                            <span className="text-sm font-medium">{info.label}</span>
                                        </div>
                                        <span className={`text-sm font-bold w-6 text-center ${habits[key] > 3 ? 'text-red-400' : 'text-green-400'}`}>
                                            {habits[key]}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="1"
                                        value={habits[key]}
                                        onChange={(e) => handleHabitChange(key, parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <p className="text-xs text-center text-gray-500 mt-1">{info.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 text-sm font-medium hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-medium flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Save size={18} />
                        Guardar Registro
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyLogModal;
