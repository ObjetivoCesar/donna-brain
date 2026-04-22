import React, { useState } from 'react';
import { ExerciseConfig, WorkoutSet, SetType } from '../types';
import RestTimer from './RestTimer';
import WorkoutService from '../services/WorkoutService';

interface LiveWorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercise: ExerciseConfig;
}

const LiveWorkoutModal: React.FC<LiveWorkoutModalProps> = ({ isOpen, onClose, exercise }) => {
    const [sets, setSets] = useState<WorkoutSet[]>([]);
    const [currentSet, setCurrentSet] = useState<Partial<WorkoutSet>>({
        type: 'working',
        weight: 0,
        reps: 0,
        restTime: exercise.targetRest,
        completed: false
    });
    const [showTimer, setShowTimer] = useState(false);
    const [sessionNotes, setSessionNotes] = useState('');
    const [lastStats, setLastStats] = useState<{ weight: number, reps: number } | null>(null);

    // Get last session stats for reference
    React.useEffect(() => {
        const loadStats = async () => {
            const stats = await WorkoutService.getLastSessionStats(exercise.id);
            setLastStats(stats);
        };
        loadStats();
    }, [exercise.id]);

    if (!isOpen) return null;

    const handleAddSet = () => {
        if (!currentSet.weight || !currentSet.reps) {
            alert('⚠️ Por favor ingresa peso y repeticiones.');
            return;
        }

        const newSet: WorkoutSet = {
            id: crypto.randomUUID(),
            type: currentSet.type as SetType,
            weight: currentSet.weight,
            reps: currentSet.reps,
            rpe: currentSet.rpe,
            restTime: currentSet.restTime || exercise.targetRest,
            completed: true
        };

        setSets([...sets, newSet]);

        // Reset for next set, keeping weight
        setCurrentSet({
            ...currentSet,
            reps: 0,
            completed: false
        });

        // Show timer
        setShowTimer(true);
    };

    const handleFinishWorkout = async () => {
        if (sets.length === 0) {
            alert('⚠️ Debes completar al menos una serie.');
            return;
        }

        // Save session
        await WorkoutService.logExerciseSession(exercise.id, exercise.name, sets, sessionNotes);

        alert(`✅ Sesión guardada: ${sets.length} series completadas.`);
        onClose();

        // Reset state
        setSets([]);
        setSessionNotes('');
        setShowTimer(false);
    };

    const handleDeleteSet = (setId: string) => {
        setSets(sets.filter(s => s.id !== setId));
    };

    // Check if user hit target reps for progressive overload
    const checkProgressiveOverload = () => {
        if (sets.length === 0) return null;

        // Parse target reps (e.g., "8-12" or "15/12/10/8")
        const targetMatch = exercise.targetReps.match(/(\d+)-(\d+)/);
        if (targetMatch) {
            const maxTarget = parseInt(targetMatch[2]);
            const lastSet = sets[sets.length - 1];
            if (lastSet.reps >= maxTarget) {
                return '🎯 ¡Meta alcanzada! Considera subir el peso la próxima vez.';
            }
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up overflow-y-auto">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
                        <p className="text-sm text-gray-400">Meta: {exercise.targetReps} reps | Descanso: {exercise.targetRest}s</p>
                        {lastStats && (
                            <p className="text-xs text-green-400 mt-1">
                                Última vez: {lastStats.weight}kg x {lastStats.reps} reps
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Set Input */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">Nueva Serie</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Tipo</label>
                                <select
                                    value={currentSet.type}
                                    onChange={(e) => setCurrentSet({ ...currentSet, type: e.target.value as SetType })}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-red-400 focus:outline-none text-sm"
                                >
                                    <option value="warmup">Calentamiento</option>
                                    <option value="working">Trabajo</option>
                                    <option value="failure">Al fallo</option>
                                    <option value="drop">Drop set</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={currentSet.weight || ''}
                                    onChange={(e) => setCurrentSet({ ...currentSet, weight: parseFloat(e.target.value) })}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-red-400 focus:outline-none text-sm"
                                    placeholder="20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Repeticiones</label>
                                <input
                                    type="number"
                                    value={currentSet.reps || ''}
                                    onChange={(e) => setCurrentSet({ ...currentSet, reps: parseInt(e.target.value) })}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-red-400 focus:outline-none text-sm"
                                    placeholder="12"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">RPE (1-10) - Opcional</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={currentSet.rpe || ''}
                                    onChange={(e) => setCurrentSet({ ...currentSet, rpe: parseInt(e.target.value) })}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-red-400 focus:outline-none text-sm"
                                    placeholder="8"
                                />
                            </div>
                            <button
                                onClick={handleAddSet}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                                ✅ Completar Serie
                            </button>
                        </div>

                        {/* Progressive Overload Alert */}
                        {checkProgressiveOverload() && (
                            <div className="mt-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm">
                                {checkProgressiveOverload()}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Timer & History */}
                    <div className="space-y-4">
                        {showTimer && (
                            <RestTimer
                                initialSeconds={currentSet.restTime || exercise.targetRest}
                                onComplete={() => setShowTimer(false)}
                                autoStart={true}
                            />
                        )}

                        {/* Completed Sets */}
                        <div>
                            <h3 className="text-white font-semibold mb-2 text-sm">Series Completadas ({sets.length})</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {sets.map((set, index) => (
                                    <div key={set.id} className="bg-white/5 border border-white/10 rounded-lg p-2 flex justify-between items-center">
                                        <div className="text-sm">
                                            <span className="text-gray-400">#{index + 1}</span>
                                            <span className="text-white font-bold ml-2">{set.weight}kg</span>
                                            <span className="text-gray-400 mx-1">x</span>
                                            <span className="text-white font-bold">{set.reps}</span>
                                            {set.rpe && <span className="text-gray-500 ml-2 text-xs">RPE {set.rpe}</span>}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSet(set.id)}
                                            className="text-red-400 hover:text-red-300 text-xs"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Notes */}
                <div className="mt-4">
                    <label className="block text-sm text-gray-300 mb-1">Notas de la Sesión</label>
                    <textarea
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-red-400 focus:outline-none text-sm resize-none"
                        rows={2}
                        placeholder="Ej: Me sentí fuerte hoy, podría subir peso..."
                    />
                </div>

                {/* Finish Button */}
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleFinishWorkout}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        💾 Finalizar Ejercicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveWorkoutModal;
