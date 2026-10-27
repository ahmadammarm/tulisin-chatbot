import { FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STRINGS } from "@/shared/constants/strings";
import type { SelectionSnapshot } from "@/shared/types/selection";

type SelectionCardProps = {
  snapshot: SelectionSnapshot | null;
  isReading: boolean;
  disabled: boolean;
  onRead: () => void;
};

export function SelectionCard({ snapshot, isReading, disabled, onRead }: SelectionCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <FileText aria-hidden className="size-4" />
          {STRINGS.selection.title}
        </CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isReading}
            onClick={onRead}
          >
            <RefreshCw aria-hidden className={isReading ? "animate-spin" : undefined} />
            {isReading ? STRINGS.selection.reading : STRINGS.selection.read}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {snapshot ? (
          <div className="flex flex-col gap-1.5">
            <p className="line-clamp-6 text-sm leading-relaxed whitespace-pre-wrap">
              {snapshot.text}
            </p>
            <p className="text-xs text-muted-foreground">
              {STRINGS.selection.characters(snapshot.text.length)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{STRINGS.selection.empty}</p>
        )}
      </CardContent>
    </Card>
  );
}
