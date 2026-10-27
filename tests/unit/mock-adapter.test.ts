import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/errors";
import { createMockDocumentAdapter, SAMPLE_SELECTION } from "@/features/document/adapters/mock-adapter";

describe("createMockDocumentAdapter", () => {
  it("applies a revision when the selection is unchanged", async () => {
    const adapter = createMockDocumentAdapter();
    await adapter.applyRevision({ original: SAMPLE_SELECTION.text, revised: "Revisi." });
    expect(adapter.getText()).toBe("Revisi.");
  });

  it("tolerates line-ending differences in the original text", async () => {
    const adapter = createMockDocumentAdapter({ ...SAMPLE_SELECTION, text: "Satu.\r\nDua." });
    await adapter.applyRevision({ original: "Satu.\nDua.", revised: "Revisi." });
    expect(adapter.getText()).toBe("Revisi.");
  });

  it("rejects with SELECTION_CHANGED when the selection no longer matches", async () => {
    const adapter = createMockDocumentAdapter();
    await expect(
      adapter.applyRevision({ original: "Teks lain.", revised: "Revisi." }),
    ).rejects.toThrow(new AppError("SELECTION_CHANGED"));
  });

  it("rejects with EMPTY_SELECTION when nothing is selected", async () => {
    const adapter = createMockDocumentAdapter({ ...SAMPLE_SELECTION, text: "" });
    await expect(adapter.readSelection()).rejects.toMatchObject({ code: "EMPTY_SELECTION" });
  });
});
