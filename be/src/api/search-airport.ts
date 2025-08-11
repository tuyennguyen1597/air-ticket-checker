import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import { Airport, rapidAirportSchema } from "../schema/airport";

dotenv.config();

const RAPID_URL = process.env.RAPID_URL;

const getAirportInfoFromRapid = async (airportName: string) => {
  const params = {
    query: airportName,
  };
  try {
    const { data } = await axios.get<any>(`${RAPID_URL}/searchAirport`, {
      params,
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": process.env.RAPID_API_HOST,
      },
    });

    const apiData = data as any;
    const airportInfo = apiData.data.map((airport: any) => {
      const parsedAirport = rapidAirportSchema.safeParse(airport);
      if (!parsedAirport.success) {
        console.log("Invalid airport info", parsedAirport.error);
        return undefined;
      }
      return parsedAirport.data;
    });

    //   append to airport.json
    const airports = JSON.parse(fs.readFileSync("airport.json", "utf8"));
    const newAirports = [...airports, ...airportInfo];
    fs.writeFileSync("airport.json", JSON.stringify(newAirports, null, 2));
    return airportInfo;
  } catch (error) {
    console.log("Error searching airport", error);
    return undefined;
  }
};

const checkExistedAirport = async (
  airportName: string
): Promise<Airport[] | undefined> => {
  const airports = JSON.parse(fs.readFileSync("airport.json", "utf8"));
  const existedAirport = airports.filter(
    (airport: any) =>
      airport.city.toLowerCase() === airportName.toLowerCase() ||
      airport.title.toLowerCase().includes(airportName.toLowerCase())
  );

  if (existedAirport.length === 0) {
    console.log("No existed airport", airportName);
    return undefined;
  }
  return existedAirport;
};

export const getAirportInfo = async (
  airportName: string
): Promise<Airport | undefined> => {
  const existedAirport = await checkExistedAirport(airportName);
  if (existedAirport && existedAirport.length > 0) {
    return existedAirport[0];
  }
  const airportInfo = await getAirportInfoFromRapid(airportName);
  return airportInfo[0];
};
