export type DiffSegmentKind = "equal" | "added" | "removed";

export type DiffSegment = {
  kind: DiffSegmentKind;
  text: string;
};

export type DiffSummary = {
  addedWords: number;
  removedWords: number;
};
