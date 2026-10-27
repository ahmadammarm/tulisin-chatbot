import { z } from "zod";
import { DIRECTIVE_IDS } from "@/features/directives/model/directives";
import { APP_ERROR_CODES } from "@/lib/errors";

export const MAX_SELECTION_LENGTH = 5000;
export const MAX_CONTEXT_LENGTH = 2000;

export const assistRequestSchema = z.object({
  directive: z.enum(DIRECTIVE_IDS),
  selection: z.string().trim().min(1).max(MAX_SELECTION_LENGTH),
  context: z.object({
    before: z.string().max(MAX_CONTEXT_LENGTH),
    after: z.string().max(MAX_CONTEXT_LENGTH),
  }),
});

export type AssistRequest = z.infer<typeof assistRequestSchema>;

export const apiErrorSchema = z.object({
  error: z.object({ code: z.enum(APP_ERROR_CODES) }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
