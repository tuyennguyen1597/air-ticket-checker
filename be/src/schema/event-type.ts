export const EVENT_TYPES = {
  MESSAGE: "MESSAGE",
  TOOL: "TOOL",
  DONE: "DONE",
} as const;
export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
