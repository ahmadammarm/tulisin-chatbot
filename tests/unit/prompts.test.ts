import { describe, expect, it } from "vitest";
import { DIRECTIVE_IDS, DIRECTIVES } from "@/features/directives/model/directives";
import { buildSystemInstruction, buildUserPrompt } from "@/features/assist/model/prompts";
import type { AssistRequest } from "@/features/assist/model/schema";

const baseRequest: AssistRequest = {
  directive: "bakukan",
  selection: "Kami menganalisa data nya.",
  context: { before: "Paragraf sebelum.", after: "Paragraf sesudah." },
};

describe("buildSystemInstruction", () => {
  it.each(DIRECTIVE_IDS)("includes the %s task instruction and shared rules", (id) => {
    const instruction = buildSystemInstruction(id);
    expect(instruction).toContain(DIRECTIVES[id].instruction);
    expect(instruction).toContain("Output ONLY the revised TEXT");
  });
});

describe("buildUserPrompt", () => {
  it("labels the selection and surrounding context", () => {
    const prompt = buildUserPrompt(baseRequest);
    expect(prompt).toContain("CONTEXT BEFORE (do not rewrite):\nParagraf sebelum.");
    expect(prompt).toContain("TEXT:\nKami menganalisa data nya.");
    expect(prompt).toContain("CONTEXT AFTER (do not rewrite):\nParagraf sesudah.");
    expect(prompt.indexOf("CONTEXT BEFORE")).toBeLessThan(prompt.indexOf("TEXT:"));
  });

  it("omits empty context sections", () => {
    const prompt = buildUserPrompt({ ...baseRequest, context: { before: "", after: "" } });
    expect(prompt).toBe("TEXT:\nKami menganalisa data nya.");
  });
});
