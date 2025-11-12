import { GoogleGenAI } from "@google/genai";

// The API_KEY is assumed to be available in the environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Feat: Replaced mocked description generation with a real Gemini API call.
export const generateServiceDescription = async (serviceName: string): Promise<string> => {
  console.log(`Generating description for: ${serviceName}`);

  if (!process.env.API_KEY) {
    return "API Key not found. Please set it up to use AI features.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, appealing, and professional service description for a salon/barber shop. The service is called "${serviceName}". Keep it under 50 words.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return `Failed to generate description for ${serviceName}. Please try again later.`;
  }
};
