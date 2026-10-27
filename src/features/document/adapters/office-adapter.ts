import { assertSelectionNotEmpty, assertSelectionUnchanged } from "./selection-guard";
import type { DocumentAdapter } from "@/features/document/model/types";
import type { RevisionInput, SelectionSnapshot } from "@/shared/types/selection";

type BaseFont = Pick<Word.Interfaces.FontUpdateData, "name" | "size" | "color">;

/**
 * Font properties to carry over to the revision so it matches the surrounding text.
 * Word reports mixed formatting as null/empty, so only uniform values are kept.
 */
function toBaseFont({ name, size, color }: Word.Font): BaseFont {
  return {
    ...(name ? { name } : {}),
    ...(size ? { size } : {}),
    ...(color ? { color } : {}),
  };
}

async function readSelection(): Promise<SelectionSnapshot> {
  return Word.run(async (context) => {
    const selection = context.document.getSelection();
    const paragraphs = selection.paragraphs;
    const previous = paragraphs.getFirst().getPreviousOrNullObject();
    const next = paragraphs.getLast().getNextOrNullObject();

    selection.load("text");
    previous.load("text");
    next.load("text");
    await context.sync();

    assertSelectionNotEmpty(selection.text);
    return {
      text: selection.text,
      context: {
        before: previous.isNullObject ? "" : previous.text,
        after: next.isNullObject ? "" : next.text,
      },
    };
  });
}

/**
 * Replaces the selection in place, without tracked changes. If the user has
 * Track Changes on, it is switched off for the edit and restored afterwards.
 */
async function applyRevision({ original, revised }: RevisionInput): Promise<void> {
  await Word.run(async (context) => {
    const { document } = context;
    const selection = document.getSelection();
    // The first word's font is the "original" style; the whole selection may be mixed.
    const firstWord = selection.getTextRanges([" "], true).getFirstOrNullObject();

    selection.load("text");
    firstWord.load("font/name,font/size,font/color");
    document.load("changeTrackingMode");
    await context.sync();

    assertSelectionUnchanged(selection.text, original);
    const baseFont = firstWord.isNullObject ? {} : toBaseFont(firstWord.font);
    const previousMode = document.changeTrackingMode;
    const isTracking = previousMode !== Word.ChangeTrackingMode.off;

    try {
      if (isTracking) document.changeTrackingMode = Word.ChangeTrackingMode.off;
      const inserted = selection.insertText(revised, Word.InsertLocation.replace);
      inserted.font.set(baseFont);
      await context.sync();
    } finally {
      if (isTracking) {
        document.changeTrackingMode = previousMode;
        await context.sync();
      }
    }
  });
}

export const officeDocumentAdapter: DocumentAdapter = {
  readSelection,
  applyRevision,
};
