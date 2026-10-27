import { describe, expect, it } from "vitest";
import type { AssistState } from "@/features/assist/model/assist-reducer";
import { SAMPLE_SELECTION } from "@/features/document/adapters/mock-adapter";
import { deriveStatus } from "@/features/task-pane/model/derive-status";
import type { AppErrorCode } from "@/lib/errors";
import { STRINGS } from "@/shared/constants/strings";

const readyState = (applyError: AppErrorCode | null): AssistState => ({
  status: "ready",
  revision: { directive: "bakukan", source: SAMPLE_SELECTION, revised: "Revisi." },
  hasChanges: true,
  applyError,
});

describe("deriveStatus", () => {
  it("prioritizes selection errors over the assist state", () => {
    expect(deriveStatus("EMPTY_SELECTION", { status: "applied" })).toEqual({
      tone: "error",
      text: STRINGS.errors.EMPTY_SELECTION,
    });
  });

  it("reports assist failures as errors", () => {
    expect(deriveStatus(null, { status: "failed", code: "AI_FAILED" })).toEqual({
      tone: "error",
      text: STRINGS.errors.AI_FAILED,
    });
  });

  it("reports apply errors on a ready revision", () => {
    expect(deriveStatus(null, readyState("SELECTION_CHANGED"))).toMatchObject({
      tone: "error",
      text: STRINGS.errors.SELECTION_CHANGED,
    });
    expect(deriveStatus(null, readyState(null))).toBeNull();
  });

  it("confirms an applied revision", () => {
    expect(deriveStatus(null, { status: "applied" })).toEqual({
      tone: "success",
      text: STRINGS.status.applied,
    });
  });

  it("shows nothing while idle", () => {
    expect(deriveStatus(null, { status: "idle" })).toBeNull();
  });
});
