import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeGemini, readStream } from "@/test/fake-gemini";
import type { GeminiTextStreamer } from "@/server/assist/stream-revision";

const gemini = vi.hoisted(() => ({ client: null as GeminiTextStreamer | null }));

vi.mock("@/config/env", () => ({
  getServerEnv: () => ({ GEMINI_API_KEY: "test-key", GEMINI_MODEL: "test-model" }),
}));
vi.mock("@/server/gemini/client", () => ({
  getGeminiClient: () => gemini.client,
}));

const { POST } = await import("./route");

function postJson(body: string): Request {
  return new Request("http://localhost/api/assist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

const validBody = JSON.stringify({
  directive: "bakukan",
  selection: "Data nya di ambil kemarin.",
  context: { before: "", after: "" },
});

describe("POST /api/assist", () => {
  beforeEach(() => {
    gemini.client = createFakeGemini(["Datanya ", "diambil kemarin."]);
  });

  it("streams the revision as plain text", async () => {
    const response = await POST(postJson(validBody));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(response.body && (await readStream(response.body))).toBe("Datanya diambil kemarin.");
  });

  it.each([
    ["malformed JSON", "{not json"],
    ["an invalid body", JSON.stringify({ directive: "bakukan", selection: "" })],
  ])("returns 400 INVALID_REQUEST for %s", async (_label, body) => {
    const response = await POST(postJson(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "INVALID_REQUEST" } });
  });

  it("returns 502 AI_FAILED without leaking upstream details", async () => {
    gemini.client = createFakeGemini([], { failOnStart: true });
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(postJson(validBody));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: { code: "AI_FAILED" } });
  });
});
