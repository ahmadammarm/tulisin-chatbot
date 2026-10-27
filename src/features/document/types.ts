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

/** Everything the task pane needs from a document, independent of Office.js. */
export type DocumentAdapter = {
  readSelection: () => Promise<SelectionSnapshot>;
  applyRevision: (input: RevisionInput) => Promise<void>;
};
