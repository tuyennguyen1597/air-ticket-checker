import { ChatCompletionTool } from "openai/resources/chat/completions";

export const flightToolPrompt = (): ChatCompletionTool => {
  return {
    type: "function",
    function: {
      name: "getFlightInfo",
      description: `Get information about a flight. 
        You need to provide arrival airports.
        You can use this tool when the user asks about the price of a flight or when they want the flight details.
        Please convert the date to the format YYYY-MM-DD.
        Fill the parameters with the default values if the user does not provide them.`,
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "The departure airport",
            default: "Sydney",
          },
          to: {
            type: "string",
            description: "The arrival airport",
            default: "Ho Chi Minh City",
          },
          startDate: {
            type: "string",
            description: "The departure date",
            default: new Date().toISOString().split("T")[0],
          },
          endDate: {
            type: "string",
            description: "The return date",
            default: undefined,
          },
          travelClass: {
            type: "string",
            description: "The travel class",
            enum: ["ECONOMY", "BUSINESS", "FIRST"],
            default: "ECONOMY",
          },
          adults: {
            type: "number",
            description: "The number of adults",
            default: 1,
          },
          children: {
            type: "number",
            description: "The number of children",
            default: 0,
          },
          infants: {
            type: "number",
            description: "The number of infants",
            default: 0,
          },
          currency: {
            type: "string",
            description: "The currency",
            enum: ["USD", "EUR", "GBP", "AUD", "CAD", "CHF", "CNY", "JPY"],
            default: "AUD",
          },
          countryCode: {
            type: "string",
            description: "The country code",
            enum: ["US", "UK", "AU", "CA", "CH", "CN", "JP"],
            default: "AU",
          },
        },
        required: ["to", "startDate", "from"],
        additionalProperties: false,
      },
    },
  };
};
