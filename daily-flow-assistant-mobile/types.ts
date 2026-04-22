export interface ScheduledActivity {
  time: string;
  activity: string;
  focus: string;
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
