export type DirectiveDefinition = {
  label: string;
  description: string;
  /** Task-specific rule appended to the shared system instruction. */
  instruction: string;
};

/** Registry of one-click actions. Adding an action means adding one entry. */
export const DIRECTIVES = {
  bakukan: {
    label: "Bakukan",
    description: "Sesuaikan dengan EYD V dan KBBI",
    instruction:
      "Standardize the text. For Indonesian, replace non-standard words with their KBBI standard forms and fix spelling, capitalization, and punctuation according to EYD V (Ejaan yang Disempurnakan edisi V). For English, fix spelling, grammar, and punctuation. Change as little as possible beyond these corrections.",
  },
  parafrase: {
    label: "Parafrase Ilmiah",
    description: "Tulis ulang dengan struktur berbeda",
    instruction:
      "Paraphrase the text for academic writing. Restructure sentences and vary word choice so the wording differs substantially from the original, while preserving the exact meaning, all technical terms, and all claims.",
  },
  "kalimat-efektif": {
    label: "Kalimat Efektif",
    description: "Ringkas dan hilangkan pemborosan kata",
    instruction:
      "Make every sentence effective and concise. Remove redundant words, tautologies, and wordy constructions, and fix illogical or ambiguous sentence structure, without removing any information.",
  },
  "nada-akademik": {
    label: "Nada Akademik",
    description: "Ubah gaya santai menjadi formal dan objektif",
    instruction:
      "Rewrite the text in a formal, objective scholarly tone. Convert casual phrasing and first-person narrative into impersonal academic voice (for Indonesian, prefer constructions such as passive voice instead of 'saya' or 'kami'). Keep the meaning unchanged.",
  },
} as const satisfies Record<string, DirectiveDefinition>;

export type DirectiveId = keyof typeof DIRECTIVES;

export const DIRECTIVE_IDS = Object.keys(DIRECTIVES) as [
  DirectiveId,
  ...DirectiveId[],
];
