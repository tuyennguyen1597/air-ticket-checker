import { z } from "zod";
import { duration } from "zod/v4/classic/iso.cjs";
import { baseRapidResponseSchema } from "./rapid";

export const travelClassSchema = z.enum([
  "ECONOMY",
  "PREMIUM_ECONOMY",
  "BUSINESS",
  "FIRST",
]);

export const ticketSchema = z.object({
  from: z.string(),
  to: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  travelClass: travelClassSchema.optional().default("ECONOMY"),
  adults: z.number().optional().default(1),
  children: z.number().optional().default(0),
  infants: z.number().optional().default(0),
  currency: z.string().optional().default("AUD"),
  countryCode: z.string().optional().default("AU"),
});
export type Ticket = z.infer<typeof ticketSchema>;

export const rapidGetFlightRequestSchema = z.object({
  departure_id: z.string(),
  arrival_id: z.string(),
  outbound_date: z.string(),
  return_date: z.string().optional(),
  travel_class: travelClassSchema.optional(),
  adults: z.number().optional().default(1),
  children: z.number().optional().default(0),
  infant_in_seat: z.number().optional().default(0),
  currency: z.string().optional().default("AUD"),
  country_code: z.string().optional().default("AU"),
});
export type RapidGetFlightRequest = z.infer<typeof rapidGetFlightRequestSchema>;

const durationSchema = z
  .object({
    raw: z.number(),
    text: z.string(),
  })
  .passthrough();

const airportPointSchema = z
  .object({
    airport_name: z.string(),
    airport_code: z.string(),
    time: z.string(),
  })
  .passthrough();

const flightSegmentSchema = z
  .object({
    departure_airport: airportPointSchema,
    arrival_airport: airportPointSchema,
    duration: durationSchema,
    airline: z.string(),
    airline_logo: z.string().optional(),
    flight_number: z.string(),
    aircraft: z.string().optional(),
    seat: z.string().optional(),
    legroom: z.string().optional(),
    extensions: z.array(z.string()).optional(),
  })
  .passthrough();

const bagsSchema = z
  .object({
    carry_on: z.number().nullable(),
    checked: z.number().nullable(),
  })
  .passthrough();

const carbonEmissionsSchema = z
  .object({
    difference_percent: z.number(),
    CO2e: z.number(),
    typical_for_this_route: z.number(),
    higher: z.number(),
  })
  .passthrough();

const delaySchema = z
  .object({
    values: z.boolean(),
    text: z.number(),
  })
  .passthrough();

const flightItemSchema = z
  .object({
    departure_time: z.string(),
    arrival_time: z.string(),
    duration: durationSchema,
    flights: z.array(flightSegmentSchema),
    delay: delaySchema.optional(),
    self_transfer: z.boolean().optional(),
    layovers: z.any().nullable().optional(),
    bags: bagsSchema.optional(),
    carbon_emissions: carbonEmissionsSchema.optional(),
    price: z.number(),
    stops: z.number(),
    airline_logo: z.string().optional(),
    booking_token: z.string(),
  })
  .passthrough();

const itinerariesSchema = z
  .object({
    topFlights: z.array(flightItemSchema),
    otherFlights: z.array(flightItemSchema),
  })
  .passthrough();

const priceRuleSchema = z
  .object({
    operation: z.string(),
    value: z.number().nullable(),
  })
  .passthrough();

const priceHistorySchema = z
  .object({
    summary: z
      .object({
        current: z.number(),
        low: z.array(priceRuleSchema),
        typical: z.array(priceRuleSchema),
        high: z.array(priceRuleSchema),
      })
      .passthrough(),
    history: z.array(
      z
        .object({
          time: z.number(),
          value: z.number(),
        })
        .passthrough()
    ),
  })
  .passthrough();

export const rapidGetFlightResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    timestamp: z.number(),
    data: z
      .object({
        itineraries: itinerariesSchema,
        priceHistory: priceHistorySchema,
      })
      .passthrough(),
  })
  .passthrough();

export type RapidGetFlightResponse = z.infer<
  typeof rapidGetFlightResponseSchema
>;
