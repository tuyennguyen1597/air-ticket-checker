import axios from "axios";
import dotenv from "dotenv";
import {
  RapidGetFlightRequest,
  rapidGetFlightRequestSchema,
  RapidGetFlightResponse,
  rapidGetFlightResponseSchema,
  Ticket,
  ticketSchema,
} from "../schema/flights";
import { getAirportInfo } from "./search-airport";

dotenv.config();

const RAPID_URL = process.env.RAPID_URL;

const getFlightInfoFromRapid = async (
  params: RapidGetFlightRequest
): Promise<RapidGetFlightResponse | undefined> => {
  const rapidParams = rapidGetFlightRequestSchema.safeParse(params);

  if (!rapidParams.success) {
    console.log("Invalid parameters for getFlightInfo", rapidParams.error);
    return undefined;
  }

  const response = await axios.get<RapidGetFlightResponse>(
    `${RAPID_URL}/searchFlights`,
    {
      params: rapidParams.data,
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": process.env.RAPID_API_HOST,
      },
    }
  );

  if (!response.data.status) {
    console.log("Error response for getFlightInfo", response.data);
    return response.data;
  }

  return response.data;
};

export const getFlightInfo = async (
  params: Partial<Ticket> & Pick<Ticket, "from" | "to" | "startDate">
) => {
  const ticket = ticketSchema.parse(params);

  const fromAirportInfo = await getAirportInfo(ticket.from);
  const toAirportInfo = await getAirportInfo(ticket.to);

  if (!fromAirportInfo || !toAirportInfo) {
    throw new Error("Airport not found");
  }

  return getFlightInfoFromRapid({
    departure_id: fromAirportInfo.list[0].id,
    arrival_id: toAirportInfo.list[0].id,
    outbound_date: ticket.startDate
      ? ticket.startDate
      : new Date().toISOString().split("T")[0],
    ...(ticket.endDate && { return_date: ticket.endDate }),
    travel_class: ticket.travelClass,
    adults: ticket.adults,
    children: ticket.children,
    infant_in_seat: ticket.infants,
    currency: ticket.currency,
    country_code: ticket.countryCode,
  });
};
