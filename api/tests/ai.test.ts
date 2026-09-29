import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/not_used";
process.env.JWT_SECRET = "isolated-ai-test-secret";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.OPENAI_API_KEY = "";
process.env.GEMINI_API_KEY = "";
delete process.env.AI_PROVIDER;
const { env } = await import("../src/config/env.js");
const { AIService } = await import("../src/services/ai.service.js");
const { OpenAIService } = await import("../src/services/openai.service.js");
const { GeminiService } = await import("../src/services/gemini.service.js");
const initial = { ...env };
afterEach(() => {
  mock.restoreAll();
  Object.assign(env, initial);
});

test("wrapper selects providers for both operations and respects explicit overrides", async () => {
  const openai = mock.method(
    OpenAIService,
    "generateText",
    async () => "openai",
  );
  const gemini = mock.method(
    GeminiService,
    "generateText",
    async () => "gemini",
  );
  env.OPENAI_API_KEY = "test-openai";
  env.GEMINI_API_KEY = "test-gemini";
  assert.equal(await AIService.generateProjectPlan("Build a board"), "openai");
  assert.equal(await AIService.analyzeRisk({ tasks: [] }), "openai");
  assert.match(openai.mock.calls[0]!.arguments[0], /Build a board/);
  assert.match(openai.mock.calls[1]!.arguments[0], /"tasks":\[\]/);
  env.AI_PROVIDER = "gemini";
  assert.equal(await AIService.generateProjectPlan("Project"), "gemini");
  assert.equal(await AIService.analyzeRisk({}), "gemini");
  env.AI_PROVIDER = undefined;
  env.OPENAI_API_KEY = "your-OPENAI-api-key-here";
  assert.equal(await AIService.generateProjectPlan("Project"), "gemini");
  assert.equal(gemini.mock.callCount(), 3);
});

test("missing and placeholder keys fail without network calls or provider fallback", async () => {
  mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected network call");
  });
  for (const key of ["", "your-OPENAI-api-key-here"]) {
    env.OPENAI_API_KEY = key;
    env.GEMINI_API_KEY = "configured-gemini";
    env.AI_PROVIDER = "openai";
    await assert.rejects(AIService.generateProjectPlan("Project"), {
      statusCode: 503,
    });
  }
  env.GEMINI_API_KEY = "your-gemini-api-key-here";
  await assert.rejects(GeminiService.generateText("test"), { statusCode: 503 });
});

test("OpenAI sends configured model and aggregates text after reasoning output", async () => {
  env.OPENAI_API_KEY = "test-key";
  env.OPENAI_MODEL = "test-model";
  mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    assert.deepEqual(JSON.parse(String(options?.body)), {
      model: "test-model",
      input: "prompt",
      store: false,
    });
    assert.equal(
      new Headers(options?.headers).get("Authorization"),
      "Bearer test-key",
    );
    return Response.json({
      status: "completed",
      output: [
        { type: "reasoning" },
        {
          type: "message",
          content: [
            { type: "output_text", text: "First" },
            { type: "output_text", text: "Second" },
          ],
        },
      ],
    });
  });
  assert.equal(await OpenAIService.generateText("prompt"), "First\nSecond");
});

test("OpenAI rejects failed, incomplete, malformed and empty responses safely", async () => {
  env.OPENAI_API_KEY = "test-key";
  const responses = [
    new Response("private provider error", { status: 429 }),
    Response.json({ status: "incomplete", output: [] }),
    Response.json({ status: "completed", output: [] }),
    Response.json({ unexpected: true }),
    new Response("invalid json"),
  ];
  for (const response of responses) {
    mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(OpenAIService.generateText("prompt"), {
      statusCode: 502,
      message: "OpenAI could not generate a response. Please try again.",
    });
    mock.restoreAll();
  }
  mock.method(globalThis, "fetch", async () => {
    throw new Error("private connection error");
  });
  await assert.rejects(OpenAIService.generateText("prompt"), {
    statusCode: 502,
  });
});
