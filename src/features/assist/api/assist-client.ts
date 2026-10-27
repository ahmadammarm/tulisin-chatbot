import { AppError } from "@/lib/errors";
import { apiErrorSchema, type AssistRequest } from "@/features/assist/model/schema";

const ASSIST_ENDPOINT = "/api/assist";

async function toResponseError(response: Response): Promise<AppError> {
  const parsed = apiErrorSchema.safeParse(await response.json().catch(() => null));
  return new AppError(parsed.success ? parsed.data.error.code : "AI_FAILED");
}

/** Sends an assist request and yields the revision text as it streams in. */
export async function* streamAssist(
  request: AssistRequest,
  signal: AbortSignal,
): AsyncGenerator<string, void, undefined> {
  const response = await fetch(ASSIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) throw await toResponseError(response);
  if (!response.body) throw new AppError("AI_FAILED");

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
