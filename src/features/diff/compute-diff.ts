import { diffWordsWithSpace } from "diff";
import { countWords } from "@/lib/text";

export type DiffSegmentKind = "equal" | "added" | "removed";

export type DiffSegment = {
  kind: DiffSegmentKind;
  text: string;
};

export type DiffSummary = {
  addedWords: number;
  removedWords: number;
};

/** Word-level diff between the original selection and the revision. */
export function computeDiff(original: string, revised: string): DiffSegment[] {
  return diffWordsWithSpace(original, revised).map((change) => ({
    kind: change.added ? "added" : change.removed ? "removed" : "equal",
    text: change.value,
  }));
}

/** Counts changed words; whitespace-only segments count as zero. */
export function summarizeDiff(segments: readonly DiffSegment[]): DiffSummary {
  return segments.reduce<DiffSummary>(
    (summary, { kind, text }) => {
      switch (kind) {
        case "added":
          return { ...summary, addedWords: summary.addedWords + countWords(text) };
        case "removed":
          return { ...summary, removedWords: summary.removedWords + countWords(text) };
        case "equal":
          return summary;
      }
    },
    { addedWords: 0, removedWords: 0 },
  );
}
