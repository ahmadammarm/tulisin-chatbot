/** Collapses all whitespace runs, so Word's \r line endings compare equal to \n. */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** True when the texts differ in more than whitespace. */
export function hasMeaningfulChanges(original: string, revised: string): boolean {
  return normalizeWhitespace(original) !== normalizeWhitespace(revised);
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

const LEADING_WHITESPACE = /^\s*/;
const TRAILING_WHITESPACE = /\s*$/;

/**
 * Re-applies the original's leading and trailing whitespace to the (trimmed) revision.
 * A selected paragraph usually ends with its paragraph mark; dropping it would merge
 * the paragraph with the next one.
 */
export function preserveEdgeWhitespace(original: string, revised: string): string {
  const leading = LEADING_WHITESPACE.exec(original)?.[0] ?? "";
  const trailing = TRAILING_WHITESPACE.exec(original)?.[0] ?? "";
  return `${leading}${revised.trim()}${trailing}`;
}
