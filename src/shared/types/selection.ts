/** Paragraphs around the selection, sent to the model for tone and terminology. */
export type SelectionContext = {
  before: string;
  after: string;
};

export type SelectionSnapshot = {
  text: string;
  context: SelectionContext;
};

export type RevisionInput = {
  original: string;
  revised: string;
};
