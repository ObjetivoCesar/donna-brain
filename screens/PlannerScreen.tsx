import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { ScheduledActivity, Meal, Workout, Exercise, BodyMeasurements, ExerciseConfig, DaySchedule } from '../types';
import MeasurementService from '../services/MeasurementService';
import PhotoStorageService from '../services/PhotoStorageService';
import DataExportService from '../services/DataExportService';
import { ScheduleService } from '../services/ScheduleService';
import LiveWorkoutModal from '../components/LiveWorkoutModal';
import NutritionDashboard from '../components/NutritionDashboard';
import PhotoDisplay from '../components/PhotoDisplay';
import DailyLogModal from '../components/DailyLogModal';
import WeeklyProgressTable from '../components/WeeklyProgressTable';

type Pillar = 'living' | 'motivation' | 'work';

interface ActivityFormData {
    id?: string;
    time: string;
    activity: string;
    focus: string;
    category: Pillar;
}

interface MealFormData {
    time: string;
    meal: string;
    description: string;
}

interface WorkoutFormData {
    focus: string;
    exercises: Exercise[];
}

const ActivityModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ActivityFormData) => void;
    initialData?: ActivityFormData;
    mode: 'add' | 'edit';
}> = ({ isOpen, onClose, onSave, initialData, mode }) => {
    const [formData, setFormData] = useState<ActivityFormData>(
        initialData || { time: '', activity: '', focus: '', category: 'living' }
    );

    // Reset form when opening for add
    React.useEffect(() => {
        if (isOpen && !initialData) {
            setFormData({ time: '', activity: '', focus: '', category: 'living' });
        } else if (isOpen && initialData) {
            setFormData(initialData);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">
                    {mode === 'add' ? 'Nueva Actividad' : 'Editar Actividad'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Horario</label>
                        <input
                            type="text"
                            placeholder="08:00-09:00"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Actividad</label>
                        <input
                            type="text"
                            placeholder="Nombre de la actividad"
                            value={formData.activity}
                            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Enfoque</label>
                        <textarea
                            placeholder="Descripción del enfoque"
                            value={formData.focus}
                            onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-400 focus:outline-none resize-none"
                            rows={3}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as Pillar })}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-400 focus:outline-none"
                        >
                            <option value="living">Living</option>
                            <option value="motivation">Motivation</option>
                            <option value="work">Work</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MealModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: MealFormData) => void;
    initialData?: MealFormData;
    mode: 'add' | 'edit';
}> = ({ isOpen, onClose, onSave, initialData, mode }) => {
    const [formData, setFormData] = useState<MealFormData>(
        initialData || { time: '', meal: '', description: '' }
    );

    React.useEffect(() => {
        if (isOpen && !initialData) {
            setFormData({ time: '', meal: '', description: '' });
        } else if (isOpen && initialData) {
            setFormData(initialData);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">
                    {mode === 'add' ? 'Nueva Comida' : 'Editar Comida'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Horario</label>
                        <input
                            type="text"
                            placeholder="08:00 a.m."
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-orange-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Comida</label>
                        <input
                            type="text"
                            placeholder="Desayuno"
                            value={formData.meal}
                            onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-orange-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                        <textarea
                            placeholder="Detalles de la comida"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-orange-400 focus:outline-none resize-none"
                            rows={3}
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const WorkoutModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: WorkoutFormData) => void;
    initialData?: WorkoutFormData;
}> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<WorkoutFormData>(
        initialData || { focus: '', exercises: [] }
    );

    React.useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        } else if (isOpen && !initialData) {
            setFormData({ focus: '', exercises: [] });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleAddExercise = () => {
        setFormData({
            ...formData,
            exercises: [...formData.exercises, { name: '', setsReps: '' }]
        });
    };

    const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
        const newExercises = [...formData.exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setFormData({ ...formData, exercises: newExercises });
    };

    const handleRemoveExercise = (index: number) => {
        const newExercises = formData.exercises.filter((_, i) => i !== index);
        setFormData({ ...formData, exercises: newExercises });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-4">Editar Entrenamiento</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Enfoque Principal</label>
                        <input
                            type="text"
                            placeholder="Ej: Pierna y Glúteo"
                            value={formData.focus}
                            onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-red-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Ejercicios</label>
                        <div className="space-y-3">
                            {formData.exercises.map((ex, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Nombre del ejercicio"
                                            value={ex.name}
                                            onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-1.5 border border-gray-600 text-sm focus:border-red-400 focus:outline-none"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Series x Reps"
                                            value={ex.setsReps}
                                            onChange={(e) => handleExerciseChange(index, 'setsReps', e.target.value)}
                                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-1.5 border border-gray-600 text-sm focus:border-red-400 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExercise(index)}
                                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg mt-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddExercise}
                            className="mt-3 text-sm text-red-400 hover:text-red-300 font-medium flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Agregar Ejercicio
                        </button>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PlannerScreen: React.FC = () => {
    const {
        currentSchedule,
        updateActivity,
        addActivity,
        deleteActivity,
        updateMeal,
        addMeal,
        deleteMeal,
        updateWorkout
    } = useApp();

    // Activity Modal State
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<ScheduledActivity | null>(null);
    const [activityModalMode, setActivityModalMode] = useState<'add' | 'edit'>('add');

    // Meal Modal State
    const [mealModalOpen, setMealModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<{ meal: Meal, index: number } | null>(null);
    const [mealModalMode, setMealModalMode] = useState<'add' | 'edit'>('add');

    // Workout Modal State
    const [workoutModalOpen, setWorkoutModalOpen] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<'schedule' | 'nutrition' | 'workout' | 'measurements' | 'config'>('schedule');

    // Measurements State
    // New Phase 4 State
    const [dailyLogOpen, setDailyLogOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);



    // Live Workout State
    const [liveWorkoutOpen, setLiveWorkoutOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);

    // Day Selector State
    const [selectedDay, setSelectedDay] = useState<string>(currentSchedule.day);
    const [viewSchedule, setViewSchedule] = useState<DaySchedule>(currentSchedule);

    // Update view schedule when selected day changes
    React.useEffect(() => {
        const dayIndex = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].indexOf(selectedDay);
        if (dayIndex !== -1) {
            const mockDate = new Date();
            mockDate.setDate(mockDate.getDate() - mockDate.getDay() + dayIndex);
            const scheduleService = ScheduleService.getInstance();
            setViewSchedule(scheduleService.getScheduleForDay(mockDate));
        }
    }, [selectedDay]);

    // Reset to current day when currentSchedule changes
    React.useEffect(() => {
        setSelectedDay(currentSchedule.day);
        setViewSchedule(currentSchedule);
    }, [currentSchedule]);

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
            deleteActivity(activityId);
        }
    };

    const handleSaveActivity = (data: ActivityFormData) => {
        if (activityModalMode === 'edit' && editingActivity) {
            updateActivity({
                ...editingActivity,
                time: data.time,
                activity: data.activity,
                focus: data.focus,
                category: data.category
            });
        } else {
            const newActivity: ScheduledActivity = {
                id: `custom-${Date.now()}`,
                time: data.time,
                activity: data.activity,
                focus: data.focus,
                category: data.category
            };
            addActivity(newActivity);
        }
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
    };

    // --- Workout Handlers ---
    const handleEditWorkout = () => {
        setWorkoutModalOpen(true);
    };

    const handleSaveWorkout = (data: WorkoutFormData) => {
        const updatedWorkout: Workout = {
            day: currentSchedule.workout?.day || currentSchedule.day, // Fallback
            focus: data.focus,
            exercises: data.exercises
        };
        updateWorkout(updatedWorkout);
    };



    // --- Export/Import Handlers ---
    const handleExportData = async () => {
        try {
            await DataExportService.downloadBackup();
            alert('✅ Datos exportados exitosamente.');
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('❌ Error al exportar datos.');
        }
    };

    const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        if (!confirm('⚠️ Esto sobrescribirá todos tus datos actuales. ¿Continuar?')) {
            return;
        }

        try {
            await DataExportService.importFromFile(file);
            // Reload measurements after import
            const history = await MeasurementService.getHistory();
            setRefreshTrigger(prev => prev + 1);
            alert('✅ Datos importados exitosamente. Recarga la página para ver todos los cambios.');
        } catch (error) {
            console.error('Error importing data:', error);
            alert('❌ Error al importar datos: ' + (error as Error).message);
        }
    };

    // --- Live Workout Handlers ---
    const handleStartExercise = (exercise: Exercise, index: number) => {
        // Convert old Exercise format to ExerciseConfig
        const exerciseConfig: ExerciseConfig = {
            id: `${currentSchedule.day}-ex-${index}`,
            name: exercise.name,
            targetReps: exercise.setsReps, // Use the old setsReps as target
            targetRest: 120, // Default 2 minutes
            notes: '',
            history: []
        };
        setSelectedExercise(exerciseConfig);
        setLiveWorkoutOpen(true);
    };

    return (
        <>
            <div className="min-h-screen p-4 md:p-6 pb-24">
                <header className="mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Planner</h1>
                            <p className="text-gray-400">{viewSchedule.day}</p>
                        </div>
                        <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-400 focus:outline-none text-sm font-semibold"
                        >
                            <option value="Lunes">Lunes</option>
                            <option value="Martes">Martes</option>
                            <option value="Miércoles">Miércoles</option>
                            <option value="Jueves">Jueves</option>
                            <option value="Viernes">Viernes</option>
                            <option value="Sábado">Sábado</option>
                            <option value="Domingo">Domingo</option>
                        </select>
                    </div>
                </header>

                {/* Tabs Navigation */}
                <div className="flex p-1 bg-white/5 rounded-xl mb-6">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'schedule' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Horario
                    </button>
                    <button
                        onClick={() => setActiveTab('nutrition')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'nutrition' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Nutrición
                    </button>
                    <button
                        onClick={() => setActiveTab('workout')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'workout' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Entreno
                    </button>
                    <button
                        onClick={() => setActiveTab('measurements')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'measurements' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Medidas
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'config' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Config
                    </button>
                </div>

                <div className="space-y-6 min-h-[400px]">
                    {/* Activities Section */}
                    {activeTab === 'schedule' && (
                        <section className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-green-400 flex items-center">
                                    Actividades del Día
                                </h2>
                                <button
                                    onClick={handleAddActivity}
                                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold py-1 px-3 rounded-lg transition flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Agregar
                                </button>
                            </div>
                            <div className="space-y-3">
                                {viewSchedule.activities.map((activity) => (
                                    <div key={activity.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-green-400 font-mono text-sm font-bold">{activity.time}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${activity.category === 'work' ? 'bg-blue-500/20 text-blue-300' :
                                                    activity.category === 'motivation' ? 'bg-purple-500/20 text-purple-300' :
                                                        'bg-green-500/20 text-green-300'
                                                    }`}>
                                                    {activity.category || 'living'}
                                                </span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => handleEditActivity(activity)}
                                                        className="p-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-blue-300"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteActivity(activity.id!)}
                                                        className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded text-red-300"
                                                        title="Eliminar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-white font-bold text-lg">{activity.activity}</h3>
                                        <p className="text-gray-400 text-sm mt-1">{activity.focus}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Nutrition Section (FitAI) */}
                    {activeTab === 'nutrition' && (
                        <div className="p-4">
                            <NutritionDashboard />
                        </div>
                    )}

                    {/* Workout Section */}
                    {activeTab === 'workout' && (
                        <section className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-red-400 flex items-center">
                                    Rutina de Entrenamiento
                                </h2>
                                <button
                                    onClick={handleEditWorkout}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold py-1 px-3 rounded-lg transition flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Editar
                                </button>
                            </div>
                            {viewSchedule.workout ? (
                                <div className="space-y-3">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <h3 className="text-white font-bold text-lg mb-3">{viewSchedule.workout.focus}</h3>
                                        <div className="space-y-2">
                                            {viewSchedule.workout.exercises.map((ex, i) => (
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

                    {/* Measurements Section (Refactored Phase 4) */}
                    {activeTab === 'measurements' && (
                        <section className="animate-fade-in h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
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

                            {/* Weekly Table Component */}
                            {/* Weekly Table Component */}
                            {/* Weekly Table Component */}
                            <div className="flex-1 min-h-[500px]">
                                <WeeklyProgressTable
                                    refreshTrigger={refreshTrigger}
                                    onDataChange={() => setRefreshTrigger(prev => prev + 1)}
                                />
                            </div>

                            {/* Modals */}
                            {/* Modals */}
                            <DailyLogModal
                                isOpen={dailyLogOpen}
                                onClose={() => setDailyLogOpen(false)}
                                onSave={() => {
                                    setRefreshTrigger(prev => prev + 1);
                                    // Also reload legacy measurements for backward compatibility/history if needed
                                    // loadMeasurements();
                                }}
                            />
                        </section>
                    )}

                    {/* Configuration Section */}
                    {activeTab === 'config' && (
                        <section className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-blue-400 flex items-center">
                                    Configuración
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {/* Export/Import Section */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-white font-bold text-lg mb-4">Backup de Datos</h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Exporta todos tus datos (medidas, entrenamientos, nutrición) a un archivo JSON.
                                        <span className="block mt-2 text-yellow-400">⚠️ Nota: Las fotos permanecen en IndexedDB del navegador y no se incluyen en el backup.</span>
                                    </p>
                                    <button
                                        onClick={handleExportData}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Exportar Datos
                                    </button>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-white font-bold text-lg mb-4">Restaurar Datos</h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Importa datos desde un archivo de backup previamente exportado.
                                        <span className="block mt-2 text-red-400">⚠️ Advertencia: Esto sobrescribirá todos tus datos actuales.</span>
                                    </p>
                                    <label className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12" />
                                        </svg>
                                        Importar Datos
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImportData}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* Storage Info */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-white font-bold text-lg mb-4">Información de Almacenamiento</h3>
                                    <div className="space-y-2 text-sm text-gray-400">
                                        <p>✅ IndexedDB: Soportado</p>
                                        <p>📸 Fotos almacenadas en IndexedDB (local)</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div >
            </div >

            <ActivityModal
                isOpen={activityModalOpen}
                onClose={() => setActivityModalOpen(false)}
                onSave={handleSaveActivity}
                initialData={editingActivity ? {
                    id: editingActivity.id,
                    time: editingActivity.time,
                    activity: editingActivity.activity,
                    focus: editingActivity.focus,
                    category: editingActivity.category
                } : undefined}
                mode={activityModalMode}
            />

            <MealModal
                isOpen={mealModalOpen}
                onClose={() => setMealModalOpen(false)}
                onSave={handleSaveMeal}
                initialData={editingMeal ? editingMeal.meal : undefined}
                mode={mealModalMode}
            />

            <WorkoutModal
                isOpen={workoutModalOpen}
                onClose={() => setWorkoutModalOpen(false)}
                onSave={handleSaveWorkout}
                initialData={currentSchedule.workout ? {
                    focus: currentSchedule.workout.focus,
                    exercises: currentSchedule.workout.exercises
                } : undefined}
            />

            {
                selectedExercise && (
                    <LiveWorkoutModal
                        isOpen={liveWorkoutOpen}
                        onClose={() => {
                            setLiveWorkoutOpen(false);
                            setSelectedExercise(null);
                        }}
                        exercise={selectedExercise}
                    />
                )
            }
        </>
    );
};

export default PlannerScreen;
