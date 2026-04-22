import { geminiService } from './GeminiService';
import { AudioService } from './AudioService';
import type { ChatbotConfig, ChatbotLog } from '../types';

export class ChatbotService {
  private audioService = new AudioService();
  private logs: ChatbotLog[] = [];
  private config: ChatbotConfig | null = null;

  private constructor(config: ChatbotConfig) {
    this.config = config;
  }

  public static async create(): Promise<ChatbotService> {
    try {
      const response = await fetch('/chatbot_config.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const config = await response.json();
      return new ChatbotService(config);
    } catch (error) {
      console.error("Failed to load chatbot configuration:", error);
      // Fallback to a minimal, safe configuration
      const fallbackConfig: ChatbotConfig = {
        version: "fallback",
        labels: {},
        mappings: {},
        unknownResponse: "Error al cargar la configuración del asistente.",
        crisisKeywords: [],
        crisisResponse: "Error"
      };
      return new ChatbotService(fallbackConfig);
    }
  }

  private logInteraction(input: string, label: string, output: string): void {
    const logEntry: ChatbotLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      input,
      label,
      output
    };
    this.logs.push(logEntry);
    // console.log("New Log:", logEntry);
  }

  private classifyByKeywords(userInput: string): string | null {
    const lowerInput = userInput.toLowerCase();

    // Keyword patterns for each category
    const patterns: Record<string, string[]> = {
      'FATIGUE_DEMOTIVATION': ['cansad', 'sueño', 'dormir', 'aburr', 'desmotiv', 'agot', 'floj', 'sin ganas', 'no tengo ganas'],
      'EMOTIONAL_UNCERTAINTY': ['confund', 'no sé', 'inciert', 'dud', 'perdid', 'desorient'],
      'INSPIRATION_CREATIVITY': ['inspir', 'creativ', 'idea', 'imagin', 'innov'],
      'POSITIVE_IMPULSE': ['motiv', 'energí', 'emocion', 'feliz', 'content', 'bien'],
      'INSECURITY_REJECTION': ['insegur', 'miedo', 'rechazo', 'ansied', 'nerv'],
      'PROCRASTINATION_DOUBT': ['procrastin', 'postergar', 'después', 'luego', 'más tarde', 'no puedo'],
      'SHAME_PERFECTIONISM': ['vergüenza', 'perfeccion', 'autoexig', 'no soy suficiente'],
      'ENTHUSIASM_NEW_BEGINNINGS': ['entusiasm', 'nuevo', 'comenzar', 'empezar', 'inici']
    };

    // Count matches for each category
    let bestMatch: string | null = null;
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(patterns)) {
      const matches = keywords.filter(keyword => lowerInput.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    }

    // Require at least one match
    return maxMatches > 0 ? bestMatch : null;
  }

  public async processUserIntent(userInput: string): Promise<string> {
    if (!this.config) {
      return "El servicio no está inicializado correctamente.";
    }

    // Crisis keyword check (simple check for MVP)
    const lowerUserInput = userInput.toLowerCase();
    const crisisDetected = this.config.crisisKeywords.some(keyword => lowerUserInput.includes(keyword));

    if (crisisDetected) {
      this.logInteraction(userInput, "CRISIS", this.config.crisisResponse);
      // In a real app, you might trigger a more robust crisis protocol here.
      // For now, it plays an audio and returns a text.
      this.audioService.play(`${this.config.crisisResponse}.mp3`);
      return "He detectado una situación crítica. Escucha este audio y sigue las indicaciones.";
    }

    // Try keyword-based classification first (fallback)
    let classification = this.classifyByKeywords(userInput);

    // If keyword matching fails, try Gemini API
    if (!classification) {
      try {
        classification = await geminiService.classifyIntent(userInput, this.config.labels);
      } catch (error) {
        console.error("Gemini API failed, using keyword fallback:", error);
        classification = null;
      }
    }

    let responseText = this.config.unknownResponse;
    let audioIdentifier = "";

    if (classification && this.config.mappings[classification]) {
      audioIdentifier = this.config.mappings[classification].responseText;
      responseText = `Entendido. He encontrado algo que podría ayudarte. Escucha...`;
      this.audioService.play(`${audioIdentifier}.mp3`);
    }

    this.logInteraction(userInput, classification || "UNKNOWN", audioIdentifier || responseText);

    return responseText;
  }
}
