"use client";

import { useState } from "react";
import { toAppError, type AppErrorCode } from "@/lib/errors";
import type { DocumentAdapter, SelectionSnapshot } from "./types";

export type UseSelectionResult = {
  snapshot: SelectionSnapshot | null;
  isReading: boolean;
  error: AppErrorCode | null;
  /** Reads the current document selection; resolves to `null` when it fails. */
  read: () => Promise<SelectionSnapshot | null>;
};

export function useSelection(adapter: DocumentAdapter): UseSelectionResult {
  const [snapshot, setSnapshot] = useState<SelectionSnapshot | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<AppErrorCode | null>(null);

  async function read() {
    setIsReading(true);
    setError(null);
    try {
      const next = await adapter.readSelection();
      setSnapshot(next);
      return next;
    } catch (caught) {
      setSnapshot(null);
      setError(toAppError(caught).code);
      return null;
    } finally {
      setIsReading(false);
    }
  }

  return { snapshot, isReading, error, read };
}
