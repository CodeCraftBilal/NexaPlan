import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export class AIService {
  static async generateProjectPlan(description: string) {
    const prompt = `
      You are an expert project manager. I have an idea for a project: "${description}".
      Please provide a structured project plan with distinct phases. 
      For each phase, suggest 3-5 high-level tasks.
      Return the response in markdown format with clear headings.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw new Error("Failed to generate project plan");
    }
  }

  static async analyzeRisk(projectContext: any) {
    const prompt = `
      Analyze this project data and identify potential risks or bottlenecks:
      ${JSON.stringify(projectContext)}
      
      Provide a concise 3-4 sentence risk analysis and one recommendation.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw new Error("Failed to analyze risks");
    }
  }
}
