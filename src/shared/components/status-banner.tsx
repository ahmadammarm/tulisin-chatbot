import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { StatusMessage, StatusTone } from "@/shared/types/status";

const TONE_ICONS = {
  info: Info,
  success: CircleCheck,
  error: CircleAlert,
} as const satisfies Record<StatusTone, typeof Info>;

export function StatusBanner({ message }: { message: StatusMessage }) {
  const Icon = TONE_ICONS[message.tone];
  return (
    <Alert variant={message.tone === "error" ? "destructive" : "default"}>
      <Icon aria-hidden />
      <AlertDescription>{message.text}</AlertDescription>
    </Alert>
  );
}
