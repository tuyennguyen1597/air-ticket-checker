import { RapidGetFlightResponse } from "../../../schema/flights";

export const getFlightToolContent = (
  flightInfo: RapidGetFlightResponse | undefined
) => {
  if (!flightInfo) {
    return "No flight information found";
  }

  return `
    Analyse the following flight information:

    ${JSON.stringify(flightInfo)}

    **Instructions:**
    1. Provide a concise summary of the flight details that directly answer the user's request.
    2. If the user may want additional details, politely ask if they would like to know more.
    3. Only if they confirm, use the \`getFlightInfo\` tool again to retrieve further details.
    4. Respond in markdown format (e.g., use \`**bold**\` for important details).

    Your answer must be clear, polite, and no more than 2 sentences unless the user requests more information.
  `;
};
