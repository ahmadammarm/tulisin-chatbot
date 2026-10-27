const CODE_FENCE = /^```[\w-]*\n?|\n?```$/g;
const WRAPPING_QUOTES = /^["“”'](.*)["“”']$/s;

/** Removes formatting artifacts the model sometimes adds around its answer. */
export function sanitizeOutput(raw: string): string {
  const unfenced = raw.trim().replace(CODE_FENCE, "").trim();
  const unquoted = WRAPPING_QUOTES.exec(unfenced)?.[1] ?? unfenced;
  return unquoted.trim();
}
