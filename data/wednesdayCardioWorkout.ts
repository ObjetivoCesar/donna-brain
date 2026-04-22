import { Workout } from '../types';

/**
 * Rutina de miércoles - Cardio y Calistenia (sin pesas)
 * Enfocada en recuperación activa, movilidad y resistencia cardiovascular
 */
export const wednesdayCardioWorkout: Workout = {
    day: "Miércoles",
    focus: "Cardio y Calistenia - Recuperación Activa",
    duration: "5:00 - 6:45 a.m.",
    exercises: [
        { name: "Bicicleta estática - Calentamiento", setsReps: "10 min" },
        { name: "Estiramientos dinámicos completos", setsReps: "10 min" },
        { name: "Flexiones de brazos", setsReps: "3x15-20" },
        { name: "Dominadas asistidas o australianas", setsReps: "3x10-12" },
        { name: "Sentadillas con peso corporal", setsReps: "3x20-25" },
        { name: "Fondos en paralelas", setsReps: "3x12-15" },
        { name: "Plancha isométrica", setsReps: "3x1 min" },
        { name: "Movilidad articular (hombros, caderas, tobillos)", setsReps: "10 min" },
        { name: "Bicicleta estática - Cardio moderado", setsReps: "20 min" },
    ],
    final: "Estiramiento profundo de 10 minutos + respiración consciente"
};
