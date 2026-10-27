"use client";

import { LoaderCircle, PenLine } from "lucide-react";
import { RevisionPanel } from "@/features/assist/components/revision-panel";
import { useAssist } from "@/features/assist/hooks/use-assist";
import { DirectiveChips } from "@/features/directives/components/directive-chips";
import type { DirectiveId } from "@/features/directives/model/directives";
import { SelectionCard } from "@/features/document/components/selection-card";
import { useDocumentAdapter } from "@/features/document/hooks/use-document-adapter";
import { useSelection } from "@/features/document/hooks/use-selection";
import type { DocumentAdapter } from "@/features/document/model/types";
import { StatusBanner } from "@/shared/components/status-banner";
import { deriveStatus } from "@/features/task-pane/model/derive-status";
import { STRINGS } from "@/shared/constants/strings";

function Workspace({ adapter, isMock }: { adapter: DocumentAdapter; isMock: boolean }) {
  const selection = useSelection(adapter);
  const assist = useAssist(adapter);
  const { state } = assist;

  const isBusy = state.status === "streaming" || state.status === "applying";
  const activeDirective = "revision" in state ? state.revision.directive : null;
  const status = deriveStatus(selection.error, state);

  async function handleDirective(directive: DirectiveId) {
    // Always re-read so the revision targets what is selected right now.
    const snapshot = await selection.read();
    if (snapshot) await assist.run(directive, snapshot);
  }

  return (
    <div className="flex flex-col gap-3">
      {isMock && <StatusBanner message={{ tone: "info", text: STRINGS.status.mockMode }} />}
      <SelectionCard
        snapshot={selection.snapshot}
        isReading={selection.isReading}
        disabled={isBusy}
        onRead={() => {
          assist.reset();
          void selection.read();
        }}
      />
      <DirectiveChips
        disabled={isBusy || selection.isReading}
        activeDirective={activeDirective}
        onSelect={(directive) => {
          void handleDirective(directive);
        }}
      />
      {status && <StatusBanner message={status} />}
      {"revision" in state && (
        <RevisionPanel
          revision={state.revision}
          phase={state.status}
          hasChanges={state.status !== "ready" || state.hasChanges}
          onApply={() => {
            void assist.apply();
          }}
          onDiscard={assist.reset}
          onCancel={assist.cancel}
        />
      )}
    </div>
  );
}

export function TaskPane() {
  const documentState = useDocumentAdapter();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-4 p-4">
      <header className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <PenLine aria-hidden className="size-4" />
        </span>
        <div>
          <h1 className="text-base leading-tight font-semibold">{STRINGS.appName}</h1>
          <p className="text-xs text-muted-foreground">{STRINGS.tagline}</p>
        </div>
      </header>

      {documentState.status === "loading" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
          {STRINGS.status.loading}
        </p>
      )}
      {documentState.status === "unsupported" && (
        <StatusBanner message={{ tone: "info", text: STRINGS.status.unsupported }} />
      )}
      {documentState.status === "ready" && (
        <Workspace adapter={documentState.adapter} isMock={documentState.isMock} />
      )}
    </main>
  );
}
