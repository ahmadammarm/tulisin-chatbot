"use client";

import { useEffect, useState } from "react";
import { createMockDocumentAdapter } from "@/features/document/adapters/mock-adapter";
import { officeDocumentAdapter } from "@/features/document/adapters/office-adapter";
import type { DocumentAdapter } from "@/features/document/model/types";

export type DocumentAdapterState =
  | { status: "loading" }
  | { status: "ready"; adapter: DocumentAdapter; isMock: boolean }
  | { status: "unsupported" };

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

function fallbackState(): DocumentAdapterState {
  return IS_DEVELOPMENT
    ? { status: "ready", adapter: createMockDocumentAdapter(), isMock: true }
    : { status: "unsupported" };
}

/** Resolves to the Word adapter inside Word, or a mock adapter in local development. */
export function useDocumentAdapter(): DocumentAdapterState {
  const [state, setState] = useState<DocumentAdapterState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    // office.js may fail to load from the CDN (offline, or blocked outside Office).
    const isWordHost: Promise<boolean> =
      typeof Office === "undefined"
        ? Promise.resolve(false)
        : Office.onReady().then((info) => info.host === Office.HostType.Word);

    void isWordHost.then((isWord) => {
      if (!active) return;
      setState(
        isWord
          ? { status: "ready", adapter: officeDocumentAdapter, isMock: false }
          : fallbackState(),
      );
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
