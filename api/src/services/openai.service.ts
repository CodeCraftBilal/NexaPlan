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
    } catch (error) {
      console.error("OpenAI request failed ", error);
      // Provider errors may contain credentials or submitted project data.
      throw new HttpError(
        502,
        "OpenAI could not generate a response. Please try again.",
      );
    }
  }

  static async generateRapidText(prompt: string): Promise<string> {
    const apiKey = requireAPIKey(env.RAPID_API_KEY, "Rapid");
    const url = "https://chatgpt-42.p.rapidapi.com/conversationgpt4-2";
    const options = {
      method: "POST",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_tokens: 2000,
        messages: [
          {
            content: prompt,
            role: "user",
          },
        ],
        system_prompt: "",
        temperature: 0.9,
        top_k: 5,
        top_p: 0.9,
        web_access: false,
      }),
      signal: AbortSignal.timeout(60_000),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error("Provider request failed");

      const result = await response.text();
      try {
        const json = JSON.parse(result);
        const text =
          json.result ??
          json.text ??
          json.answer ??
          json.choices?.[0]?.message?.content ??
          json.message;
        if (text && typeof text === "string") return text;
        return result;
      } catch (e) {
        // If it's not JSON or parsing fails, return raw text if valid, else throw.
        if (result.trim()) return result;
        throw new Error("Empty provider response");
      }
    } catch (error) {
      console.error("Rapid API request failed ", error);
      throw new HttpError(
        502,
        "Rapid API could not generate a response. Please try again.",
      );
    }
  }
}
