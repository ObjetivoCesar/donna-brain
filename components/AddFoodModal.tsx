import React, { useState } from 'react';
import { FoodItem, MealType, SavedMeal } from '../types';
import { geminiService } from '../services/GeminiService';
import { nutritionService } from '../services/NutritionService';

interface AddFoodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void; // Trigger refresh
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [step, setStep] = useState<'method' | 'analyzing' | 'review'>('method');
    const [methodTab, setMethodTab] = useState<'camera' | 'text' | 'manual' | 'favorites'>('camera');

    // Inputs
    const [inputText, setInputText] = useState('');
    const [manualData, setManualData] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Review Data
    const [reviewItem, setReviewItem] = useState<Partial<FoodItem>>({});
    const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            setStep('method');
            setReviewItem({});
            setInputText('');
            loadFavorites();
        }
    }, [isOpen]);

    const loadFavorites = async () => {
        const meals = await nutritionService.getSavedMeals();
        setSavedMeals(meals);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setStep('analyzing');
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                try {
                    const result = await geminiService.analyzeFood(base64, true);
                    setReviewItem({
                        name: result.foodName,
                        calories: result.calories,
                        protein: result.protein,
                        carbs: result.carbs,
                        fat: result.fat,
                        summary: result.summary,
                        meal: getMealTypeByTime()
                    });
                    setStep('review');
                } catch (error) {
                    alert('Error analizando la imagen. Intenta de nuevo.');
                    setStep('method');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTextSubmit = async () => {
        if (!inputText.trim()) return;
        setStep('analyzing');
        try {
            const result = await geminiService.analyzeFood(inputText, false);
            setReviewItem({
                name: result.foodName,
                calories: result.calories,
                protein: result.protein,
                carbs: result.carbs,
                fat: result.fat,
                summary: result.summary,
                meal: getMealTypeByTime()
            });
            setStep('review');
        } catch (error) {
            alert('Error analizando el texto.');
            setStep('method');
        }
    };

    const handleManualSubmit = () => {
        setReviewItem({
            name: manualData.name,
            calories: Number(manualData.calories),
            protein: Number(manualData.protein),
            carbs: Number(manualData.carbs),
            fat: Number(manualData.fat),
            meal: getMealTypeByTime()
        });
        setStep('review');
    };

    const handleFavoriteSelect = (meal: SavedMeal) => {
        setReviewItem({
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            meal: meal.defaultMealType || getMealTypeByTime()
        });
        setStep('review');
    };

    const handleSave = async () => {
        if (!reviewItem.name) return alert('El nombre es obligatorio');

        const newItem: FoodItem = {
            id: crypto.randomUUID(),
            name: reviewItem.name!,
            calories: Number(reviewItem.calories || 0),
            protein: Number(reviewItem.protein || 0),
            carbs: Number(reviewItem.carbs || 0),
            fat: Number(reviewItem.fat || 0),
            meal: reviewItem.meal || MealType.SNACK,
            timestamp: new Date().toISOString(),
            summary: reviewItem.summary
        };

        await nutritionService.addFoodLog(newItem);
        onAdd();
        onClose();
    };

    const getMealTypeByTime = (): MealType => {
        const hour = new Date().getHours();
        if (hour < 10) return MealType.BREAKFAST;
        if (hour < 12) return MealType.SNACK;
        if (hour < 15) return MealType.LUNCH;
        if (hour < 18) return MealType.SNACK;
        if (hour < 21) return MealType.DINNER;
        return MealType.SNACK;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900">
                    <h2 className="text-lg font-bold text-white">
                        {step === 'review' ? 'Revisar & Guardar' : 'Registrar Comida'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {step === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                            <p className="text-slate-300">Consultando a FitAI...</p>
                        </div>
                    )}

                    {step === 'method' && (
                        <>
                            {/* Tabs */}
                            <div className="flex bg-slate-800 p-1 rounded-lg mb-4">
                                {(['camera', 'text', 'manual', 'favorites'] as const).map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setMethodTab(m)}
                                        className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${methodTab === m ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        {m === 'camera' && '📷 Foto'}
                                        {m === 'text' && '✍️ Texto'}
                                        {m === 'manual' && '🔢 Manual'}
                                        {m === 'favorites' && '⭐ Favoritos'}
                                    </button>
                                ))}
                            </div>

                            {/* Camera Tab */}
                            {methodTab === 'camera' && (
                                <div className="space-y-4">
                                    <label className="block w-full text-center p-8 border-2 border-dashed border-slate-700 rounded-xl hover:bg-slate-800 transition cursor-pointer">
                                        <div className="text-4xl mb-2">📸</div>
                                        <p className="text-slate-400 text-sm">Tomar foto ahora</p>
                                        <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                    <label className="block w-full text-center p-4 border border-slate-700 rounded-xl hover:bg-slate-800 transition cursor-pointer">
                                        <p className="text-slate-400 text-sm">Subir de galería</p>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                </div>
                            )}

                            {/* Text Tab */}
                            {methodTab === 'text' && (
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700 h-32"
                                        placeholder="Ej: '2 huevos revueltos con una tostada integral y café'"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                    <button
                                        onClick={handleTextSubmit}
                                        className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg"
                                    >
                                        Analizar con IA
                                    </button>
                                </div>
                            )}

                            {/* Manual Tab */}
                            {methodTab === 'manual' && (
                                <div className="space-y-3">
                                    <input placeholder="Nombre" onChange={e => setManualData({ ...manualData, name: e.target.value })} className="w-full bg-slate-800 text-white p-2 rounded border border-slate-700" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" placeholder="Kcal" onChange={e => setManualData({ ...manualData, calories: Number(e.target.value) })} className="bg-slate-800 text-white p-2 rounded border border-slate-700" />
                                        <input type="number" placeholder="Prot" onChange={e => setManualData({ ...manualData, protein: Number(e.target.value) })} className="bg-slate-800 text-white p-2 rounded border border-slate-700" />
                                        <input type="number" placeholder="Carbs" onChange={e => setManualData({ ...manualData, carbs: Number(e.target.value) })} className="bg-slate-800 text-white p-2 rounded border border-slate-700" />
                                        <input type="number" placeholder="Fat" onChange={e => setManualData({ ...manualData, fat: Number(e.target.value) })} className="bg-slate-800 text-white p-2 rounded border border-slate-700" />
                                    </div>
                                    <button onClick={handleManualSubmit} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg">Continuar</button>
                                </div>
                            )}

                            {/* Favorites Tab */}
                            {methodTab === 'favorites' && (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {savedMeals.length === 0 ? (
                                        <p className="text-center text-slate-500 py-4 text-sm">No tienes favoritos guardados.</p>
                                    ) : (
                                        savedMeals.map(meal => (
                                            <button
                                                key={meal.id}
                                                onClick={() => handleFavoriteSelect(meal)}
                                                className="w-full text-left bg-slate-800 p-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
                                            >
                                                <div className="font-semibold text-white text-sm">{meal.name}</div>
                                                <div className="text-xs text-slate-400">
                                                    {meal.calories} kcal | P:{meal.protein} C:{meal.carbs} F:{meal.fat}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                    <p className="text-xs text-center text-slate-500 mt-2">Gestiona tus favoritos en Configuración (⚙️)</p>
                                </div>
                            )}
                        </>
                    )}

                    {step === 'review' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400">Nombre</label>
                                <input
                                    value={reviewItem.name || ''}
                                    onChange={(e) => setReviewItem({ ...reviewItem, name: e.target.value })}
                                    className="w-full bg-slate-800 text-white p-2 rounded border border-slate-700"
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <label className="text-xs text-indigo-400 font-bold">Kcal</label>
                                    <input type="number" value={reviewItem.calories || 0} onChange={(e) => setReviewItem({ ...reviewItem, calories: Number(e.target.value) })} className="w-full bg-slate-800 text-white p-2 text-center rounded border border-slate-700" />
                                </div>
                                <div>
                                    <label className="text-xs text-emerald-400 font-bold">Prot</label>
                                    <input type="number" value={reviewItem.protein || 0} onChange={(e) => setReviewItem({ ...reviewItem, protein: Number(e.target.value) })} className="w-full bg-slate-800 text-white p-2 text-center rounded border border-slate-700" />
                                </div>
                                <div>
                                    <label className="text-xs text-amber-400 font-bold">Carbs</label>
                                    <input type="number" value={reviewItem.carbs || 0} onChange={(e) => setReviewItem({ ...reviewItem, carbs: Number(e.target.value) })} className="w-full bg-slate-800 text-white p-2 text-center rounded border border-slate-700" />
                                </div>
                                <div>
                                    <label className="text-xs text-rose-400 font-bold">Fat</label>
                                    <input type="number" value={reviewItem.fat || 0} onChange={(e) => setReviewItem({ ...reviewItem, fat: Number(e.target.value) })} className="w-full bg-slate-800 text-white p-2 text-center rounded border border-slate-700" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400">Tipo de Comida</label>
                                <select
                                    value={reviewItem.meal || MealType.SNACK}
                                    onChange={(e) => setReviewItem({ ...reviewItem, meal: e.target.value as MealType })}
                                    className="w-full bg-slate-800 text-white p-2 rounded border border-slate-700"
                                >
                                    {Object.values(MealType).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg mt-2"
                            >
                                ✅ Guardar Comida
                            </button>
                            <button
                                onClick={() => setStep('method')}
                                className="w-full bg-transparent text-slate-400 py-2 text-sm hover:text-white"
                            >
                                Volver
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFoodModal;
