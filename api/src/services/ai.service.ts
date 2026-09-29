import { env } from "../config/env.js";
import { hasAPIKey, type AIProvider } from "./ai-provider.js";
import { GeminiService } from "./gemini.service.js";
import { OpenAIService } from "./openai.service.js";

function getProvider(): AIProvider {
  const provider =
    env.AI_PROVIDER ?? (hasAPIKey(env.OPENAI_API_KEY) ? "openai" : "gemini");
  return provider === "openai" ? OpenAIService : GeminiService;
}

export class AIService {
  static async generateProjectPlan(description: string): Promise<string> {
    return getProvider().generateText(`
      You are an expert project manager. I have an idea for a project: "${description}".
      Please provide a structured project plan with distinct phases.
      For each phase, suggest 3-5 high-level tasks.
      Return the response in markdown format with clear headings.
    `);
  }

  static async analyzeRisk(projectContext: unknown): Promise<string> {
    return getProvider().generateText(`
      Analyze this project data and identify potential risks or bottlenecks:
      ${JSON.stringify(projectContext)}
      Provide a concise 3-4 sentence risk analysis and one recommendation.
    `);
  }
}
