import React, { useState, useEffect } from 'react';
import { X, Save, Ruler, Camera, Trash2, Maximize2, Activity, Moon, Battery, Brain, Calculator } from 'lucide-react';
import MeasurementService from '../services/MeasurementService';
import PhotoStorageService from '../services/PhotoStorageService';
import PhotoDisplay from './PhotoDisplay';
import { WeeklyCheckin, DetailedMeasurements } from '../types';

interface WeeklyCheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
    weekStart: string; // YYYY-MM-DD (Monday)
    weekEnd: string;
    existingCheckin?: WeeklyCheckin;
}

const WeeklyCheckinModal: React.FC<WeeklyCheckinModalProps> = ({ isOpen, onClose, onSave, weekStart, weekEnd, existingCheckin }) => {
    const [measurements, setMeasurements] = useState<DetailedMeasurements>({
        chest: 0,
        armLeft: 0,
        armRight: 0,
        waistUpper: 0,
        waistNavel: 0,
        waistLower: 0,
        hips: 0,
        thighLeft: 0,
        thighRight: 0,
        calfLeft: 0,
        calfRight: 0
    });
    const [photos, setPhotos] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [calculatedStats, setCalculatedStats] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            // Always recalculate averages from logs for this week range to show fresh data
            const avgs = MeasurementService.calculateWeeklyAverages(weekStart, weekEnd);
            setCalculatedStats(avgs || {});

            if (existingCheckin) {
                setMeasurements(existingCheckin.measurements);
                setPhotos(existingCheckin.photos || []);
                setNotes(existingCheckin.notes || '');
                // If existing checkin has saved averages, we could show those, 
                // but showing the *source* averages (from daily logs) might be more informative 
                // or we can show both. For now, let's show what the current Daily Logs say.
            } else {
                setMeasurements({
                    chest: 0, armLeft: 0, armRight: 0, waistUpper: 0, waistNavel: 0, waistLower: 0,
                    hips: 0, thighLeft: 0, thighRight: 0, calfLeft: 0, calfRight: 0
                });
                setPhotos([]);
                setNotes('');
            }
        }
    }, [isOpen, existingCheckin, weekStart, weekEnd]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setLoading(true);
            const photoId = await PhotoStorageService.savePhoto(files[0]);
            setPhotos(prev => [...prev, photoId]);
        } catch (error) {
            console.error(error);
            alert('Error al subir foto');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePhoto = async () => {
        if (!selectedPhoto) return;

        try {
            await PhotoStorageService.deletePhoto(selectedPhoto);
            setPhotos(prev => prev.filter(id => id !== selectedPhoto));
            setSelectedPhoto(null);
        } catch (error) {
            console.error(error);
            alert('Error al eliminar foto');
        }
    };

    const handleSave = () => {
        const averages = MeasurementService.calculateWeeklyAverages(weekStart, weekEnd);

        const checkin: WeeklyCheckin = {
            id: existingCheckin?.id || crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            averageWeight: averages?.averageWeight || 0,
            averageSleep: averages?.averageSleep,
            averageStress: averages?.averageStress,
            averageHunger: averages?.averageHunger,
            averageFatigue: averages?.averageFatigue,
            averageSteps: averages?.averageSteps,
            measurements: measurements,
            photos: photos,
            notes: notes
        };

        MeasurementService.saveWeeklyCheckin(checkin);
        if (onSave) onSave();
        onClose();
    };

    if (!isOpen) return null;

    const StatCard = ({ icon: Icon, label, value, unit, color }: any) => (
        <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center gap-1">
            <div className={`p-1.5 rounded-full bg-gray-800 ${color}`}>
                <Icon size={14} />
            </div>
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm font-bold text-white">
                {value ? Number(value).toFixed(1) : '-'} <span className="text-[10px] text-gray-500 font-normal">{unit}</span>
            </span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
            <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Ruler className="text-purple-500" />
                        Check-in Semanal
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                        Semana del {weekStart}
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                            {existingCheckin ? 'Editando Registro' : 'Nuevo Registro'}
                        </span>
                    </p>

                    {/* Calculated Averages Section */}
                    <div className="space-y-3">
                        <h3 className="text-green-400 font-semibold border-b border-gray-700 pb-1 flex items-center gap-2 text-sm">
                            <Calculator size={14} /> Promedios Calculados (Diario)
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            <StatCard icon={Activity} label="Peso" value={calculatedStats.averageWeight} unit="kg" color="text-green-400" />
                            <StatCard icon={Activity} label="Pasos" value={calculatedStats.averageSteps} unit="" color="text-blue-400" />
                            <StatCard icon={Moon} label="Sueño" value={calculatedStats.averageSleep} unit="h" color="text-purple-400" />
                            <StatCard icon={Brain} label="Estrés" value={calculatedStats.averageStress} unit="/10" color="text-red-400" />
                            <StatCard icon={Battery} label="Energía" value={calculatedStats.averageFatigue} unit="/10" color="text-yellow-400" />
                        </div>
                        <p className="text-[10px] text-gray-500 italic">
                            * Estos valores se calculan automáticamente de tus registros diarios al guardar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upper Body */}
                        <div className="space-y-4">
                            <h3 className="text-purple-400 font-semibold border-b border-gray-700 pb-1">Tren Superior</h3>
                            <div>
                                <label className="text-xs text-gray-400">Pecho (cm)</label>
                                <input type="number" value={measurements.chest || ''} onChange={e => setMeasurements({ ...measurements, chest: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-400">Brazo Izq</label>
                                    <input type="number" value={measurements.armLeft || ''} onChange={e => setMeasurements({ ...measurements, armLeft: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Brazo Der</label>
                                    <input type="number" value={measurements.armRight || ''} onChange={e => setMeasurements({ ...measurements, armRight: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                                </div>
                            </div>
                        </div>

                        {/* Core */}
                        <div className="space-y-4">
                            <h3 className="text-purple-400 font-semibold border-b border-gray-700 pb-1">Zona Media</h3>
                            <div>
                                <label className="text-xs text-gray-400">Cintura Alta (3 dedos arriba)</label>
                                <input type="number" value={measurements.waistUpper || ''} onChange={e => setMeasurements({ ...measurements, waistUpper: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Cintura Media (Ombligo)</label>
                                <input type="number" value={measurements.waistNavel || ''} onChange={e => setMeasurements({ ...measurements, waistNavel: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Cintura Baja (3 dedos abajo)</label>
                                <input type="number" value={measurements.waistLower || ''} onChange={e => setMeasurements({ ...measurements, waistLower: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                            </div>
                        </div>

                        {/* Lower Body */}
                        <div className="space-y-4">
                            <h3 className="text-purple-400 font-semibold border-b border-gray-700 pb-1">Tren Inferior</h3>
                            <div>
                                <label className="text-xs text-gray-400">Caderas (Glúteo)</label>
                                <input type="number" value={measurements.hips || ''} onChange={e => setMeasurements({ ...measurements, hips: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-400">Muslo Izq</label>
                                    <input type="number" value={measurements.thighLeft || ''} onChange={e => setMeasurements({ ...measurements, thighLeft: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Muslo Der</label>
                                    <input type="number" value={measurements.thighRight || ''} onChange={e => setMeasurements({ ...measurements, thighRight: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-400">Pantorrilla Izq</label>
                                    <input type="number" value={measurements.calfLeft || ''} onChange={e => setMeasurements({ ...measurements, calfLeft: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Pantorrilla Der</label>
                                    <input type="number" value={measurements.calfRight || ''} onChange={e => setMeasurements({ ...measurements, calfRight: parseFloat(e.target.value) })} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" />
                                </div>
                            </div>
                        </div>

                        {/* Photos */}
                        <div className="space-y-4">
                            <h3 className="text-purple-400 font-semibold border-b border-gray-700 pb-1 flex items-center gap-2">
                                <Camera size={16} /> Fotos
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {photos.map((id, i) => (
                                    <div key={i} className="relative w-20 h-20 rounded overflow-hidden border border-gray-700 group cursor-pointer" onClick={() => setSelectedPhoto(id)}>
                                        <PhotoDisplay photoId={id} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="checkin" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Maximize2 size={16} className="text-white" />
                                        </div>
                                    </div>
                                ))}
                                <label className="w-20 h-20 rounded bg-gray-800 border border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition">
                                    <span className="text-2xl text-gray-400">+</span>
                                    <input type="file" onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">Notas</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700" rows={3}></textarea>
                    </div>

                </div>

                <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-white font-bold flex items-center gap-2">
                        <Save size={18} /> Guardar Semanal
                    </button>
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition"
                    >
                        <X size={32} />
                    </button>

                    <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4">
                        <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10">
                            <PhotoDisplay photoId={selectedPhoto} className="max-w-full max-h-[80vh] object-contain" alt="Full view" />
                        </div>

                        <button
                            onClick={handleDeletePhoto}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full border border-red-500/20 transition-all hover:scale-105"
                        >
                            <Trash2 size={18} />
                            Eliminar Foto
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyCheckinModal;
