import { cn } from "@/lib/ui";
import type { DiffSegment } from "@/lib/diff";

const ADDED_STYLE =
  "rounded-sm bg-emerald-500/15 text-emerald-800 no-underline dark:text-emerald-300";
const REMOVED_STYLE =
  "rounded-sm bg-red-500/10 text-red-700 line-through decoration-red-600/70 dark:text-red-300";

function Segment({ segment }: { segment: DiffSegment }) {
  switch (segment.kind) {
    case "equal":
      return <span>{segment.text}</span>;
    case "added":
      return <ins className={ADDED_STYLE}>{segment.text}</ins>;
    case "removed":
      return <del className={REMOVED_STYLE}>{segment.text}</del>;
  }
}

type DiffViewProps = {
  segments: readonly DiffSegment[];
  className?: string;
};

export function DiffView({ segments, className }: DiffViewProps) {
  return (
    <p className={cn("whitespace-pre-wrap text-sm leading-relaxed", className)}>
      {segments.map((segment, index) => (
        // Segments are positional and always recomputed together, so the index is a stable key.
        <Segment key={index} segment={segment} />
      ))}
    </p>
  );
}
