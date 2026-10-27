import { DIRECTIVES, type DirectiveId } from "@/features/directives/model/directives";
import type { AssistRequest } from "./schema";

const SHARED_RULES = [
  "You are Tulisin, an editor for academic manuscripts (theses, dissertations, and journal articles) written in Indonesian or English.",
  "Always answer in the same language as the TEXT. Never translate unless explicitly asked.",
  "Output ONLY the revised TEXT. No explanations, no headings, no quotation marks, no markdown, no code fences.",
  "Never alter in-text citations (e.g. (Sugiyono, 2019), [12], et al.), numbers, units, formulas, variable names, or proper nouns.",
  "Preserve paragraph breaks from the TEXT.",
  "The CONTEXT is surrounding text for tone and terminology only. Never include or rewrite it.",
];

export function buildSystemInstruction(directive: DirectiveId): string {
  return [...SHARED_RULES, `Task: ${DIRECTIVES[directive].instruction}`].join(
    "\n",
  );
}

export function buildUserPrompt({ selection, context }: AssistRequest): string {
  const sections = [
    context.before && `CONTEXT BEFORE (do not rewrite):\n${context.before}`,
    `TEXT:\n${selection}`,
    context.after && `CONTEXT AFTER (do not rewrite):\n${context.after}`,
  ];
  return sections.filter(Boolean).join("\n\n");
}
