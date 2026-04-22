
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });
const model = 'gemini-2.5-flash';

class GeminiService {

    public async classifyIntent(userInput: string, labels: Record<string, string>): Promise<string> {
        if (!userInput || Object.keys(labels).length === 0) {
            return "UNKNOWN";
        }

        const categoriesList = Object.entries(labels)
            .map(([key, description]) => `- ${key}: ${description}`)
            .join('\n');

        const prompt = `You are an expert text classifier. Your task is to analyze the user's text and determine which of the following categories it best fits.
        
Categories:
${categoriesList}

Respond with ONLY the matching category KEY (e.g., FATIGUE_DEMOTIVATION). Do not add any explanation or conversational text. If none of the categories seem to fit, respond with 'UNKNOWN'.

User text: "${userInput}"
Category Key:`;

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });

            const classification = response.text.trim();
            const validKeys = Object.keys(labels);

            // Validate the response from the model
            if (validKeys.includes(classification) || classification === "UNKNOWN") {
                return classification;
            } else {
                console.warn(`Gemini returned an unexpected label: "${classification}"`);
                return "UNKNOWN"; // Fallback if the model returns something weird
            }

        } catch (error) {
            console.error("Error communicating with Gemini for classification:", error);
            return "UNKNOWN";
        }
    }

    /**
     * Analiza una imagen de comida o texto para estimar valores nutricionales.
     * @param input Texto descriptivo o Base64 de la imagen (sin prefijo data:image...)
     * @param isImage Indica si el input es una imagen
     * @returns Objeto JSON con la información nutricional
     */
    public async analyzeFood(input: string, isImage: boolean = false): Promise<any> {
        const prompt = `Role: Expert Sport Nutritionist. 
Task: Analyze the provided ${isImage ? 'image' : 'text'} to estimate nutritional values. ${isImage ? 'Estimate portion sizes based on visual cues.' : ''}
Respond ONLY with a valid JSON object matching this schema:
{
  "foodName": "string (Short descriptive name)",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "summary": "string (Short summary of analysis)"
}
Do NOT wrap the response in markdown code blocks. Just the raw JSON string.`;

        try {
            let contents: any[];

            if (isImage) {
                // Eliminar prefijo data:image si existe
                const base64Data = input.replace(/^data:image\/\w+;base64,/, "");

                contents = [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: 'image/jpeg', // Asumimos jpeg por simplicidad, Gemini es flexible
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ];
            } else {
                contents = [
                    {
                        role: 'user',
                        parts: [{ text: `${prompt}\n\nUser Input: ${input}` }]
                    }
                ];
            }

            const response = await ai.models.generateContent({
                model: model,
                contents: contents
                // TODO: En el futuro usar responseSchema cuando la librería lo soporte plenamente para TS
            });

            let textResponse = response.text ? response.text : "";
            if (typeof textResponse !== 'string') {
                // Fallback if response.text is a function in some versions or undefined
                textResponse = (response as any).text ? (typeof (response as any).text === 'function' ? (response as any).text() : (response as any).text) : "";
            }

            textResponse = textResponse.trim();
            // Limpieza básica por si el modelo devuelve markdown
            textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(textResponse);
        } catch (error) {
            console.error("Error analyzing food with Gemini:", error);
            throw new Error("Failed to analyze food. Please try again.");
        }
    }
}

export const geminiService = new GeminiService();
