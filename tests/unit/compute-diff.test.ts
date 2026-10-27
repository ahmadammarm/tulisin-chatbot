import { describe, expect, it } from "vitest";
import { computeDiff, summarizeDiff } from "@/lib/diff";

describe("computeDiff", () => {
  it("marks replaced words as removed then added", () => {
    expect(computeDiff("kami menganalisa data", "kami menganalisis data")).toEqual([
      { kind: "equal", text: "kami " },
      { kind: "removed", text: "menganalisa" },
      { kind: "added", text: "menganalisis" },
      { kind: "equal", text: " data" },
    ]);
  });

  it("returns a single equal segment for identical text", () => {
    expect(computeDiff("sama", "sama")).toEqual([{ kind: "equal", text: "sama" }]);
  });

  it("reconstructs both texts from the segments", () => {
    const original = "Data nya di ambil dari kuesioner.";
    const revised = "Datanya diambil dari kuesioner.";
    const segments = computeDiff(original, revised);
    const join = (skip: "added" | "removed") =>
      segments.filter((segment) => segment.kind !== skip).map((segment) => segment.text).join("");
    expect(join("added")).toBe(original);
    expect(join("removed")).toBe(revised);
  });
});

describe("summarizeDiff", () => {
  it("counts added and removed words", () => {
    const segments = computeDiff(
      "Data nya di ambil dari kuesioner.",
      "Datanya diambil dari kuesioner online.",
    );
    expect(summarizeDiff(segments)).toEqual({ addedWords: 3, removedWords: 4 });
  });

  it("ignores whitespace-only changes", () => {
    expect(summarizeDiff(computeDiff("satu  dua", "satu dua"))).toEqual({
      addedWords: 0,
      removedWords: 0,
    });
  });
});
