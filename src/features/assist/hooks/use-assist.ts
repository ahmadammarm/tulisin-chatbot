"use client";

import { useEffect, useReducer, useRef } from "react";
import type { DirectiveId } from "@/features/directives/model/directives";
import type { DocumentAdapter } from "@/features/document/model/types";
import type { SelectionSnapshot } from "@/shared/types/selection";
import { isAbortError, toAppError } from "@/lib/errors";
import { preserveEdgeWhitespace } from "@/lib/text";
import { streamAssist } from "@/features/assist/api/assist-client";
import { assistReducer, INITIAL_ASSIST_STATE, type AssistState } from "@/features/assist/model/assist-reducer";
import { MAX_SELECTION_LENGTH } from "@/features/assist/model/schema";

export type UseAssistResult = {
  state: AssistState;
  run: (directive: DirectiveId, source: SelectionSnapshot) => Promise<void>;
  cancel: () => void;
  apply: () => Promise<void>;
  reset: () => void;
};

export function useAssist(adapter: DocumentAdapter): UseAssistResult {
  const [state, dispatch] = useReducer(assistReducer, INITIAL_ASSIST_STATE);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function run(directive: DirectiveId, source: SelectionSnapshot) {
    if (source.text.length > MAX_SELECTION_LENGTH) {
      dispatch({ type: "fail", code: "SELECTION_TOO_LONG" });
      return;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    dispatch({ type: "start", directive, source });
    try {
      const request = { directive, selection: source.text, context: source.context };
      for await (const text of streamAssist(request, controller.signal)) {
        dispatch({ type: "chunk", text });
      }
      dispatch({ type: "finish" });
    } catch (error) {
      if (isAbortError(error)) return;
      dispatch({ type: "fail", code: toAppError(error).code });
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }

  function cancel() {
    controllerRef.current?.abort();
    dispatch({ type: "reset" });
  }

  async function apply() {
    if (state.status !== "ready" || !state.hasChanges) return;
    const { source, revised } = state.revision;

    dispatch({ type: "apply" });
    try {
      await adapter.applyRevision({
        original: source.text,
        revised: preserveEdgeWhitespace(source.text, revised),
      });
      dispatch({ type: "applied" });
    } catch (error) {
      dispatch({ type: "applyFailed", code: toAppError(error).code });
    }
  }

  function reset() {
    dispatch({ type: "reset" });
  }

  return { state, run, cancel, apply, reset };
}
