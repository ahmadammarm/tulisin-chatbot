import { countWords } from "@/lib/text";
import type { DiffSegment, DiffSummary } from "./types";

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
