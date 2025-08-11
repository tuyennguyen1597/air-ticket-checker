import { z } from "zod";

const rapidAirportListSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    subtitle: z.string(),
    city: z.string(),
    distance: z.string().nullable(),
  })
  .passthrough();

export const rapidAirportSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    subtitle: z.string(),
    city: z.string(),
    distance: z.string().nullable(),
    list: z.array(rapidAirportListSchema),
  })
  .passthrough();
export type Airport = z.infer<typeof rapidAirportSchema>;
