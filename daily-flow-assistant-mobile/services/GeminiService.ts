import { GoogleGenerativeAI } from "@google/generative-ai";

// --- IMPORTANT ---
// 1. REPLACE this with your actual Google AI Studio API key.
// 2. For production, use a secure way to store this key (e.g., environment variables).
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 
// -----------------

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  // The system instruction helps guide the model's behavior.
  systemInstruction: `You are a highly disciplined and motivating assistant. 
    Your user is a high-performer. Your goal is to understand their emotional state or need from their text input.
    You must respond with only a single keyword that classifies their need.
    The possible keywords are: "calm", "energy", "focus", "motivation", "general_support".
    Do not add any other words, explanations, or punctuation. Just the keyword.
    For example, if the user says "I feel anxious and stressed", you should respond with: calm
    If the user says "I'm tired and can't get going", you should respond with: energy`,
});

/**
 * Classifies the user's intent using the Gemini API.
 * @param userInput The text input from the user.
 * @returns A classification keyword (e.g., "calm", "energy") or null if an error occurs.
 */
export const classifyIntentWithGemini = async (userInput: string): Promise<string | null> => {
  if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    console.error("Gemini API key is not configured.");
    return null;
  }

  try {
    const result = await model.generateContent(userInput);
    const response = result.response;
    const classification = response.text().trim().toLowerCase();
    
    // Basic validation to ensure the response is one of the expected keywords
    const validKeywords = ["calm", "energy", "focus", "motivation", "general_support"];
    if (validKeywords.includes(classification)) {
      return classification;
    } else {
      console.warn(`Gemini returned an unexpected classification: "${classification}"`);
      return "general_support"; // Fallback to general support
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null; // Return null to indicate an error occurred
  }
};
