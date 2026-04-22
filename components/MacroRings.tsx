import React from 'react';
import { UserGoals } from '../types';

interface MacroRingsProps {
    consumed: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    goals: UserGoals;
}

const MacroRings: React.FC<MacroRingsProps> = ({ consumed, goals }) => {
    // Calculamos porcentajes (max 100 para dibujo, pero mostramos real)
    const getPercentage = (val: number, goal: number) => Math.min(100, Math.max(0, (val / goal) * 100));

    // Configuración de anillos
    const rings = [
        { label: 'Kcal', value: consumed.calories, goal: goals.calories, color: 'text-indigo-500', stroke: '#6366f1', radius: 90 },
        { label: 'Prot', value: consumed.protein, goal: goals.protein, color: 'text-emerald-500', stroke: '#10b981', radius: 75 },
        { label: 'Carbs', value: consumed.carbs, goal: goals.carbs, color: 'text-amber-500', stroke: '#f59e0b', radius: 60 },
        { label: 'Grasa', value: consumed.fat, goal: goals.fat, color: 'text-rose-500', stroke: '#f43f5e', radius: 45 },
    ];

    const center = 100;
    const strokeWidth = 10;

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-lg">
            <div className="relative w-[200px] h-[200px]">
                <svg width="200" height="200" className="transform -rotate-90">
                    {/* Background Circles */}
                    {rings.map((ring, i) => (
                        <circle
                            key={`bg-${i}`}
                            cx={center}
                            cy={center}
                            r={ring.radius}
                            fill="transparent"
                            stroke="#1e293b" // slate-800
                            strokeWidth={strokeWidth}
                        />
                    ))}

                    {/* Progress Circles */}
                    {rings.map((ring, i) => {
                        const circumference = 2 * Math.PI * ring.radius;
                        const percent = getPercentage(ring.value, ring.goal);
                        const offset = circumference - (percent / 100) * circumference;

                        return (
                            <circle
                                key={`prog-${i}`}
                                cx={center}
                                cy={center}
                                r={ring.radius}
                                fill="transparent"
                                stroke={ring.stroke}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        );
                    })}
                </svg>

                {/* Center Text (kCal remaining or consumed) */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-white">
                        {Math.round(goals.calories - consumed.calories)}
                    </span>
                    <span className="text-xs text-slate-400">kcal restantes</span>
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-4 gap-2 mt-4 w-full text-center">
                {rings.map((ring, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <span className={`text-xs font-bold ${ring.color}`}>{Math.round(ring.value)}</span>
                        <span className="text-[10px] text-slate-500">/ {ring.goal}g</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">{ring.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MacroRings;
