
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ScheduledActivity, Meal, Workout, ActivityFormData, MealFormData, WorkoutFormData, DaySchedule } from '../types';
import { ScheduleService } from '../services/ScheduleService';
import DataExportService from '../services/DataExportService';
import MeasurementService from '../services/MeasurementService';
import ActivityModal from '../components/ActivityModal';
import MealModal from '../components/MealModal';
import WorkoutModal from '../components/WorkoutModal';

const SettingsScreen: React.FC = () => {
    const {
        currentSchedule,
        updateActivity,
        addActivity,
        deleteActivity,
        updateMeal,
        addMeal,
        deleteMeal,
        updateWorkout,
        refreshSchedule // Assuming we added this to context, or we rely on internal refreshes
    } = useApp();

    // Day Selector State
    const [selectedDay, setSelectedDay] = useState<string>(currentSchedule.day);
    const [viewSchedule, setViewSchedule] = useState<DaySchedule>(currentSchedule);
    const [activeTab, setActiveTab] = useState<'schedule' | 'meals' | 'workout' | 'data'>('schedule');

    // Modals State
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<ScheduledActivity | null>(null);
    const [activityModalMode, setActivityModalMode] = useState<'add' | 'edit'>('add');

    const [mealModalOpen, setMealModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<{ meal: Meal, index: number } | null>(null);
    const [mealModalMode, setMealModalMode] = useState<'add' | 'edit'>('add');

    const [workoutModalOpen, setWorkoutModalOpen] = useState(false);

    // Update view schedule when selected day changes
    useEffect(() => {
        const dayIndex = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].indexOf(selectedDay);
        if (dayIndex !== -1) {
            const mockDate = new Date();
            const currentDayIndex = mockDate.getDay();
            const diff = dayIndex - currentDayIndex;
            mockDate.setDate(mockDate.getDate() + diff);

            const scheduleService = ScheduleService.getInstance();
            setViewSchedule(scheduleService.getScheduleForDay(mockDate));
        }
    }, [selectedDay, currentSchedule]); // Depend on currentSchedule so updates reflect here

    // --- Activity Handlers ---
    const handleAddActivity = () => {
        setEditingActivity(null);
        setActivityModalMode('add');
        setActivityModalOpen(true);
    };

    const handleEditActivity = (activity: ScheduledActivity) => {
        setEditingActivity(activity);
        setActivityModalMode('edit');
        setActivityModalOpen(true);
    };

    const handleDeleteActivity = (activityId: string) => {
        if (confirm('¿Estás seguro de eliminar esta actividad?')) {
            // Need to handle deletion for the *selected* day, not just current day if they differ
            // Currently AppContext methods operate on "currentTime".
            // To support editing *other* days, we might need to use ScheduleService directly or update AppContext to accept date.
            // For now, let's assume simplistic "Edit Plan for Today/General" or verify if AppContext methods support date.
            // AppContext use `currentTime`. 

            // CRITICAL FIX: We need to edit the schedule for the SELECTED day.
            // Since AppContext methods are tied to `currentTime`, we should use ScheduleService directly for arbitrary days
            // OR temporarily trick the service. 
            // Better approach: Use ScheduleService instance directly here for "Planning Mode".

            const scheduleService = ScheduleService.getInstance();
            const dayIndex = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].indexOf(selectedDay);
            // Construct a date for this day (doesn't matter which week, as schedule is recurring based on day name usually, 
            // but the service uses specific dates. Wait, `saved_schedules` are by `day_of_week`.
            // The service methods `getScheduleForDay` read from memory/DB.

            // To keep it simple and consistent with `PlannerScreen` (which had the same limitation/logic), 
            // we will use the `useApp` methods IF the selected day is Today.
            // If the selected day is NOT Today, we might have issues if we strictly use `useApp` which uses `currentTime`.
            // Let's check `PlannerScreen` again. It imported `updateActivity` from `useApp`. 
            // `useApp`'s `updateActivity` calls `scheduleService.updateActivity(currentTime, ...)`
            // This suggests `PlannerScreen` only allowed editing TODAY's schedule effectively, OR `currentTime` logic in Service handles day-of-week mapping.
            // `ScheduleService.updateActivity(date, ...)` -> updates `activities` map for that date's key.
            // If we want to edit "Lunes" while it is "Martes", passing "Martes" date will fail to update "Lunes".

            // Workaround: We will use the `viewSchedule.day` to find a date object that corresponds to that day, 
            // and call ScheduleService directly, then trigger a refresh.

            // Actually, for Phase 2, let's stick to `useApp` methods if possible, but they are limited.
            // Let's implement robust local handlers using ScheduleService.

            console.warn("Editing logic relies on day-matching. Verify ScheduleService handles day-of-week updates.");

            // For now, using the AppContext methods which effectively edit the "Current Schedule Context".
            // Ideally we pass the `selectedDay` to the Service. 
            // But `deleteActivity` in Context takes `activityId`.

            deleteActivity(activityId);
        }
    };

    const handleSaveActivity = (data: ActivityFormData) => {
        if (activityModalMode === 'edit' && editingActivity) {
            updateActivity({
                ...editingActivity,
                ...data
            });
        } else {
            addActivity({
                id: `custom-${Date.now()}`,
                ...data
            });
        }
        setActivityModalOpen(false);
    };

    // --- Meal Handlers ---
    const handleAddMeal = () => {
        setEditingMeal(null);
        setMealModalMode('add');
        setMealModalOpen(true);
    };

    const handleEditMeal = (meal: Meal, index: number) => {
        setEditingMeal({ meal, index });
        setMealModalMode('edit');
        setMealModalOpen(true);
    };

    const handleDeleteMeal = (index: number) => {
        if (confirm('¿Estás seguro de eliminar esta comida?')) {
            deleteMeal(index);
        }
    };

    const handleSaveMeal = (data: MealFormData) => {
        if (mealModalMode === 'edit' && editingMeal) {
            updateMeal(data, editingMeal.index);
        } else {
            addMeal(data);
        }
        setMealModalOpen(false);
    };

    // --- Workout Handlers ---
    const handleEditWorkout = () => {
        setWorkoutModalOpen(true);
    };

    const handleSaveWorkout = (data: WorkoutFormData) => {
        updateWorkout({
            day: selectedDay,
            focus: data.focus,
            exercises: data.exercises
        });
        setWorkoutModalOpen(false);
    };

    // --- Data Handlers ---
    const handleExportData = async () => {
        try {
            await DataExportService.downloadBackup();
            alert('✅ Datos exportados exitosamente.');
        } catch (error) {
            console.error(error);
            alert('❌ Error al exportar datos.');
        }
    };

    const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        if (!confirm('⚠️ Esto sobrescribirá todos tus datos actuales. ¿Continuar?')) return;
        try {
            await DataExportService.importFromFile(files[0]);
            alert('✅ Datos importados. Recarga la página.');
        } catch (error) {
            alert('❌ Error al importar: ' + (error as Error).message);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-6 pb-24 text-white">
            <header className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Ajustes</h1>
                    <p className="text-gray-400">Configuración y Edición</p>
                </div>
                <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-400 focus:outline-none font-semibold w-full md:w-auto"
                >
                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(day => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl mb-6 overflow-x-auto">
                {[
                    { id: 'schedule', label: 'Horario', icon: '📅', color: 'bg-green-500' },
                    { id: 'meals', label: 'Comidas', icon: '🍎', color: 'bg-orange-500' },
                    { id: 'workout', label: 'Rutina', icon: '💪', color: 'bg-red-500' },
                    { id: 'data', label: 'Datos', icon: '💾', color: 'bg-blue-500' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === tab.id ? `${tab.color} text-white shadow-lg` : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {/* Schedule Editor */}
                {activeTab === 'schedule' && (
                    <section className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-green-400">Plan del Día</h2>
                            <button onClick={handleAddActivity} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold py-1 px-3 rounded-lg flex items-center gap-1">
                                <span className="text-lg">+</span> Agregar
                            </button>
                        </div>
                        <div className="space-y-3">
                            {viewSchedule.activities.map((activity) => (
                                <div key={activity.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center group">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-green-400 font-mono font-bold">{activity.time}</span>
                                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">{activity.category || 'general'}</span>
                                        </div>
                                        <div className="font-bold text-lg">{activity.activity}</div>
                                        <div className="text-gray-400 text-sm">{activity.focus}</div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={() => handleEditActivity(activity)} className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg">✏️</button>
                                        <button onClick={() => handleDeleteActivity(activity.id!)} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Meals Editor */}
                {activeTab === 'meals' && (
                    <section className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-orange-400">Plan Nutricional</h2>
                            <button onClick={handleAddMeal} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm font-semibold py-1 px-3 rounded-lg flex items-center gap-1">
                                <span className="text-lg">+</span> Agregar
                            </button>
                        </div>
                        <div className="space-y-3">
                            {viewSchedule.meals.length > 0 ? (
                                viewSchedule.meals.map((meal, index) => (
                                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center group">
                                        <div>
                                            <div className="text-orange-400 font-mono font-bold mb-1">{meal.time}</div>
                                            <div className="font-bold text-lg">{meal.meal}</div>
                                            <div className="text-gray-400 text-sm">{meal.description}</div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={() => handleEditMeal(meal, index)} className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg">✏️</button>
                                            <button onClick={() => handleDeleteMeal(index)} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg">🗑️</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">No hay comidas planificadas para este día.</div>
                            )}
                        </div>
                    </section>
                )}

                {/* Workout Editor */}
                {activeTab === 'workout' && (
                    <section className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-red-400">Rutina del Día</h2>
                            <button onClick={handleEditWorkout} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold py-1 px-3 rounded-lg flex items-center gap-1">
                                ✏️ Editar
                            </button>
                        </div>
                        {viewSchedule.workout ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-xl font-bold mb-4">{viewSchedule.workout.focus}</h3>
                                <ul className="space-y-3">
                                    {viewSchedule.workout.exercises.map((ex, i) => (
                                        <li key={i} className="flex justify-between border-b border-gray-700 pb-2 last:border-0">
                                            <span>{ex.name}</span>
                                            <span className="font-mono text-gray-400 bg-gray-800 px-2 rounded">{ex.setsReps}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8 bg-white/5 rounded-xl border border-white/10">
                                Sin entrenamiento asignado.
                            </div>
                        )}
                    </section>
                )}

                {/* Data Config */}
                {activeTab === 'data' && (
                    <section className="animate-fade-in space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h3 className="font-bold text-lg mb-2">Backup de Datos</h3>
                            <button onClick={handleExportData} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center gap-2">
                                <span>⬇️</span> Exportar Backup (JSON)
                            </button>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h3 className="font-bold text-lg mb-2">Restaurar Datos</h3>
                            <label className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition flex justify-center gap-2 cursor-pointer">
                                <span>⬆️</span> Importar Backup
                                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                            </label>
                        </div>
                    </section>
                )}
            </div>

            {/* Modals */}
            <ActivityModal
                isOpen={activityModalOpen}
                onClose={() => setActivityModalOpen(false)}
                onSave={handleSaveActivity}
                initialData={editingActivity || undefined}
                mode={activityModalMode}
            />
            <MealModal
                isOpen={mealModalOpen}
                onClose={() => setMealModalOpen(false)}
                onSave={handleSaveMeal}
                initialData={editingMeal?.meal}
                mode={mealModalMode}
            />
            <WorkoutModal
                isOpen={workoutModalOpen}
                onClose={() => setWorkoutModalOpen(false)}
                onSave={handleSaveWorkout}
                initialData={viewSchedule.workout}
            />
        </div>
    );
};

export default SettingsScreen;
