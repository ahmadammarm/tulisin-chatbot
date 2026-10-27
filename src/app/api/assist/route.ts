import { getServerEnv } from "@/lib/config";
import { assistRequestSchema, type ApiError } from "@/features/assist/model/schema";
import type { AppErrorCode } from "@/lib/errors";
import { streamRevision } from "@/features/assist/server/stream-revision";
import { getGeminiClient } from "@/lib/gemini";

function errorResponse(code: AppErrorCode, status: number): Response {
  const body: ApiError = { error: { code } };
  return Response.json(body, { status });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = assistRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return errorResponse("INVALID_REQUEST", 400);

  try {
    const stream = await streamRevision(parsed.data, {
      client: getGeminiClient(),
      model: getServerEnv().GEMINI_MODEL,
      signal: request.signal,
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/assist] Gemini request failed", error);
    return errorResponse("AI_FAILED", 502);
  }
}
