import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type StatusMessage = {
  tone: "info" | "success" | "error";
  text: string;
};

const TONE_ICONS = {
  info: Info,
  success: CircleCheck,
  error: CircleAlert,
} as const;

export function StatusBanner({ message }: { message: StatusMessage }) {
  const Icon = TONE_ICONS[message.tone];
  return (
    <Alert variant={message.tone === "error" ? "destructive" : "default"}>
      <Icon aria-hidden />
      <AlertDescription>{message.text}</AlertDescription>
    </Alert>
  );
}
