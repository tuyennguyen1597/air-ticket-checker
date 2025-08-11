import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const RAPID_URL = process.env.RAPID_URL;

const getLocations = async () => {
  const { data } = await axios.get<any>(`${RAPID_URL}/getLocations`, {
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": process.env.RAPID_API_HOST,
    },
  });
  const locations = (data as any)?.data ?? data;

  fs.writeFileSync("locations.json", JSON.stringify(locations, null, 2));
  console.log("locations.json written");
  return locations;
};

export const getCountryCodes = async (locationNames: string[]) => {
  const countries = JSON.parse(fs.readFileSync("locations.json", "utf8"));
  const countryCodes = countries.filter((country: any) =>
    locationNames.some((name: string) =>
      country.country_name.toLowerCase().includes(name.toLowerCase())
    )
  );
  return countryCodes;
};
