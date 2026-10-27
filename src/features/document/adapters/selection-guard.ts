import { AppError } from "@/lib/errors";
import { normalizeWhitespace } from "@/lib/text";

export function assertSelectionUnchanged(current: string, original: string): void {
  if (normalizeWhitespace(current) !== normalizeWhitespace(original)) {
    throw new AppError("SELECTION_CHANGED");
  }
}

export function assertSelectionNotEmpty(text: string): void {
  if (text.trim().length === 0) throw new AppError("EMPTY_SELECTION");
}
