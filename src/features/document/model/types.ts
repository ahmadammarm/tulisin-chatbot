import type { RevisionInput, SelectionSnapshot } from "@/shared/types/selection";

/** Everything the task pane needs from a document, independent of Office.js. */
export type DocumentAdapter = {
  readSelection: () => Promise<SelectionSnapshot>;
  applyRevision: (input: RevisionInput) => Promise<void>;
};
