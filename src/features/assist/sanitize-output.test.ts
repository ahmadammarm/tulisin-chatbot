import { describe, expect, it } from "vitest";
import { sanitizeOutput } from "./sanitize-output";

describe("sanitizeOutput", () => {
  it.each([
    ["trims whitespace", "  Teks baku.\n", "Teks baku."],
    ["removes code fences", "```text\nTeks baku.\n```", "Teks baku."],
    ["removes wrapping quotes", "“Teks baku.”", "Teks baku."],
    ["keeps inner quotes", 'Istilah "daring" dipakai.', 'Istilah "daring" dipakai.'],
    ["keeps paragraph breaks", "Paragraf satu.\n\nParagraf dua.", "Paragraf satu.\n\nParagraf dua."],
  ])("%s", (_label, input, expected) => {
    expect(sanitizeOutput(input)).toBe(expected);
  });
});
