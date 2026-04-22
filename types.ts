export type ActivityCategory = 'living' | 'motivation' | 'work';

export interface ScheduledActivity {
  id?: string; // Optional for backward compatibility during migration
  time: string; // "HH:MM-HH:MM"
  activity: string;
  focus: string;
  category?: ActivityCategory;
}

export interface DaySchedule {
  day: string; // "Lunes", "Martes", etc.
  activities: ScheduledActivity[];
  meals: Meal[];
  workout?: Workout;
}

export interface Meal {
  time: string;
  meal: string;
  description: string;
}

export interface Exercise {
  name: string;
  setsReps: string;
}

export interface Workout {
  day: string;
  focus: string;
  duration?: string;
  exercises: Exercise[];
  final?: string;
}

// --- Chatbot Types ---

export interface ChatbotMapping {
  responseText: string;
  // Future properties like audioFile can be added here
}

export interface ChatbotConfig {
  version: string;
  labels: { [key: string]: string }; // e.g., "FATIGUE_DEMOTIVATION": "Cansancio o desmotivación"
  mappings: { [key: string]: ChatbotMapping };
  unknownResponse: string;
  crisisKeywords: string[];
  crisisResponse: string;
}

export interface ChatbotLog {
  id: string;
  timestamp: string;
  input: string;
  label: string;
  confidence?: number;
  output: string;
}

export interface ClassificationResult {
  label: string;
  confidence: number;
}

export interface ChatbotAction {
  responseText: string;
}

// --- Deviation Tracking Types ---

export interface ActivityDeviation {
  id: string;                      // UUID único
  timestamp: string;               // ISO 8601 timestamp
  date: string;                    // Fecha del registro (YYYY-MM-DD)
  scheduledActivity: string;       // Actividad que estaba programada
  scheduledTime: string;           // Horario programado (HH:MM-HH:MM)
  actualActivity: string;          // Actividad que realmente se hizo
  reason: string;                  // Razón del cambio
}

export interface DailyReport {
  date: string;                    // YYYY-MM-DD
  generatedAt: string;             // ISO 8601 timestamp
  schedule: ScheduledActivity[];   // Actividades programadas
  deviations: ActivityDeviation[]; // Desviaciones registradas
  adherencePercentage: number;     // % de adherencia al plan
}

// --- Advanced Workout Tracker Types ---

export type SetType = 'warmup' | 'working' | 'failure' | 'drop';

export interface WorkoutSet {
  id: string;
  type: SetType;
  weight: number;      // kg
  reps: number;        // repeticiones realizadas
  rpe?: number;        // Rate of Perceived Exertion (1-10)
  restTime?: number;   // segundos
  completed: boolean;
}

export interface ExerciseConfig {
  id: string;
  name: string;
  targetReps: string;  // "8-12", "15/12/10/8"
  targetRest: number;  // segundos
  notes?: string;
  history?: WorkoutSession[]; // Historial de este ejercicio
}

export interface WorkoutSession {
  id: string;
  date: string;        // ISO Date
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;        // "Pecho - Lunes"
  exercises: ExerciseConfig[];
}

// --- Body Measurements Types ---

export interface BodyMeasurements {
  id: string;
  date: string;        // YYYY-MM-DD
  weight: number;      // kg
  chest?: number;      // cm
  arms?: number;       // cm
  waist?: number;      // cm
  hips?: number;       // cm
  legs?: number;       // cm
  calves?: number;     // cm
  notes?: string;
  photos?: string[];   // IndexedDB photo IDs (migrated from Base64)
}

// --- Advanced Tracking (Phase 4) ---

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  steps?: number;
  habits: {
    sleepQuality: number; // 0-5
    stressLevel: number; // 0-5
    hungerLevel: number; // 0-5
    fatigueLevel: number; // 0-5
  };
  notes?: string;
  createdAt: string;
}

export interface DetailedMeasurements {
  chest: number;
  armLeft: number;
  armRight: number;
  waistUpper: number; // 3 dedos arriba ombligo
  waistNavel: number; // Ombligo
  waistLower: number; // 3 dedos abajo ombligo
  hips: number;
  thighLeft: number;
  thighRight: number;
  calfLeft: number;
  calfRight: number;
}

export interface WeeklyCheckin {
  id: string;
  date: string; // YYYY-MM-DD (usually Sunday)
  weekStartDate: string; // Monday of the week

  // Averages calculated from DailyLogs
  averageWeight: number;
  averageSleep?: number;
  averageStress?: number;
  averageHunger?: number;
  averageFatigue?: number;
  averageSteps?: number;

  // Physical Measurements
  measurements: DetailedMeasurements;

  photos: string[]; // IndexedDB photo IDs
  notes?: string;
}

// --- Nutrition Types (FitAI Tracker) ---

export enum MealType {
  BREAKFAST = 'Desayuno',
  LUNCH = 'Almuerzo',
  DINNER = 'Cena',
  SNACK = 'Snack',
  PRE_WORKOUT = 'Pre-Entreno',
  POST_WORKOUT = 'Post-Entreno'
}

export interface FoodItem {
  id: string;          // UUID v4
  name: string;        // Nombre del alimento
  calories: number;    // Kcal totales
  protein: number;     // Gramos
  carbs: number;       // Gramos
  fat: number;         // Gramos
  meal: MealType;      // Categoría
  timestamp: string;   // ISO String
  summary?: string;    // Descripción generada por IA
}

export interface SavedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  // MealType por defecto es opcional, pero útil
  defaultMealType?: MealType;
}

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterIntakeMl?: number;
}



// Modals
export interface ActivityFormData {
  time: string;
  activity: string;
  focus: string;
  category?: ActivityCategory;
}

export interface MealFormData {
  time: string;
  meal: string;
  description: string;
}

export interface WorkoutFormData {
  focus: string;
  exercises: Exercise[];
}
