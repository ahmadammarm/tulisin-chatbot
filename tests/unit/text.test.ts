import { describe, expect, it } from "vitest";
import {
  countWords,
  hasMeaningfulChanges,
  normalizeWhitespace,
  preserveEdgeWhitespace,
} from "@/lib/text";

describe("normalizeWhitespace", () => {
  it("collapses Word line endings and repeated spaces", () => {
    expect(normalizeWhitespace("  Satu.\r\n\r\nDua   tiga. ")).toBe("Satu. Dua tiga.");
  });
});

describe("hasMeaningfulChanges", () => {
  it.each([
    ["identical text", "Teks baku.", "Teks baku.", false],
    ["whitespace-only differences", "Teks  baku.\r", "Teks baku.", false],
    ["a changed word", "Teks baku.", "Teks standar.", true],
    ["changed punctuation", "Teks baku", "Teks baku.", true],
  ])("%s → %s", (_label, original, revised, expected) => {
    expect(hasMeaningfulChanges(original, revised)).toBe(expected);
  });
});

describe("countWords", () => {
  it.each([
    ["", 0],
    ["   \n ", 0],
    ["satu", 1],
    [" data nya diambil ", 3],
  ])("counts %j as %i", (text, expected) => {
    expect(countWords(text)).toBe(expected);
  });
});

describe("preserveEdgeWhitespace", () => {
  it("keeps the original paragraph mark after the revision", () => {
    expect(preserveEdgeWhitespace("Data nya diambil.\r", "Datanya diambil.")).toBe(
      "Datanya diambil.\r",
    );
  });

  it("keeps leading whitespace and trims the revision's own edges", () => {
    expect(preserveEdgeWhitespace("  kalimat ", "\nKalimat.\n")).toBe("  Kalimat. ");
  });

  it("returns the trimmed revision when the original has no edge whitespace", () => {
    expect(preserveEdgeWhitespace("kalimat", " Kalimat. ")).toBe("Kalimat.");
  });
});
