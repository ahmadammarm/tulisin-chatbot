import "server-only";
import type { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { buildSystemInstruction, buildUserPrompt } from "@/features/assist/prompts";
import type { AssistRequest } from "@/features/assist/schema";

/** The slice of the Gemini SDK this feature depends on, so tests can supply a fake. */
export type GeminiTextStreamer = {
  models: Pick<GoogleGenAI["models"], "generateContentStream">;
};

export type StreamRevisionDeps = {
  client: GeminiTextStreamer;
  model: string;
  signal?: AbortSignal;
};

/** Re-types the SDK stream (whose return value is `any`) and drops empty chunks. */
async function* textChunks(
  responses: AsyncIterable<GenerateContentResponse>,
): AsyncGenerator<string, void, undefined> {
  for await (const response of responses) {
    if (response.text) yield response.text;
  }
}

/**
 * Starts a Gemini stream for the request and exposes it as UTF-8 text bytes.
 * Awaits the first response so request-level failures surface before streaming starts.
 */
export async function streamRevision(
  request: AssistRequest,
  { client, model, signal }: StreamRevisionDeps,
): Promise<ReadableStream<Uint8Array>> {
  const response = await client.models.generateContentStream({
    model,
    contents: buildUserPrompt(request),
    config: {
      // No sampling params: Gemini 3.x ignores temperature/topP/topK and will reject them in later models.
      systemInstruction: buildSystemInstruction(request.directive),
      ...(signal && { abortSignal: signal }),
    },
  });

  const chunks = textChunks(response);
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await chunks.next();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(value));
    },
    async cancel() {
      await chunks.return(undefined);
    },
  });
}
