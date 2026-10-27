import { assertSelectionNotEmpty, assertSelectionUnchanged } from "./selection-guard";
import type { DocumentAdapter } from "@/features/document/model/types";
import type { SelectionSnapshot } from "@/shared/types/selection";

export const SAMPLE_SELECTION: SelectionSnapshot = {
  text: "Pada penelitian ini kami mencoba untuk menganalisa pengaruh dari penggunaan media sosial terhadap prestasi belajar mahasiswa, dimana data nya diambil dari kuesioner yang di sebar ke 120 responden (Sugiyono, 2019).",
  context: {
    before:
      "Perkembangan teknologi informasi telah mengubah cara mahasiswa belajar dan berinteraksi.",
    after:
      "Hasil penelitian diharapkan dapat menjadi acuan bagi perguruan tinggi dalam merumuskan kebijakan.",
  },
};

/** In-memory document for developing the task pane in a normal browser. */
export function createMockDocumentAdapter(
  initial: SelectionSnapshot = SAMPLE_SELECTION,
): DocumentAdapter & { getText: () => string } {
  let snapshot = initial;

  return {
    // Errors thrown inside a Promise executor become rejections, matching the async Office adapter.
    readSelection: () =>
      new Promise((resolve) => {
        assertSelectionNotEmpty(snapshot.text);
        resolve(snapshot);
      }),
    applyRevision: ({ original, revised }) =>
      new Promise((resolve) => {
        assertSelectionUnchanged(snapshot.text, original);
        snapshot = { ...snapshot, text: revised };
        resolve();
      }),
    getText: () => snapshot.text,
  };
}
