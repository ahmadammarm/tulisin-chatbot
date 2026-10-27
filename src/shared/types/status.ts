export type StatusTone = "info" | "success" | "error";

export type StatusMessage = {
  tone: StatusTone;
  text: string;
};
