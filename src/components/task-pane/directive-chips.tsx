import { GraduationCap, Repeat2, Scissors, SpellCheck, type LucideIcon } from "lucide-react";
import { STRINGS } from "@/constants/strings";
import {
  DIRECTIVE_IDS,
  DIRECTIVES,
  type DirectiveId,
} from "@/features/directives/directives";

const DIRECTIVE_ICONS = {
  bakukan: SpellCheck,
  parafrase: Repeat2,
  "kalimat-efektif": Scissors,
  "nada-akademik": GraduationCap,
} as const satisfies Record<DirectiveId, LucideIcon>;

type DirectiveChipsProps = {
  disabled: boolean;
  activeDirective: DirectiveId | null;
  onSelect: (directive: DirectiveId) => void;
};

export function DirectiveChips({ disabled, activeDirective, onSelect }: DirectiveChipsProps) {
  return (
    <section aria-labelledby="directives-title" className="flex flex-col gap-2">
      <h2 id="directives-title" className="text-xs font-medium text-muted-foreground">
        {STRINGS.directives.title}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {DIRECTIVE_IDS.map((id) => {
          const Icon = DIRECTIVE_ICONS[id];
          const { label, description } = DIRECTIVES[id];
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              aria-pressed={activeDirective === id}
              onClick={() => {
                onSelect(id);
              }}
              className="flex flex-col items-start gap-1 rounded-lg border bg-card p-2.5 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-primary/5"
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Icon aria-hidden className="size-4 shrink-0" />
                {label}
              </span>
              <span className="text-xs leading-snug text-muted-foreground">{description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
