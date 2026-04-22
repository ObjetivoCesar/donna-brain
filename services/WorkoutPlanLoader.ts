import { WorkoutRoutine, ExerciseConfig } from '../types';

/**
 * Servicio para cargar las rutinas del coach desde el CSV parseado
 */

interface CoachExercise {
    order: string;
    pattern: string;
    name: string;
    series: string;
    reps: string;
    rest: string;
}

interface CoachSession {
    name: string;
    exercises: CoachExercise[];
}

// Rutinas parseadas del CSV del coach
const COACH_SESSIONS: CoachSession[] = [
    {
        name: "TORSO A",
        exercises: [
            {
                order: "A",
                pattern: "Empuje Horizontal",
                name: "PRESS PLANO CON BARRA",
                series: "2+AMRAP",
                reps: "8",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "B",
                pattern: "Empuje Vertical",
                name: "PRESS MILITAR",
                series: "2+AMRAP",
                reps: "10",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "C",
                pattern: "Empuje Énfasis Pectoral",
                name: "FONDOS",
                series: "1 Bilbo+1+AMRAP",
                reps: "10",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "D",
                pattern: "Tracción Vertical",
                name: "JALÓN EN POLEA ALTA",
                series: "2+AMRAP",
                reps: "10",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "F",
                pattern: "Tracción Horizontal",
                name: "REMO T",
                series: "2+AMRAP",
                reps: "10",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "G",
                pattern: "Aislamiento de Bíceps",
                name: "CURL INCLINADO",
                series: "3",
                reps: "30 TOTALES",
                rest: "Lo justo para rendir al 100% en cada serie"
            }
        ]
    },
    {
        name: "PIERNA A",
        exercises: [
            {
                order: "A",
                pattern: "Patrón de Sentadilla",
                name: "SENTADILLA HACK",
                series: "2+AMRAP",
                reps: "10",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "B",
                pattern: "Aislamiento de Femoral",
                name: "CURL FEMORAL TUMBADO",
                series: "3",
                reps: "30 TOTALES",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "C",
                pattern: "Sentadilla Unilateral",
                name: "BÚLGARAS EN LA SMITH",
                series: "2+AMRAP x Pierna",
                reps: "10",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "D",
                pattern: "Aislamiento de pantorrillas",
                name: "EXTENSIONES DE TOBILLO EN PRENSA",
                series: "3",
                reps: "30 TOTALES",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "E",
                pattern: "Aislamiento de Abdomen",
                name: "PLANCHA",
                series: "3",
                reps: "FALLO",
                rest: "Lo justo para rendir al 100% en cada serie"
            }
        ]
    },
    {
        name: "TORSO B",
        exercises: [
            {
                order: "A",
                pattern: "Empuje Vertical",
                name: "PRESS MUY INCLINADO",
                series: "2+AMRAP",
                reps: "8",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "B",
                pattern: "Empuje Horizontal",
                name: "PRESS SEMI INCLINADO 30° EN SMITH",
                series: "2+AMRAP",
                reps: "10",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "C",
                pattern: "Tracción Vertical",
                name: "DOMINADAS CON AGARRE NEUTRO",
                series: "2+AMRAP",
                reps: "10",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "D",
                pattern: "Tracción Horizontal",
                name: "REMO CON MANCUERNA",
                series: "2+AMRAP",
                reps: "8",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "E",
                pattern: "Aislamiento de deltoides lateral",
                name: "ELEVACIONES LATERALES EN POLEA",
                series: "3",
                reps: "30 TOTALES",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "G",
                pattern: "Aislamiento de Tríceps",
                name: "PRESS FRANCÉS CON MANCUERNAS",
                series: "3",
                reps: "30 TOTALES",
                rest: "Lo justo para rendir al 100% en cada serie"
            }
        ]
    },
    {
        name: "PIERNA B",
        exercises: [
            {
                order: "A",
                pattern: "Patron de sentadilla",
                name: "SENTADILLA PENDULAR",
                series: "2+AMRAP",
                reps: "8",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "B",
                pattern: "Biasagra de cadera",
                name: "HIP THRUST EN MÁQUINA",
                series: "2+AMRAP",
                reps: "10",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "C",
                pattern: "Aislamiento de Femoral",
                name: "FEMORAL SENTADO",
                series: "3",
                reps: "30 TOTALES",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "D",
                pattern: "Aislamiento de cuadríceps",
                name: "EXTENSIONES DE RODILLA",
                series: "3",
                reps: "30 TOTALES",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "E",
                pattern: "Aislamiento de Pantorrillas",
                name: "EXTENSIONES DE TOBILLO SENTADO",
                series: "3",
                reps: "30 TOTALES",
                rest: "Lo justo para rendir al 100% en cada serie"
            },
            {
                order: "G",
                pattern: "Aislamiento de Abdomen",
                name: "CRUNCH ABDOMINAL EN MÁQUINA",
                series: "3",
                reps: "30 TOTALES",
                rest: "Lo justo para rendir al 100% en cada serie"
            }
        ]
    }
];

class WorkoutPlanLoader {
    /**
     * Convierte las sesiones del coach en WorkoutRoutines con UUIDs únicos
     */
    loadCoachRoutines(): WorkoutRoutine[] {
        return COACH_SESSIONS.map(session => {
            const exercises: ExerciseConfig[] = session.exercises.map(ex => ({
                id: crypto.randomUUID(), // UUID único para cada ejercicio
                name: ex.name,
                targetReps: ex.reps,
                targetRest: 120, // Default 2 minutos (el CSV dice "lo justo")
                notes: `${ex.pattern} | ${ex.series}`,
                history: []
            }));

            return {
                id: crypto.randomUUID(),
                name: session.name,
                exercises: exercises
            };
        });
    }

    /**
     * Obtiene los nombres de las sesiones disponibles
     */
    getSessionNames(): string[] {
        return COACH_SESSIONS.map(s => s.name);
    }

    /**
     * Obtiene el plan semanal fijo con las rutinas del coach asignadas a días específicos
     * Lunes: TORSO A
     * Martes: PIERNA A
     * Miércoles: Descanso (actividades TDAH-friendly)
     * Jueves: TORSO B
     * Viernes: PIERNA B
     * Sábado: Descanso activo
     * Domingo: Descanso total
     */
    getFixedWeeklySchedule(): Map<string, WorkoutRoutine | null> {
        const routines = this.loadCoachRoutines();
        const schedule = new Map<string, WorkoutRoutine | null>();

        // Asignar rutinas a días fijos
        schedule.set('Lunes', routines.find(r => r.name === 'TORSO A') || null);
        schedule.set('Martes', routines.find(r => r.name === 'PIERNA A') || null);
        schedule.set('Miércoles', null); // Día de descanso TDAH
        schedule.set('Jueves', routines.find(r => r.name === 'TORSO B') || null);
        schedule.set('Viernes', routines.find(r => r.name === 'PIERNA B') || null);
        schedule.set('Sábado', null); // Descanso activo
        schedule.set('Domingo', null); // Descanso total

        return schedule;
    }
}

export default new WorkoutPlanLoader();
