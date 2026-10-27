import { diffWordsWithSpace } from "diff";
import type { DiffSegment } from "./types";

/** Word-level diff between the original text and its revision. */
export function computeDiff(original: string, revised: string): DiffSegment[] {
  return diffWordsWithSpace(original, revised).map((change) => ({
    kind: change.added ? "added" : change.removed ? "removed" : "equal",
    text: change.value,
  }));
}
