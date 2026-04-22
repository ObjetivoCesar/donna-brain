import React, { useState, useEffect } from 'react';
import { nutritionService } from '../services/NutritionService';
import { FoodItem, UserGoals, MealType } from '../types';
import MacroRings from './MacroRings';
import AddFoodModal from './AddFoodModal';
import NutritionSettingsModal from './NutritionSettingsModal';
import { Plus, Settings, ChevronLeft, ChevronRight, Trash2, Utensils } from 'lucide-react';

const NutritionDashboard: React.FC = () => {
    const [date, setDate] = useState(new Date());
    const [logs, setLogs] = useState<FoodItem[]>([]);
    const [goals, setGoals] = useState<UserGoals>({ calories: 0, protein: 0, carbs: 0, fat: 0 }); // Placeholder
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [date]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dailyLogs, userGoals] = await Promise.all([
                nutritionService.getFoodLogs(date),
                nutritionService.getUserGoals()
            ]);
            setLogs(dailyLogs);
            setTotals(nutritionService.calculateDailyTotals(dailyLogs));
            setGoals(userGoals);
        } catch (error) {
            console.error('Error loading nutrition data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Borrar registro?')) {
            await nutritionService.deleteFoodLog(id);
            loadData();
        }
    };

    const changeDate = (days: number) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        setDate(newDate);
    };

    return (
        <div className="w-full bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col h-full animate-fade-in mb-24">
            {/* Header Style from WeeklyProgressTable */}
            <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => changeDate(-1)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            📊 Registro Diario
                        </h2>
                        <p className="text-sm text-gray-400">
                            {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <button onClick={() => changeDate(1)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-medium shadow-lg shadow-green-900/20"
                    >
                        <Plus size={14} />
                        Registrar Comida
                    </button>
                    <button
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <Settings size={16} />
                        Config
                    </button>
                </div>
            </div>

            {/* Macro Summary (Keeping Rings but making them smaller or integrating?) 
                For now, let's keep the Rings as a summary row/section before the table.
            */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/30 flex justify-center">
                <MacroRings consumed={totals} goals={goals} />
            </div>

            {/* Table View */}
            <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr>
                            <th className="sticky left-0 bg-gray-900 z-10 p-4 font-medium text-gray-400 border-b border-gray-800 w-1/4">Hora / Tipo</th>
                            <th className="p-4 font-medium border-b border-gray-800 text-gray-400 w-1/3">Alimento</th>
                            <th className="p-4 font-medium border-b border-gray-800 text-center text-gray-400">Macros (P/C/F)</th>
                            <th className="p-4 font-medium border-b border-gray-800 text-center text-gray-400">Kcal</th>
                            <th className="p-4 font-medium border-b border-gray-800 text-center text-gray-400">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Cargando datos...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                    No hay comidas registradas para hoy.
                                </td>
                            </tr>
                        ) : (
                            logs.slice().sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(log => (
                                <tr key={log.id} className="group hover:bg-gray-800/30 transition">
                                    <td className="sticky left-0 bg-gray-900 group-hover:bg-gray-800/30 z-10 p-4 text-white font-medium border-r border-gray-800">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-green-400">{log.meal}</span>
                                            <span className="text-xs text-gray-500">{log.time || '--:--'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        {log.name}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2 text-xs">
                                            <span className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">{log.protein}p</span>
                                            <span className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">{log.carbs}c</span>
                                            <span className="text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">{log.fat}f</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-white font-bold">
                                        {log.calories}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleDelete(log.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}

                        {/* Totals Row */}
                        {logs.length > 0 && (
                            <tr className="bg-gray-800/50 font-bold">
                                <td className="sticky left-0 bg-gray-800/50 z-10 p-4 text-white border-r border-gray-700 text-right">TOTAL</td>
                                <td className="p-4"></td>
                                <td className="p-4 text-center text-xs">
                                    <span className="text-blue-300 mx-1">{totals.protein}g</span>
                                    <span className="text-yellow-300 mx-1">{totals.carbs}g</span>
                                    <span className="text-red-300 mx-1">{totals.fat}g</span>
                                </td>
                                <td className="p-4 text-center text-green-400 text-lg">
                                    {totals.calories}
                                </td>
                                <td className="p-4"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <AddFoodModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={loadData}
            />

            <NutritionSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onUpdate={loadData}
            />
        </div>
    );
};

export default NutritionDashboard;
