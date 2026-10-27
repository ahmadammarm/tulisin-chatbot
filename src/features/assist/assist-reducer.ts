import type { DirectiveId } from "@/features/directives/directives";
import type { SelectionSnapshot } from "@/features/document/types";
import type { AppErrorCode } from "@/lib/errors";
import { hasMeaningfulChanges } from "@/lib/text";
import { sanitizeOutput } from "./sanitize-output";

export type Revision = {
  directive: DirectiveId;
  source: SelectionSnapshot;
  revised: string;
};

export type AssistState =
  | { status: "idle" }
  | { status: "streaming"; revision: Revision }
  | {
      status: "ready";
      revision: Revision;
      /** False when the revision only differs from the source in whitespace. */
      hasChanges: boolean;
      applyError: AppErrorCode | null;
    }
  | { status: "applying"; revision: Revision }
  | { status: "applied" }
  | { status: "failed"; code: AppErrorCode };

export type AssistAction =
  | { type: "start"; directive: DirectiveId; source: SelectionSnapshot }
  | { type: "chunk"; text: string }
  | { type: "finish" }
  | { type: "fail"; code: AppErrorCode }
  | { type: "apply" }
  | { type: "applied" }
  | { type: "applyFailed"; code: AppErrorCode }
  | { type: "reset" };

export const INITIAL_ASSIST_STATE: AssistState = { status: "idle" };

export function assistReducer(state: AssistState, action: AssistAction): AssistState {
  switch (action.type) {
    case "start":
      return {
        status: "streaming",
        revision: { directive: action.directive, source: action.source, revised: "" },
      };
    case "chunk":
      if (state.status !== "streaming") return state;
      return {
        ...state,
        revision: { ...state.revision, revised: state.revision.revised + action.text },
      };
    case "finish": {
      if (state.status !== "streaming") return state;
      const revised = sanitizeOutput(state.revision.revised);
      if (!revised) return { status: "failed", code: "AI_FAILED" };
      return {
        status: "ready",
        revision: { ...state.revision, revised },
        hasChanges: hasMeaningfulChanges(state.revision.source.text, revised),
        applyError: null,
      };
    }
    case "fail":
      return { status: "failed", code: action.code };
    case "apply":
      if (state.status !== "ready" || !state.hasChanges) return state;
      return { status: "applying", revision: state.revision };
    case "applied":
      return { status: "applied" };
    case "applyFailed":
      if (state.status !== "applying") return state;
      // Only revisions with changes can reach "applying".
      return {
        status: "ready",
        revision: state.revision,
        hasChanges: true,
        applyError: action.code,
      };
    case "reset":
      return INITIAL_ASSIST_STATE;
  }
}
