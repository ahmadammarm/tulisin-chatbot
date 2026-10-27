import { GenerateContentResponse, type GenerateContentParameters } from "@google/genai";
import type { GeminiTextStreamer } from "@/server/assist/stream-revision";

export function textResponse(text: string): GenerateContentResponse {
  return Object.assign(new GenerateContentResponse(), {
    candidates: [{ content: { role: "model", parts: [{ text }] } }],
  });
}

type FakeGemini = GeminiTextStreamer & { calls: GenerateContentParameters[] };

/** A Gemini client double that streams the given chunks, optionally failing midway. */
export function createFakeGemini(
  chunks: string[],
  options: { failAfter?: number; failOnStart?: boolean } = {},
): FakeGemini {
  const calls: GenerateContentParameters[] = [];

  async function* stream(): AsyncGenerator<GenerateContentResponse> {
    for (const [index, chunk] of chunks.entries()) {
      if (index === options.failAfter) throw new Error("stream interrupted");
      yield await Promise.resolve(textResponse(chunk));
    }
  }

  return {
    calls,
    models: {
      generateContentStream: (params) => {
        calls.push(params);
        return options.failOnStart
          ? Promise.reject(new Error("upstream unavailable"))
          : Promise.resolve(stream());
      },
    },
  };
}

export async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}
