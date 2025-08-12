import { Response } from "express";
import { EVENT_TYPES, EventType } from "../schema/event-type";

export const setSSEHeaders = (response: Response) => {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.flushHeaders();
};

export const sendSSEMessageWithType = (
  response: Response,
  type: EventType,
  message?: string
) => {
  response.write(
    `data: ${JSON.stringify({
      type,
      ...(message && { content: message }),
    })}\n\n`
  );
};

export const endSSE = (response: Response) => {
  sendSSEMessageWithType(response, EVENT_TYPES.DONE);
  response.end();
};
