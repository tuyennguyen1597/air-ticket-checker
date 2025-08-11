import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getCountryCodes } from "./api/get-location";
import { getAirportInfo } from "./api/search-airport";
import { getFlightInfo } from "./api/get-flight-info";
import { chat } from "./api/openai/chat";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/get-locations", async (req, res) => {
  const locations = await getCountryCodes(["VietNam", "Australia"]);
  res.status(200).json(locations);
});

app.get("/get-airport-info", async (req, res) => {
  const airportInfo = await getAirportInfo("Sydney");
  res.status(200).json(airportInfo);
});

app.get("/get-flight-info", async (req, res) => {
  const flightInfo = await getFlightInfo({
    from: "Sydney",
    to: "Melbourne",
    startDate: "2025-09-20",
  });
  res.status(200).json(flightInfo);
});

app.post("/chat", async (req, res) => {
  const response = await chat(req.body);
  res.status(200).json(response);
});
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
