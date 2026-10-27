import type { AssistState } from "@/features/assist/model/assist-reducer";
import type { AppErrorCode } from "@/lib/errors";
import { STRINGS } from "@/shared/constants/strings";
import type { StatusMessage } from "@/shared/types/status";

function errorMessage(code: AppErrorCode): StatusMessage {
  return { tone: "error", text: STRINGS.errors[code] };
}

/** The single banner shown under the actions; selection errors take priority. */
export function deriveStatus(
  selectionError: AppErrorCode | null,
  assist: AssistState,
): StatusMessage | null {
  if (selectionError) return errorMessage(selectionError);
  switch (assist.status) {
    case "failed":
      return errorMessage(assist.code);
    case "ready":
      return assist.applyError ? errorMessage(assist.applyError) : null;
    case "applied":
      return { tone: "success", text: STRINGS.status.applied };
    case "idle":
    case "streaming":
    case "applying":
      return null;
  }
}
