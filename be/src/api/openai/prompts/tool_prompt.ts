import { ChatCompletionTool } from "openai/resources/chat/completions";

export const flightToolPrompt = (): ChatCompletionTool => {
  const today = new Date().toISOString().split("T")[0];
  return {
    type: "function",
    function: {
      name: "getFlightInfo",
      description: `
      Retrieve information about a specific flight.

      **When to use:**
      1. Use when the user asks for the price or details of a flight.
      2. Do NOT use for past flights — rely on chat history instead.

      **Rules:**
      - Convert all dates to YYYY-MM-DD format.
      - Use default values when not provided by the user.
      - Required minimum parameters: 'from', 'to', and 'startDate'.
      - Today's date: ${today}`,
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description:
              "The departure airport. If not specified, use 'Sydney'",
          },
          to: {
            type: "string",
            description: "The arrival airport.",
          },
          startDate: {
            type: "string",
            description:
              "The departure date in YYYY-MM-DD format. If not specified, use today's date.",
          },
          endDate: {
            type: "string",
            description:
              "The return date in YYYY-MM-DD format. Optional field, leave undefined if not provided.",
          },
          travelClass: {
            type: "string",
            description: "The travel class. If not specified, use 'ECONOMY'.",
            enum: ["ECONOMY", "BUSINESS", "FIRST"],
          },
          adults: {
            type: "number",
            description: "The number of adults. If not specified, use 1.",
          },
          children: {
            type: "number",
            description: "The number of children. If not specified, use 0.",
          },
          infants: {
            type: "number",
            description: "The number of infants. If not specified, use 0.",
          },
          currency: {
            type: "string",
            description: "The currency code. If not specified, use 'AUD'.",
            enum: ["USD", "EUR", "GBP", "AUD", "CAD", "CHF", "CNY", "JPY"],
          },
          countryCode: {
            type: "string",
            description: "The country code. If not specified, use 'AU'.",
            enum: ["US", "UK", "AU", "CA", "CH", "CN", "JP"],
          },
        },
        required: ["to", "startDate", "from"],
        additionalProperties: false,
      },
    },
  };
};
