import { GoogleGenAI } from "@google/genai";

/**
 * Generates a service description using the Gemini API.
 * This function will attempt to call the Gemini API. If it fails (e.g., due to a missing API key),
 * it will log an error to the console and return a mock description.
 * @param serviceName The name of the service.
 * @returns A promise that resolves to a generated or mock description string.
 */
export const generateServiceDescription = async (serviceName: string): Promise<string> => {
  const apiKey = localStorage.getItem('gemini_api_key');

  if (!apiKey) {
    console.warn(
      'Gemini API key not found in localStorage. Falling back to a mock description. ' +
      'Please set up your API key in the app.'
    );
    // Simulate network delay for mock response
    await new Promise(resolve => setTimeout(resolve, 500));
    return `A high-quality ${serviceName.toLowerCase()} service, tailored to your needs by our expert stylists. Experience the best in town.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Generate a creative and appealing one-sentence description for a salon service named "${serviceName}". Focus on the benefits and luxurious experience.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using a fast and capable model for this task.
      contents: prompt,
    });

    const description = response.text;
    if (description) {
        return description.trim();
    }
    throw new Error("Received an empty response from Gemini API.");

  } catch (error) {
    console.error("Error generating service description with Gemini:", error);
    // Fallback in case of an API error
    return `An excellent ${serviceName.toLowerCase()} service to meet your needs.`;
  }
};