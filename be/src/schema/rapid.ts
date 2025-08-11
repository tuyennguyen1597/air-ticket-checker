import { z } from "zod";

export const baseRapidResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  timestamp: z.number(),
});
