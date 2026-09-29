import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { requireAPIKey } from "./ai-provider.js";

export class GeminiService {
  static async generateText(prompt: string): Promise<string> {
    const apiKey = requireAPIKey(env.GEMINI_API_KEY, "Gemini");
    try {
      const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 60_000 } });
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt,
      });
      const text = response.text;
      console.log("Response of gemini service is ", text);
      if (!text?.trim()) throw new Error("Empty provider response");
      return text;
    } catch (error) {
      console.error("Gemini request failed ", error);
      throw new HttpError(
        502,
        "Gemini could not generate a response. Please try again.",
      );
    }
  }
}
