import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DeviationService from '../services/DeviationService';

const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6.101a2 2 0 011.414.586l4.485 4.485A2 2 0 0119 8.101V18a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm5 1a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1zm3 7a1 1 0 100-2h-4a1 1 0 100 2h4z" />
    </svg>
);

const RegistrationFields: React.FC = () => {
    const { currentActivity, currentTime } = useApp();
    const [actualActivity, setActualActivity] = useState('');
    const [reason, setReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        // Validar que ambos campos tengan contenido
        if (!actualActivity.trim() || !reason.trim()) {
            alert('⚠️ Por favor completa ambos campos antes de guardar.');
            return;
        }

        // Validar que haya una actividad actual programada
        if (!currentActivity) {
            alert('⚠️ No hay actividad programada en este momento.');
            return;
        }

        setIsSaving(true);

        try {
            // Crear el registro de desviación
            const deviation = DeviationService.addDeviation({
                date: currentTime.toISOString().split('T')[0], // YYYY-MM-DD
                scheduledActivity: currentActivity.activity,
                scheduledTime: currentActivity.time,
                actualActivity: actualActivity.trim(),
                reason: reason.trim(),
            });

            // Feedback visual
            alert(`✅ Cambio registrado exitosamente.\n\nActividad programada: ${currentActivity.activity}\nActividad realizada: ${actualActivity}\nRazón: ${reason}`);

            // Limpiar los campos
            setActualActivity('');
            setReason('');
        } catch (error) {
            console.error('Error al guardar desviación:', error);
            alert('❌ Error al guardar el cambio. Por favor intenta de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4 text-white">
            <div>
                <label htmlFor="activity-change" className="block text-sm font-medium text-gray-300 mb-1">
                    Cambio de actividad
                </label>
                <input
                    type="text"
                    id="activity-change"
                    value={actualActivity}
                    onChange={(e) => setActualActivity(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Describe la nueva actividad..."
                    disabled={isSaving}
                />
            </div>
            <div>
                <label htmlFor="reason-change" className="block text-sm font-medium text-gray-300 mb-1">
                    Razón del cambio
                </label>
                <input
                    type="text"
                    id="reason-change"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="¿Por qué el cambio?"
                    disabled={isSaving}
                />
            </div>
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-green-500/80 hover:bg-green-500 disabled:bg-gray-500/50 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition"
            >
                <SaveIcon />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambio'}</span>
            </button>
        </div>
    );
};

export default RegistrationFields;