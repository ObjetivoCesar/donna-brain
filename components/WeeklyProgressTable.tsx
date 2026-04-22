import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Plus, Info, Camera } from 'lucide-react';
import MeasurementService from '../services/MeasurementService';
import { WeeklyCheckin, DetailedMeasurements } from '../types';
import MeasurementGuide from './MeasurementGuide';
import WeeklyCheckinModal from './WeeklyCheckinModal';

interface WeeklyProgressTableProps {
    refreshTrigger: number;
    onDataChange?: () => void;
}

// Helper to get Monday of the week
const getMonday = (d: Date) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

// Helper to add days
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Helper to format date DD/MM
const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
};

const WeeklyProgressTable: React.FC<WeeklyProgressTableProps> = ({ refreshTrigger, onDataChange }) => {
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [checkinModalOpen, setCheckinModalOpen] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState<any>(null);

    // Fetch data
    const [weeklyData, setWeeklyData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Get raw data (Last ~2 months / 12 weeks to ensure we cover the displayed range)
            const logs = await MeasurementService.getDailyLogs(60);
            const checkins = await MeasurementService.getWeeklyCheckins(12);

            // 2. Determine date range
            // Find earliest date from logs or checkins, default to today
            const dates = [
                ...logs.map(l => new Date(l.date).getTime()),
                ...checkins.map(c => new Date(c.weekStartDate).getTime()),
                new Date().getTime()
            ];

            // Ensure at least 4 weeks back
            const fourWeeksAgo = new Date();
            fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
            dates.push(fourWeeksAgo.getTime());

            const minDate = new Date(Math.min(...dates));

            // Start from Monday of that week
            let currentMonday = getMonday(minDate);
            const today = new Date();
            const weeks = [];

            // Generate weeks up to next week
            while (currentMonday <= addDays(today, 7)) {
                const startDate = currentMonday.toISOString().split('T')[0]; // YYYY-MM-DD
                const endDateObject = addDays(currentMonday, 6);
                const endDate = endDateObject.toISOString().split('T')[0];

                // A. Find saved checkin
                const savedCheckin = checkins.find(c => c.weekStartDate === startDate);

                // B. Calculate averages from logs
                const computedAverages = await MeasurementService.calculateWeeklyAverages(startDate, endDate);

                weeks.push({
                    start: startDate,
                    end: endDate,
                    label: `Semana ${weeks.length + 1}`,
                    data: savedCheckin,
                    computed: computedAverages,
                    isCurrentWeek: today >= currentMonday && today <= endDateObject
                });

                currentMonday = addDays(currentMonday, 7);
            }

            setWeeklyData(weeks.reverse()); // Newest first
        };

        fetchData();
    }, [refreshTrigger]);

    // Handle Edit/Create Checkin
    const handleEditCheckin = (week: any) => {
        setSelectedWeek(week);
        setCheckinModalOpen(true);
    };

    return (
        <div className="w-full bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    📊 Progreso Semanal
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const currentWeek = weeklyData.find(w => w.isCurrentWeek) || weeklyData[0];
                            if (currentWeek) handleEditCheckin(currentWeek);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-medium shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={14} />
                        Nuevo Check-in
                    </button>
                    <button
                        onClick={() => setIsGuideOpen(true)}
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <Info size={16} />
                        Guía
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr>
                            <th className="sticky left-0 bg-gray-900 z-10 p-4 min-w-[150px] font-medium text-gray-400 border-b border-gray-800 border-r">Métrica</th>
                            {weeklyData.map(week => (
                                <th key={week.start} className={`p-4 min-w-[140px] font-medium border-b border-gray-800 text-center ${week.isCurrentWeek ? 'text-blue-400 bg-blue-500/5' : 'text-gray-400'}`}>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs uppercase tracking-wider">{week.label}</span>
                                        <span className="text-xs font-normal opacity-70">{formatDateShort(week.start)} - {formatDateShort(week.end)}</span>
                                        <button
                                            onClick={() => handleEditCheckin(week)}
                                            className="mt-1 p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white flex items-center justify-center gap-1 mx-auto"
                                            title={week.data ? "Editar / Ver Fotos" : "Registrar Check-in"}
                                        >
                                            {week.data ? (
                                                <>
                                                    <Edit2 size={12} />
                                                    {week.data.photos && week.data.photos.length > 0 && (
                                                        <Camera size={12} className="text-blue-400" />
                                                    )}
                                                </>
                                            ) : (
                                                <Plus size={12} />
                                            )}
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {/* --- Weight --- */}
                        <tr className="bg-gray-800/20">
                            <td className="sticky left-0 bg-gray-900 z-10 p-3 font-semibold text-white border-r border-gray-800">Peso Promedio</td>
                            {weeklyData.map(week => {
                                // Prefer saved avg, then computed avg
                                const val = week.data?.averageWeight || week.computed?.averageWeight;
                                return (
                                    <td key={week.start} className="p-3 text-center text-white font-medium">
                                        {val ? `${val} kg` : '-'}
                                        {week.computed && !week.data && <span className="ml-1 text-[10px] text-yellow-500">(calc)</span>}
                                    </td>
                                );
                            })}
                        </tr>

                        {/* --- Habits --- */}
                        {[
                            { label: 'Sueño Avg', key: 'averageSleep', color: 'text-purple-400' },
                            { label: 'Estrés Avg', key: 'averageStress', color: 'text-red-400' },
                        ].map(metric => (
                            <tr key={metric.key}>
                                <td className={`sticky left-0 bg-gray-900 z-10 p-3 font-medium ${metric.color} border-r border-gray-800`}>{metric.label}</td>
                                {weeklyData.map(week => {
                                    const val = (week.data as any)?.[metric.key] ?? (week.computed as any)?.[metric.key];
                                    return <td key={week.start} className="p-3 text-center text-gray-300">{val?.toFixed(1) || '-'}</td>;
                                })}
                            </tr>
                        ))}

                        {/* --- Physical Measurements Header --- */}
                        <tr className="bg-gray-800/40">
                            <td className="sticky left-0 bg-gray-800 z-10 p-2 text-xs font-bold text-gray-500 border-r border-gray-700 uppercase tracking-widest pl-4" colSpan={weeklyData.length + 1}>
                                Medidas Corporales (cm)
                            </td>
                        </tr>

                        {/* --- Measurements Rows --- */}
                        {[
                            { label: '1. Pecho', path: 'chest' },
                            { label: '2. Brazos', path: 'armRight', secondary: 'armLeft' },
                            { label: '3. Cintura Alta', path: 'waistUpper' },
                            { label: '4. Ombligo', path: 'waistNavel' },
                            { label: '5. Cintura Baja', path: 'waistLower' },
                            { label: '6. Caderas', path: 'hips' },
                            { label: '7. Muslos', path: 'thighRight', secondary: 'thighLeft' },
                            { label: '8. Pantorrillas', path: 'calfRight', secondary: 'calfLeft' },
                        ].map(m => (
                            <tr key={m.label}>
                                <td className="sticky left-0 bg-gray-900 z-10 p-3 font-medium text-gray-300 border-r border-gray-800 pl-6 text-sm">{m.label}</td>
                                {weeklyData.map(week => {
                                    const d = week.data?.measurements;
                                    const val1 = (d as any)?.[m.path];
                                    const val2 = m.secondary ? (d as any)?.[m.secondary] : undefined;

                                    if (!d) return <td key={week.start} className="p-3 text-center text-gray-600">-</td>;

                                    return (
                                        <td key={week.start} className="p-3 text-center text-gray-300 text-sm">
                                            {val1 || '-'}{val2 ? ` / ${val2}` : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <MeasurementGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

            {selectedWeek && (
                <WeeklyCheckinModal
                    isOpen={checkinModalOpen}
                    onClose={() => setCheckinModalOpen(false)}
                    weekStart={selectedWeek.start}
                    weekEnd={selectedWeek.end}
                    existingCheckin={selectedWeek.data}
                    onSave={() => {
                        if (onDataChange) onDataChange();
                        setCheckinModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default WeeklyProgressTable;
