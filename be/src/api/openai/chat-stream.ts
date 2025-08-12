import dotenv from "dotenv";
import { Response as ExpressResponse } from "express";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { assistantPrompt } from "./prompts/assistant-prompt";
import { endSSE, setSSEHeaders } from "../../utils/sse";
import { handleMessageStreamCall } from "./helpers/handle-message-stream-call";
import { handleToolStreamCall } from "./helpers/handle-tool-stream-call";

dotenv.config();

const OPENAI_MODEL = process.env.OPEN_AI_MODEL;
const OPENAI_API_KEY = process.env.OPEN_AI_API_KEY;

type ChatStreamParam = {
  response: ExpressResponse;
  newMessage: ChatCompletionMessageParam;
  history: ChatCompletionMessageParam[];
};

export const chatStream = async ({
  response,
  newMessage,
  history,
}: ChatStreamParam) => {
  if (!OPENAI_API_KEY || !OPENAI_MODEL) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  setSSEHeaders(response);

  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "assistant",
      content: assistantPrompt(),
    },
    ...history,
    newMessage,
  ];

  let finalMessage: ChatCompletionMessageParam = {
    role: "assistant",
    content: "",
  };
  let finishReason = "";
  let accumulatedToolCall = { id: "", name: "", arguments: "" };

  await handleMessageStreamCall({
    openai,
    messages,
    response,
    finalMessage,
    accumulatedToolCall,
    onFinish: (reason) => {
      finishReason = reason;
    },
  });

  // Handle tool calls with complete arguments
  if (finishReason === "tool_calls" && accumulatedToolCall.id) {
    // Add tool_calls to the final message
    finalMessage.tool_calls = [
      {
        id: accumulatedToolCall.id,
        type: "function",
        function: {
          name: accumulatedToolCall.name,
          arguments: accumulatedToolCall.arguments,
        },
      },
    ];

    const toolResult = await handleToolStreamCall({
      id: accumulatedToolCall.id,
      name: accumulatedToolCall.name,
      arguments: accumulatedToolCall.arguments,
    });

    messages.push(finalMessage, toolResult);

    await handleMessageStreamCall({
      openai,
      messages,
      response,
      finalMessage,
      accumulatedToolCall,
    });
  }

  // End of stream
  endSSE(response);
};
