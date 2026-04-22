
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Exercise, ExerciseConfig, ScheduledActivity, Meal, Workout } from '../types';
import WeeklyProgressTable from '../components/WeeklyProgressTable';
import DailyLogModal from '../components/DailyLogModal';
import NutritionDashboard from '../components/NutritionDashboard';
import LiveWorkoutModal from '../components/LiveWorkoutModal';
import MeasurementService from '../services/MeasurementService';

const RecordScreen: React.FC = () => {
    const { currentSchedule } = useApp();

    // Tab State
    const [activeTab, setActiveTab] = useState<'measurements' | 'nutrition' | 'workout'>('measurements');

    // Measurements State
    const [dailyLogOpen, setDailyLogOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Live Workout State
    const [liveWorkoutOpen, setLiveWorkoutOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);

    // --- Live Workout Handlers ---
    const handleStartExercise = (exercise: Exercise, index: number) => {
        const exerciseConfig: ExerciseConfig = {
            id: `${currentSchedule.day}-ex-${index}`,
            name: exercise.name,
            targetReps: exercise.setsReps,
            targetRest: 120,
            notes: '',
            history: []
        };
        setSelectedExercise(exerciseConfig);
        setLiveWorkoutOpen(true);
    };

    return (
        <div className="min-h-screen p-4 md:p-6 pb-24 text-white">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">Registro</h1>
                <p className="text-gray-400">Seguimiento y Progreso</p>
            </header>

            {/* Tabs Navigation */}
            <div className="flex p-1 bg-white/5 rounded-xl mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('measurements')}
                    className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'measurements' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Progreso
                </button>
                <button
                    onClick={() => setActiveTab('nutrition')}
                    className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'nutrition' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Nutrición
                </button>
                <button
                    onClick={() => setActiveTab('workout')}
                    className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'workout' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Entreno
                </button>
            </div>

            <div className="space-y-6">
                {/* Measurements Section */}
                {activeTab === 'measurements' && (
                    <section className="animate-fade-in h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                                Hub de Progreso
                            </h2>
                            <button
                                onClick={() => setDailyLogOpen(true)}
                                className="bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold py-2 px-4 rounded-full transition shadow-lg flex items-center gap-2 transform active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Registrar Día
                            </button>
                        </div>

                        <div className="flex-1 min-h-[500px]">
                            <WeeklyProgressTable
                                refreshTrigger={refreshTrigger}
                                onDataChange={() => setRefreshTrigger(prev => prev + 1)}
                            />
                        </div>
                    </section>
                )}

                {/* Nutrition Section */}
                {activeTab === 'nutrition' && (
                    <section className="animate-fade-in">
                        <NutritionDashboard />
                    </section>
                )}

                {/* Workout Section */}
                {activeTab === 'workout' && (
                    <section className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-red-400 flex items-center">
                                Entrenamiento de Hoy
                            </h2>
                        </div>
                        {currentSchedule.workout ? (
                            <div className="space-y-3">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <h3 className="text-white font-bold text-lg mb-3">{currentSchedule.workout.focus}</h3>
                                    <div className="space-y-2">
                                        {currentSchedule.workout.exercises.map((ex, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white/5 rounded-lg p-3 hover:bg-white/10 transition group">
                                                <div className="flex-1">
                                                    <span className="text-white font-semibold">{ex.name}</span>
                                                    <span className="text-gray-500 font-mono text-sm ml-2">Meta: {ex.setsReps}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleStartExercise(ex, i)}
                                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Iniciar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
                                No hay entrenamiento asignado para hoy.
                            </div>
                        )}
                    </section>
                )}
            </div>

            <DailyLogModal
                isOpen={dailyLogOpen}
                onClose={() => setDailyLogOpen(false)}
                onSave={() => {
                    setRefreshTrigger(prev => prev + 1);
                }}
            />

            {selectedExercise && (
                <LiveWorkoutModal
                    isOpen={liveWorkoutOpen}
                    onClose={() => {
                        setLiveWorkoutOpen(false);
                        setSelectedExercise(null);
                    }}
                    exercise={selectedExercise}
                />
            )}
        </div>
    );
};

export default RecordScreen;
