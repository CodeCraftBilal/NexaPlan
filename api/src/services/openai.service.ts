import { z } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { requireAPIKey } from "./ai-provider.js";

const responseSchema = z.object({
  status: z.literal("completed"),
  output: z.array(
    z.object({
      type: z.string(),
      content: z
        .array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
          }),
        )
        .optional(),
    }),
  ),
});

export class OpenAIService {
  static async generateText(prompt: string): Promise<string> {
    const apiKey = requireAPIKey(env.OPENAI_API_KEY, "OpenAI");
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL,
          input: prompt,
          store: false,
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!response.ok) throw new Error("Provider request failed");
      const result = responseSchema.parse(await response.json());
      const text = result.output
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content ?? [])
        .filter((part) => part.type === "output_text")
        .map((part) => part.text ?? "")
        .join("\n");
      if (!text.trim()) throw new Error("Empty provider response");
      return text;
    } catch {
      // Provider errors may contain credentials or submitted project data.
      throw new HttpError(
        502,
        "OpenAI could not generate a response. Please try again.",
      );
    }
  }
}
