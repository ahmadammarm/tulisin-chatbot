import "server-only";
import { GoogleGenAI } from "@google/genai";
import { getServerEnv } from "@/config/env";

let client: GoogleGenAI | undefined;

export function getGeminiClient(): GoogleGenAI {
  client ??= new GoogleGenAI({ apiKey: getServerEnv().GEMINI_API_KEY });
  return client;
}
