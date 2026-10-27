export const APP_ERROR_CODES = [
  "OFFICE_UNAVAILABLE",
  "EMPTY_SELECTION",
  "SELECTION_TOO_LONG",
  "SELECTION_CHANGED",
  "INVALID_REQUEST",
  "AI_FAILED",
  "NETWORK_FAILED",
  "UNKNOWN",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, options?: { cause?: Error }) {
    super(code, options);
    this.name = "AppError";
    this.code = code;
  }
}

/**
 * The only place allowed to accept `unknown`: `catch` clauses are typed
 * `unknown` by TypeScript, so every caught value is converted here once.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError(error.name === "TypeError" ? "NETWORK_FAILED" : "UNKNOWN", {
      cause: error,
    });
  }
  return new AppError("UNKNOWN");
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
