import { api } from "@/lib/api";
import type { ApiResponse, AssistantMessage, AssistantResponse } from "./types";

export async function askProjectAssistant(
  projectId: string,
  message: string,
  history: AssistantMessage[],
  signal: AbortSignal,
) {
  const response = await api.post<ApiResponse<AssistantResponse>>(
    "/ai/chat",
    {
      projectId,
      message,
      history: history
        .slice(-10)
        .map(({ role, content }) => ({
          role,
          content: content.slice(0, 4000),
        })),
    },
    { timeout: 75000, signal },
  );
  return response.data.data;
}
