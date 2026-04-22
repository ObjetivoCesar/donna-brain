import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { MealType, SavedMeal, UserGoals } from '../types';
import { nutritionService } from '../services/NutritionService';

interface NutritionSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void; // Para refrescar datos en el componente padre
}

const NutritionSettingsModal: React.FC<NutritionSettingsModalProps> = ({ isOpen, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'goals' | 'meals' | 'data'>('goals');
    const [goals, setGoals] = useState<UserGoals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state for new saved meal
    const [newMealName, setNewMealName] = useState('');
    const [newMealDescription, setNewMealDescription] = useState(''); // Nueva descripción para IA
    const [newMealCalories, setNewMealCalories] = useState(0);
    const [newMealProtein, setNewMealProtein] = useState(0);
    const [newMealCarbs, setNewMealCarbs] = useState(0);
    const [newMealFat, setNewMealFat] = useState(0);

    const [importData, setImportData] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [g, m] = await Promise.all([
                nutritionService.getUserGoals(),
                nutritionService.getSavedMeals()
            ]);
            setGoals(g);
            setSavedMeals(m);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGoals = async () => {
        setLoading(true);
        await nutritionService.saveUserGoals(goals);
        setLoading(false);
        onUpdate();
        alert('Metas actualizadas correctamente');
    };

    const handleAICalculate = () => {
        if (!newMealDescription) return alert('Escribe en la descripción qué ingredientes tiene tu comida.');

        // Simulación o mensaje informativo
        alert(
            `✨ ¡Función de Cálculo IA!\n\n` +
            `Mañana conectaremos el "Cerebro" (Backend) para hacer esto automático.\n\n` +
            `Por hoy: Copia tu descripción ("${newMealDescription}") y pégasela a Antigravity en el chat. Él te dará los números para rellenar aquí abajo.`
        );
    };

    const handleCreateMeal = async () => {
        if (!newMealName) return alert('Nombre requerido');

        const newMeal: SavedMeal = {
            id: crypto.randomUUID(),
            name: newMealName,
            calories: Number(newMealCalories),
            protein: Number(newMealProtein),
            carbs: Number(newMealCarbs),
            fat: Number(newMealFat),
            defaultMealType: MealType.SNACK // Default genérico
        };

        setLoading(true);
        await nutritionService.addSavedMeal(newMeal);
        const meals = await nutritionService.getSavedMeals();
        setSavedMeals(meals);
        setLoading(false);

        // Reset form
        setNewMealName('');
        setNewMealDescription('');
        setNewMealCalories(0);
        setNewMealProtein(0);
        setNewMealCarbs(0);
        setNewMealFat(0);

        onUpdate();
    };

    const handleDeleteMeal = async (id: string) => {
        if (confirm('¿Eliminar esta comida guardada?')) {
            setLoading(true);
            await nutritionService.deleteSavedMeal(id);
            const meals = await nutritionService.getSavedMeals();
            setSavedMeals(meals);
            setLoading(false);
            onUpdate();
        }
    };

    const handleExport = () => {
        const data = nutritionService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitai_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleImport = async () => {
        if (!importData) return alert('Pega el JSON primero');
        alert('⚠️ La importación JSON solo afecta al almacenamiento local. Se recomienda usar la sincronización de Supabase.');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">Configuración Nutrición</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('goals')}
                        className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'goals' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Metas Diarias
                    </button>
                    <button
                        onClick={() => setActiveTab('meals')}
                        className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'meals' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Mis Comidas
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'data' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Backup / Datos
                    </button>
                </div>

                <div className="p-6">
                    {/* --- GOALS TAB --- */}
                    {activeTab === 'goals' && (
                        <div className="space-y-4">
                            <h3 className="text-white font-semibold mb-4">Ajusta tus objetivos diarios</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Calorías (kcal)</label>
                                    <input
                                        type="number"
                                        value={goals.calories}
                                        onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
                                        className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Proteína (g)</label>
                                    <input
                                        type="number"
                                        value={goals.protein}
                                        onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                                        className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Carbohidratos (g)</label>
                                    <input
                                        type="number"
                                        value={goals.carbs}
                                        onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                                        className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Grasa (g)</label>
                                    <input
                                        type="number"
                                        value={goals.fat}
                                        onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })}
                                        className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSaveGoals}
                                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg mt-4"
                            >
                                Guardar Metas
                            </button>
                        </div>
                    )}

                    {/* --- MEALS TAB --- */}
                    {activeTab === 'meals' && (
                        <div className="space-y-6">
                            {/* Formulario Crear */}
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <h3 className="text-white font-semibold mb-3 text-sm">Crear Nueva Comida Recurrente</h3>
                                <div className="space-y-3">
                                    <input
                                        placeholder="Nombre (ej. Mi Batido Pro)"
                                        value={newMealName}
                                        onChange={(e) => setNewMealName(e.target.value)}
                                        className="w-full bg-slate-900 text-white rounded-lg p-2 text-sm border border-slate-700"
                                    />

                                    {/* Nueva Sección IA */}
                                    <div className="flex gap-2">
                                        <textarea
                                            placeholder="Descríbelo aquí (ej: 2 huevos, 1/2 taza avena, 1 banana...)"
                                            value={newMealDescription}
                                            onChange={(e) => setNewMealDescription(e.target.value)}
                                            className="flex-1 bg-slate-900 text-white rounded-lg p-2 text-xs border border-slate-700 h-20 resize-none"
                                        />
                                        <button
                                            onClick={handleAICalculate}
                                            className="w-20 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/50 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors"
                                            title="Autocompletar Macros con IA"
                                        >
                                            <Sparkles size={18} />
                                            <span className="text-[10px] font-bold text-center leading-tight">Calc<br />IA</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        <input type="number" placeholder="Kcal" value={newMealCalories || ''} onChange={(e) => setNewMealCalories(Number(e.target.value))} className="bg-slate-900 text-white rounded-lg p-2 text-xs border border-slate-700" />
                                        <input type="number" placeholder="Prot" value={newMealProtein || ''} onChange={(e) => setNewMealProtein(Number(e.target.value))} className="bg-slate-900 text-white rounded-lg p-2 text-xs border border-slate-700" />
                                        <input type="number" placeholder="Carb" value={newMealCarbs || ''} onChange={(e) => setNewMealCarbs(Number(e.target.value))} className="bg-slate-900 text-white rounded-lg p-2 text-xs border border-slate-700" />
                                        <input type="number" placeholder="Fat" value={newMealFat || ''} onChange={(e) => setNewMealFat(Number(e.target.value))} className="bg-slate-900 text-white rounded-lg p-2 text-xs border border-slate-700" />
                                    </div>
                                    <button onClick={handleCreateMeal} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold">
                                        + Agregar Comida
                                    </button>
                                </div>
                            </div>

                            {/* Lista de Comidas Guardadas */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Comidas Guardadas</h3>
                                {savedMeals.length === 0 ? (
                                    <p className="text-slate-500 text-sm italic">No hay comidas guardadas aún.</p>
                                ) : (
                                    savedMeals.map(meal => (
                                        <div key={meal.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                                            <div>
                                                <p className="text-white font-medium text-sm">{meal.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {meal.calories} kcal | P:{meal.protein} C:{meal.carbs} F:{meal.fat}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteMeal(meal.id)}
                                                className="text-rose-500 hover:text-white p-2"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- DATA TAB --- */}
                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <h3 className="text-white font-semibold mb-2">Exportar Backup</h3>
                                <p className="text-slate-400 text-xs mb-3">Descarga todos tus registros y configuraciones en un archivo JSON.</p>
                                <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                    📩 Descargar JSON
                                </button>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <h3 className="text-white font-semibold mb-2">Importar Backup</h3>
                                <p className="text-slate-400 text-xs mb-3 text-red-400">⚠️ Esto restaurará tus datos y podría sobrescribir la configuración actual.</p>
                                <textarea
                                    value={importData}
                                    onChange={(e) => setImportData(e.target.value)}
                                    placeholder="Pega el contenido del JSON aquí..."
                                    className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white mb-2"
                                />
                                <button onClick={handleImport} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">
                                    📤 Restaurar desde JSON
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NutritionSettingsModal;
