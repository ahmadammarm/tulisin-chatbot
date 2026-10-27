import { describe, expect, it } from "vitest";
import { assistRequestSchema, MAX_SELECTION_LENGTH } from "@/features/assist/model/schema";

const valid = {
  directive: "parafrase",
  selection: "Teks yang dipilih.",
  context: { before: "", after: "" },
};

describe("assistRequestSchema", () => {
  it("accepts a valid request", () => {
    expect(assistRequestSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["an empty selection", { ...valid, selection: "   " }],
    ["an overly long selection", { ...valid, selection: "a".repeat(MAX_SELECTION_LENGTH + 1) }],
    ["an unknown directive", { ...valid, directive: "terjemahkan" }],
    ["a missing context", { directive: valid.directive, selection: valid.selection }],
    ["a non-object body", null],
  ])("rejects %s", (_label, body) => {
    expect(assistRequestSchema.safeParse(body).success).toBe(false);
  });
});
