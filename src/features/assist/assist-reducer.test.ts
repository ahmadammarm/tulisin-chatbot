import { describe, expect, it } from "vitest";
import { SAMPLE_SELECTION } from "@/features/document/mock-adapter";
import { assistReducer, INITIAL_ASSIST_STATE, type AssistState } from "./assist-reducer";

function streamOf(...chunks: string[]): AssistState {
  return chunks.reduce(
    (state, text) => assistReducer(state, { type: "chunk", text }),
    assistReducer(INITIAL_ASSIST_STATE, {
      type: "start",
      directive: "bakukan",
      source: SAMPLE_SELECTION,
    }),
  );
}

describe("assistReducer", () => {
  it("accumulates streamed chunks", () => {
    const state = streamOf("Pada ", "penelitian ini");
    expect(state.status === "streaming" && state.revision.revised).toBe("Pada penelitian ini");
  });

  it("sanitizes the revision when the stream finishes", () => {
    const state = assistReducer(streamOf("```\nTeks baku.\n```"), { type: "finish" });
    expect(state).toMatchObject({ status: "ready", revision: { revised: "Teks baku." } });
  });

  it("fails when the model returns nothing", () => {
    const state = assistReducer(streamOf("  "), { type: "finish" });
    expect(state).toEqual({ status: "failed", code: "AI_FAILED" });
  });

  it("returns to ready with the error when applying fails", () => {
    const ready = assistReducer(streamOf("Teks baku."), { type: "finish" });
    const applying = assistReducer(ready, { type: "apply" });
    const failed = assistReducer(applying, { type: "applyFailed", code: "SELECTION_CHANGED" });
    expect(failed).toMatchObject({ status: "ready", applyError: "SELECTION_CHANGED" });
  });

  it("marks a revision with real edits as having changes", () => {
    const state = assistReducer(streamOf("Teks baku."), { type: "finish" });
    expect(state).toMatchObject({ status: "ready", hasChanges: true });
  });

  it("marks a whitespace-only revision as unchanged and refuses to apply it", () => {
    const unchanged = `${SAMPLE_SELECTION.text.replaceAll(" ", "  ")}\n`;
    const ready = assistReducer(streamOf(unchanged), { type: "finish" });
    expect(ready).toMatchObject({ status: "ready", hasChanges: false });
    expect(assistReducer(ready, { type: "apply" })).toBe(ready);
  });

  it("ignores chunks that arrive after a reset", () => {
    const reset = assistReducer(streamOf("Teks"), { type: "reset" });
    expect(assistReducer(reset, { type: "chunk", text: "late" })).toEqual(INITIAL_ASSIST_STATE);
  });
});
