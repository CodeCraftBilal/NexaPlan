"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send } from "lucide-react";
import {
  ErrorState,
  LoadingState,
  ProjectHeader,
  TaskComposer,
  useProject,
} from "@/components/project-ui";
import { askProjectAssistant } from "@/lib/project-assistant";
import { errorMessage } from "@/lib/project-data";
import type {
  AssistantMessage,
  AssistantResponse,
  SuggestedTask,
} from "@/lib/types";

type Message = AssistantMessage & { id: string; result?: AssistantResponse };
type Review = { id: string; task: SuggestedTask };
const prompts = [
  "Summarize project progress",
  "What should we work on next?",
  "Identify risks and bottlenecks",
  "Suggest tasks to organize this project",
];

export default function AIAssistantPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return <ProjectAssistant key={projectId} projectId={projectId} />;
}

function ProjectAssistant({ projectId }: { projectId: string }) {
  const { project, tasks, setTasks, loading, error, retry } =
    useProject(projectId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [failedMessage, setFailedMessage] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const active = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(
    () => () => {
      active.current?.abort();
    },
    [],
  );
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || active.current || message.length > 4000) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setRequestError("");
    setFailedMessage("");
    try {
      const result = await askProjectAssistant(
        projectId,
        message,
        messages,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setMessages((previous) => [
        ...previous,
        { id: crypto.randomUUID(), role: "user", content: message },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.reply,
          result,
        },
      ]);
      setInput("");
    } catch (failure) {
      if (controller.signal.aborted) return;
      setRequestError(
        errorMessage(
          failure,
          "The assistant couldn't respond. Please try again.",
        ),
      );
      setFailedMessage(message);
    } finally {
      if (!controller.signal.aborted) {
        active.current = null;
        setBusy(false);
      }
    }
  }

  if (loading) return <LoadingState />;
  if (error || !project)
    return (
      <ErrorState message={error || "Project not found."} onRetry={retry} />
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ProjectHeader project={project} />
      <section className="panel p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles size={21} className="text-primary" />
          Project assistant
        </h2>
        <p className="mt-2 text-md text-[#93998d]">
          Plan work, prioritize tasks, and explore risks using the latest data
          from {project.name}. Review suggestions before saving. This
          conversation lasts until you leave or reload this page.
        </p>
        <p className="mt-2 text-sm text-[#93998d]">
          {tasks.length} tasks in this project. Each message shares project
          details and up to 100 recent tasks with your configured AI provider.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              className="btn-secondary"
              disabled={busy}
              onClick={() => {
                setInput(prompt);
                void send(prompt);
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Project conversation" className="panel p-5 sm:p-6">
        <div
          role="log"
          aria-live="polite"
          aria-busy={busy}
          className="max-h-[60vh] space-y-6 overflow-y-auto wrap-break-word"
        >
          {messages.length === 0 && (
            <p className="py-8 text-center text-[#93998d]">
              Ask a question or choose a prompt to get started. No project
              changes are made by chatting.
            </p>
          )}
          {messages.map((message) => (
            <article
              key={message.id}
              className="rounded-xl border border-border p-4"
            >
              <p className="mb-3 text-lg font-semibold text-primary">
                {message.role === "user" ? "You" : "Project assistant"}
              </p>
              <div className="space-y-3 text-lg leading-7 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_a]:underline">
                <ReactMarkdown components={{ img: () => null }}>
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.result && (
                <p className="mt-3 text-sm text-[#93998d]">
                  Based on {message.result.context.includedTasks} of{" "}
                  {message.result.context.taskCount} tasks at{" "}
                  {new Date(message.result.context.asOf).toLocaleTimeString()}.
                </p>
              )}
              {message.result?.suggestedTasks.map((task, index) => {
                const id = `${message.id}-${index}`;
                return (
                  <div
                    key={id}
                    className="mt-4 rounded-lg border border-border p-4"
                  >
                    <p className="font-medium text-lg">{task.title}</p>
                    <p className="mt-1 whitespace-pre-wrap text-lg text-[#93998d]">
                      {task.description}
                    </p>
                    <p className="my-2 text-lg text-[#93998d]">
                      Suggested priority: {task.priority}
                    </p>
                    {resolved[id] ? (
                      <p role="status" className="text-sm text-primary">
                        {resolved[id]}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {message.result?.canCreateTasks ? (
                          <button
                            className="btn-primary"
                            disabled={review !== null}
                            onClick={() => setReview({ id, task })}
                          >
                            Review and create
                          </button>
                        ) : (
                          <p className="text-sm text-[#93998d]">
                            You have read-only access. Ask a project editor to
                            create this task.
                          </p>
                        )}
                        <button
                          className="btn-secondary"
                          disabled={review !== null}
                          onClick={() =>
                            setResolved((previous) => ({
                              ...previous,
                              [id]: "Dismissed",
                            }))
                          }
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </article>
          ))}
          {busy && (
            <p role="status" className="text-sm text-primary">
              Reviewing your project: {input || failedMessage}
            </p>
          )}
          <div ref={bottom} />
        </div>
        {requestError && (
          <div className="mt-4">
            <ErrorState
              message={requestError}
              onRetry={() => void send(failedMessage)}
            />
          </div>
        )}
        <form
          className="mt-6 space-y-3 border-t border-border pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
        >
          <label
            htmlFor="assistant-message"
            className="block text-sm font-medium"
          >
            Ask about this project
          </label>
          <textarea
            id="assistant-message"
            className="field w-full resize-y text-lg"
            rows={3}
            maxLength={4000}
            value={input}
            disabled={busy}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Help me break the next milestone into tasks..."
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[#93998d]">
              AI suggestions can be mistaken. Review the details.
            </span>
            <button className="btn-primary" disabled={busy || !input.trim()}>
              <Send size={16} />
              {busy ? "Thinking..." : "Send"}
            </button>
          </div>
        </form>
      </section>
      {review && (
        <section aria-label="Review suggested task">
          <TaskComposer
            key={review.id}
            project={project}
            initialValues={review.task}
            onClose={() => setReview(null)}
            onCreated={(task) => {
              setTasks((previous) => [task, ...previous]);
              setResolved((previous) => ({
                ...previous,
                [review.id]: "Task created",
              }));
            }}
          />
        </section>
      )}
    </div>
  );
}
