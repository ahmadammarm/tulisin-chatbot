import type { GoogleGenAI } from "@google/genai";

/** The slice of the Gemini SDK the app depends on, so tests can supply a fake. */
export type GeminiTextStreamer = {
  models: Pick<GoogleGenAI["models"], "generateContentStream">;
};
