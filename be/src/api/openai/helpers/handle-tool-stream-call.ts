import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getFlightInfo } from "../../get-flight-info";
import { getFlightToolContent } from "./get-flight-tool-content";

export const handleToolStreamCall = async (toolCall: {
  id: string;
  name?: string;
  arguments: string;
}): Promise<ChatCompletionMessageParam> => {
  try {
    const cleanedArguments = toolCall.arguments.trim();
    const toolArgs = JSON.parse(cleanedArguments);
    const flightInfo = await getFlightInfo(toolArgs);
    const content = getFlightToolContent(flightInfo);

    return {
      role: "tool",
      content,
      tool_call_id: toolCall.id,
    };
  } catch (error) {
    console.error("Error parsing tool arguments:", error);
    console.error("Problematic arguments string:", toolCall.arguments);

    return {
      role: "tool",
      content: "Error processing flight search request",
      tool_call_id: toolCall.id,
    };
  }
};
