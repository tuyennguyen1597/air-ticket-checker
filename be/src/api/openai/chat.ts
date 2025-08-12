import { OpenAI } from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
} from "openai/resources/index";
import dotenv from "dotenv";
import { flightToolPrompt } from "./prompts/tool_prompt";
import { getFlightInfo } from "../get-flight-info";
import { RapidGetFlightResponse } from "../../schema/flights";
import { assistantPrompt } from "./prompts/assistant-prompt";
import { getFlightToolContent } from "./helpers/get-flight-tool-content";

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
      content: assistantPrompt(),
    },
    ...history,
    newMessage,
  ];
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  let response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages,
    tools: [flightToolPrompt()],
  });

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

  const toolArgs = JSON.parse(toolCall.function.arguments);

  const flightInfo: RapidGetFlightResponse | undefined = await getFlightInfo(
    toolArgs
  );

  const content = getFlightToolContent(flightInfo);
  console.log("content", content);
  return {
    role: "tool",
    content,
    tool_call_id: toolCall.id,
  } as ChatCompletionMessageParam;
};
