import { OpenAI } from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
} from "openai/resources/index";
import dotenv from "dotenv";
import { flightToolPrompt } from "./tool_prompt";
import { getFlightInfo } from "../get-flight-info";
import { RapidGetFlightResponse } from "../../schema/flights";

dotenv.config();
const OPENAI_MODEL = process.env.OPEN_AI_MODEL;
const OPENAI_API_KEY = process.env.OPEN_AI_API_KEY;

export const chat = async ({
  newMessage,
  history,
}: {
  newMessage: ChatCompletionMessageParam;
  history: ChatCompletionMessageParam[];
}) => {
  if (!OPENAI_API_KEY || !OPENAI_MODEL) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "assistant",
      content: systemPrompt(),
    },
    ...history,
    newMessage,
  ];
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  console.log("messages", flightToolPrompt());

  let response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages,
    tools: [flightToolPrompt()],
  });

  console.log("response", response);

  if (response.choices[0].finish_reason === "tool_calls") {
    const toolMessage = response.choices[0].message;
    const toolResponse = await handleToolCall(toolMessage);
    if (toolResponse) {
      messages.push(toolMessage);
      messages.push(toolResponse);
      response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages,
        tools: [flightToolPrompt()],
      });
    }
  }
  return response.choices[0].message.content;
};

const handleToolCall = async (
  message: ChatCompletionMessage
): Promise<ChatCompletionMessageParam | undefined> => {
  const toolCall = message
    .tool_calls?.[0] as ChatCompletionMessageFunctionToolCall;
  if (!toolCall) {
    return undefined;
  }
  const toolName = toolCall.function.name;

  const toolArgs = JSON.parse(toolCall.function.arguments);

  const flightInfo: RapidGetFlightResponse | undefined = await getFlightInfo(
    toolArgs
  );

  const content = !flightInfo?.data?.itineraries?.topFlights?.[0]
    ? "No flight information found"
    : `Analyse the information from ${JSON.stringify(
        flightInfo.data?.itineraries?.topFlights
      )} and provide a short summary of the flight details for the user about what they asked.
    Can ask them if they want to know more about the flight details.
    If they want to know more, you can use the getFlightInfo tool again.`;
  console.log("content", content);
  return {
    role: "tool",
    content,
    tool_call_id: toolCall.id,
  } as ChatCompletionMessageParam;
};

const systemPrompt = () => {
  return `
  You are a helpful assistant for an AI travel assistant.
  Give short, courteous answers, no more than 2 sentences. 
  If you are asked to provide a flight price, you can use the getFlightInfo tool to get the price.
  Always check if user need any other information.
  Always be accurate. If you don't know the answer, say so.
  `;
};
