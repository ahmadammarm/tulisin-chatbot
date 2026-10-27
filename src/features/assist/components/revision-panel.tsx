import { Check, CircleCheck, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { STRINGS } from "@/shared/constants/strings";
import type { Revision } from "@/features/assist/model/assist-reducer";
import { DIRECTIVES } from "@/features/directives/model/directives";
import { computeDiff, summarizeDiff, type DiffSummary } from "@/lib/diff";
import { DiffView } from "@/shared/components/diff-view";
import { cn } from "@/lib/ui";

type RevisionPanelProps = {
  revision: Revision;
  phase: "streaming" | "ready" | "applying";
  hasChanges: boolean;
  onApply: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

function SummaryItem({ swatchClassName, label }: { swatchClassName: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span aria-hidden className={cn("size-2.5 rounded-sm", swatchClassName)} />
      {label}
    </span>
  );
}

/** Word counts double as the color legend for the diff. */
function ChangeSummary({ summary }: { summary: DiffSummary }) {
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {summary.addedWords > 0 && (
        <SummaryItem
          swatchClassName="bg-emerald-500/40"
          label={STRINGS.revision.addedWords(summary.addedWords)}
        />
      )}
      {summary.removedWords > 0 && (
        <SummaryItem
          swatchClassName="bg-red-500/30"
          label={STRINGS.revision.removedWords(summary.removedWords)}
        />
      )}
    </p>
  );
}

function StreamingPreview({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
        {STRINGS.revision.streaming}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function NoChangesNotice() {
  return (
    <p className="flex items-center gap-1.5 text-sm" role="status">
      <CircleCheck aria-hidden className="size-4 shrink-0 text-emerald-600" />
      {STRINGS.revision.noChanges}
    </p>
  );
}

function RevisionDiff({ original, revised }: { original: string; revised: string }) {
  const segments = computeDiff(original, revised);

  return (
    <>
      <ChangeSummary summary={summarizeDiff(segments)} />
      <DiffView segments={segments} />
      <p className="text-xs text-muted-foreground">{STRINGS.revision.formattingWarning}</p>
    </>
  );
}

export function RevisionPanel({
  revision,
  phase,
  hasChanges,
  onApply,
  onDiscard,
  onCancel,
}: RevisionPanelProps) {
  const isStreaming = phase === "streaming";
  const isApplying = phase === "applying";

  return (
    <Card size="sm" aria-busy={isStreaming || isApplying}>
      <CardHeader>
        <CardTitle>
          {STRINGS.revision.title} · {DIRECTIVES[revision.directive].label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isStreaming ? (
          <StreamingPreview text={revision.revised} />
        ) : hasChanges ? (
          <RevisionDiff original={revision.source.text} revised={revision.revised} />
        ) : (
          <NoChangesNotice />
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {isStreaming ? (
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X aria-hidden />
            {STRINGS.revision.cancel}
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" disabled={isApplying} onClick={onDiscard}>
              {STRINGS.revision.discard}
            </Button>
            <Button size="sm" disabled={isApplying || !hasChanges} onClick={onApply}>
              {isApplying ? <LoaderCircle aria-hidden className="animate-spin" /> : <Check aria-hidden />}
              {isApplying ? STRINGS.revision.applying : STRINGS.revision.apply}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
