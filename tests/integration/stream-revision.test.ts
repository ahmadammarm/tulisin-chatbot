import { describe, expect, it } from "vitest";
import type { AssistRequest } from "@/features/assist/model/schema";
import { createFakeGemini, readStream } from "@tests/helpers/fake-gemini";
import { streamRevision } from "@/features/assist/server/stream-revision";

const request: AssistRequest = {
  directive: "kalimat-efektif",
  selection: "Para mahasiswa-mahasiswa sedang belajar.",
  context: { before: "", after: "" },
};

describe("streamRevision", () => {
  it("streams the model's text chunks as UTF-8 bytes", async () => {
    const client = createFakeGemini(["Para mahasiswa ", "", "sedang belajar."]);
    const stream = await streamRevision(request, { client, model: "test-model" });
    expect(await readStream(stream)).toBe("Para mahasiswa sedang belajar.");
  });

  it("sends the model, prompt, and directive instruction to Gemini", async () => {
    const client = createFakeGemini([]);
    await streamRevision(request, { client, model: "test-model" });

    const [call] = client.calls;
    expect(call?.model).toBe("test-model");
    expect(call?.contents).toContain(request.selection);
    expect(call?.config?.systemInstruction).toContain("concise");
  });

  it("rejects before streaming when the request fails", async () => {
    const client = createFakeGemini([], { failOnStart: true });
    await expect(streamRevision(request, { client, model: "test-model" })).rejects.toThrow(
      "upstream unavailable",
    );
  });

  it("errors the stream when Gemini fails midway", async () => {
    const client = createFakeGemini(["Para ", "mahasiswa"], { failAfter: 1 });
    const stream = await streamRevision(request, { client, model: "test-model" });
    await expect(readStream(stream)).rejects.toThrow("stream interrupted");
  });
});
