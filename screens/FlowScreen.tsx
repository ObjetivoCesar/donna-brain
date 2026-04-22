import React, { useState, useMemo } from 'react';
import DigitalClock from '../components/DigitalClock';
import ProgressBar from '../components/ProgressBar';
import CurrentActivity from '../components/CurrentActivity';
import RegistrationFields from '../components/RegistrationFields';
import LightboxModal from '../components/LightboxModal';
import AudioLibraryModal from '../components/AudioLibraryModal';
import { useApp } from '../context/AppContext';
import { useScheduledNotifications } from '../services/useScheduledNotifications';
import ReportService from '../services/ReportService';
import { ScheduledActivity, Meal } from '../types';

const AuxilioIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const AuxilioButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg">
        <AuxilioIcon />
        <span>BOTÓN DE AUXILIO</span>
    </button>
);

const findBestMealMatch = (activity: ScheduledActivity, plan: Meal[]): Meal | null => {
    if (!activity) return null;
    const activityTokens = activity.activity.toLowerCase().split(/[\s/]+/);
    let bestMatch: Meal | null = null;
    let maxScore = 0;

    for (const meal of plan) {
        const mealTokens = meal.meal.toLowerCase().split(/[\s/]+/);
        let currentScore = 0;

        const commonTokens = activityTokens.filter(token => mealTokens.includes(token));
        currentScore = commonTokens.length;

        if ((activityTokens.includes('post') || activityTokens.includes('entrenamiento')) && (mealTokens.includes('post') || mealTokens.includes('gym'))) {
            currentScore += 2;
        }
        if ((activityTokens.includes('pre') || activityTokens.includes('entreno')) && mealTokens.includes('pre')) {
            currentScore += 2;
        }
        if (activityTokens.includes('desayuno') && mealTokens.includes('desayuno')) {
            currentScore += 2;
        }
        if (activityTokens.includes('almuerzo') && mealTokens.includes('almuerzo')) {
            currentScore += 2;
        }
        if (activityTokens.includes('cena') && mealTokens.includes('cena')) {
            currentScore += 2;
        }

        if (currentScore > maxScore) {
            maxScore = currentScore;
            bestMatch = meal;
        }
    }

    return bestMatch;
}


const ReportIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
    </svg>
);

const FlowScreen: React.FC = () => {
    const { currentSchedule, currentActivity, currentTime } = useApp();
    const [lightboxContent, setLightboxContent] = useState<React.ReactNode | null>(null);
    const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false);

    const detailsContent = useMemo(() => {
        if (!currentActivity) return null;
        const activityTitle = currentActivity.activity.toLowerCase();

        if (activityTitle.includes('entrenamiento') || activityTitle.includes('calistenia')) {
            const workout = currentSchedule.workout;
            if (workout) {
                return (
                    <div>
                        <h4 className="text-xl font-bold text-gray-800 mb-3">{workout.focus}</h4>
                        <ul className="space-y-2 text-left">
                            {workout.exercises.map((ex, i) => (
                                <li key={i} className="flex justify-between items-center text-base border-b border-gray-200 pb-2">
                                    <span className="text-gray-700">{ex.name}</span>
                                    <span className="font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{ex.setsReps}</span>
                                </li>
                            ))}
                        </ul>
                        {workout.final && <p className="text-base mt-4 text-gray-700"><span className="font-bold">Final:</span> {workout.final}</p>}
                    </div>
                );
            }
        }

        const meal = findBestMealMatch(currentActivity, currentSchedule.meals);
        if (meal) {
            return (
                <div>
                    <h4 className="font-bold text-xl text-gray-800 mb-2">{meal.meal}</h4>
                    <p className="text-gray-600 text-base">{meal.description}</p>
                </div>
            )
        }

        return (
            <p className="text-gray-600 text-base">
                <span className="font-bold text-gray-700 text-lg block mb-2">Enfoque:</span>{currentActivity.focus}
            </p>
        );
    }, [currentActivity, currentSchedule]);

    const { requestPermission, permission, audioEnabled } = useScheduledNotifications(currentSchedule.activities);

    const handleActivityClick = () => {
        const dayOfWeek = currentTime.getDay();
        if (dayOfWeek !== 0 && detailsContent) { // Do not open lightbox on Sunday
            setLightboxContent(detailsContent);
        }
    };

    const handleGenerateReport = async () => {
        const date = currentTime.toISOString().split('T')[0]; // YYYY-MM-DD
        try {
            await ReportService.downloadDailyReport(date, currentSchedule.activities);
            alert('✅ Informe diario generado y descargado exitosamente.');
        } catch (error) {
            console.error('Error al generar informe:', error);
            alert('❌ Error al generar el informe. Por favor intenta de nuevo.');
        }
    };

    return (
        <>
            <div className="w-full max-w-md mx-auto p-4 md:p-6 min-h-screen flex flex-col justify-center space-y-5">
                <div className="flex gap-2">
                    <AuxilioButton onClick={() => setIsAudioLibraryOpen(true)} />
                    <button
                        onClick={handleGenerateReport}
                        className="bg-blue-500/80 hover:bg-blue-500 text-white font-bold p-3 rounded-xl flex items-center justify-center transition shadow-lg"
                        title="Generar Informe del Día"
                    >
                        <ReportIcon />
                    </button>
                </div>

                <ProgressBar />

                {/* DigitalClock updates itself visually, but logic uses AppContext time */}
                <DigitalClock onTimeUpdate={() => { }} />

                <CurrentActivity
                    activity={currentActivity}
                    onClick={handleActivityClick}
                />

                <div className="mt-auto pt-4">
                    <RegistrationFields />
                </div>
            </div>

            <LightboxModal isOpen={!!lightboxContent} onClose={() => setLightboxContent(null)}>
                {lightboxContent}
            </LightboxModal>

            <AudioLibraryModal isOpen={isAudioLibraryOpen} onClose={() => setIsAudioLibraryOpen(false)} />
        </>
    );
};

export default FlowScreen;