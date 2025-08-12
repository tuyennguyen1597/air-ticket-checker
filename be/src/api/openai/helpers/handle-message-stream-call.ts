import dotenv from "dotenv";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { Response as ExpressResponse } from "express";
import { flightToolPrompt } from "../prompts/tool_prompt";
import { EVENT_TYPES } from "../../../schema/event-type";
import { sendSSEMessageWithType } from "../../../utils/sse";

dotenv.config();

const OPENAI_MODEL = process.env.OPEN_AI_MODEL;

export const handleMessageStreamCall = async ({
  openai,
  messages,
  response,
  finalMessage,
  accumulatedToolCall,
  onFinish,
}: {
  openai: OpenAI;
  messages: ChatCompletionMessageParam[];
  response: ExpressResponse;
  finalMessage?: ChatCompletionMessageParam;
  accumulatedToolCall?: { id: string; name: string; arguments: string };
  onFinish?: (reason: string) => void;
}) => {
  if (!OPENAI_MODEL) {
    throw new Error("OPENAI_MODEL is not set");
  }

  const stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk> =
    await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      tools: [flightToolPrompt()],
      stream: true,
    });

  for await (const chunk of stream) {
    const choice = chunk.choices[0];

    if (choice.delta?.content) {
      finalMessage && (finalMessage.content += choice.delta.content);
      sendSSEMessageWithType(
        response,
        EVENT_TYPES.MESSAGE,
        choice.delta.content
      );
    }

    if (choice.delta?.tool_calls?.[0] && accumulatedToolCall) {
      const toolCall = choice.delta.tool_calls[0];

      // Update accumulated tool call properties
      if (toolCall.id) {
        accumulatedToolCall.id = toolCall.id;
      }
      if (toolCall.function?.name) {
        accumulatedToolCall.name = toolCall.function.name;
      }
      if (toolCall.function?.arguments) {
        accumulatedToolCall.arguments += toolCall.function.arguments;
      }

      // Send tool indicator only once when we first get the function name
      if (toolCall.function?.name && !response.headersSent) {
        sendSSEMessageWithType(
          response,
          EVENT_TYPES.TOOL,
          toolCall.function.name
        );
      }
    }

    if (choice.finish_reason && onFinish) {
      onFinish(choice.finish_reason);
    }
  }
};
