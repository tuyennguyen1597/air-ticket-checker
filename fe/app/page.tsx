"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AIMessage, UserMessage } from "@/components/chat/Message";
import { EventTypes } from "@/types/event-types";

type ChatItem = { id: string; role: "assistant" | "user"; content: string };

const DotLoader = () => (
  <span className="inline-flex gap-1">
    <span className="animate-bounce">.</span>
    <span className="animate-bounce [animation-delay:0.15s]">.</span>
    <span className="animate-bounce [animation-delay:0.3s]">.</span>
  </span>
);

const ToolLoader = () => (
  <div className="text-gray-500 italic">
    Searching for flight details
    <span className="inline-flex gap-0 ml-1">
      <span className="animate-bounce">.</span>
      <span className="animate-bounce [animation-delay:0.15s]">.</span>
      <span className="animate-bounce [animation-delay:0.3s]">.</span>
    </span>
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: `${Date.now()}-ai`,
      role: "assistant",
      content: "Hi There! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isToolActive, setIsToolActive] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, isToolActive]);

  // Function to render message content based on loading states
  const renderMessageContent = (message: ChatItem) => {
    if (message.role === "user") {
      return message.content;
    }

    // For AI messages, check if this is the latest message and if we're in a loading state
    const isLatestMessage = message.id === messages[messages.length - 1]?.id;

    if (isLatestMessage) {
      if (isToolActive) {
        return <ToolLoader />;
      }
      if (isLoading && message.content === "...") {
        return <DotLoader />;
      }
    }

    return message.content;
  };

  async function sendMessageStream() {
    const text = input.trim();
    if (!text) return;

    const userItem: ChatItem = {
      id: `${Date.now()}-u`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userItem]);
    setInput("");
    setIsLoading(true);
    setIsToolActive(false);

    // Create initial AI message with loading dots
    const aiMessageId = `${Date.now()}-ai`;
    const initialAIMessage: ChatItem = {
      id: aiMessageId,
      role: "assistant",
      content: "...",
    };
    setMessages((prev) => [...prev, initialAIMessage]);

    try {
      // Start the streaming request
      const response = await fetch("http://localhost:8100/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newMessage: { role: "user", content: text },
          history: messages
            .map((m) => ({
              role: m.role,
              content: m.content,
            }))
            .slice(1, -1),
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;
      let isFirstMessageAfterTool = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === EventTypes.DONE) {
              setIsLoading(false);
              setIsToolActive(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === EventTypes.MESSAGE) {
                // Replace "..." with actual content on first chunk, then append subsequent chunks
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          content:
                            isFirstChunk || isFirstMessageAfterTool
                              ? parsed.content
                              : msg.content + parsed.content,
                        }
                      : msg
                  )
                );
                if (isFirstChunk) {
                  isFirstChunk = false;
                  setIsLoading(false); // Stop showing basic loading dots
                }
                if (isFirstMessageAfterTool) {
                  isFirstMessageAfterTool = false;
                  setIsToolActive(false); // Clear tool state immediately when content starts
                }
                // Clear tool active state when receiving message content
                if (isToolActive) setIsToolActive(false);
              } else if (parsed.type === EventTypes.TOOL) {
                // Switch from basic loading to tool loading
                setIsLoading(false);
                setIsToolActive(true);
                // Mark that the next message content should replace, not append
                isFirstMessageAfterTool = true;
                // Clear the message content so it's ready for new streaming
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          content: "",
                        }
                      : msg
                  )
                );
                // Keep the message but the rendering will show tool loader
                if (isFirstChunk) isFirstChunk = false;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content:
                  "Sorry, I'm having trouble connecting. Please try again.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setIsToolActive(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageStream();
    }
  }

  return (
    <div className="flex h-[90vh] flex-col">
      <h1 className="mx-auto mt-10 text-2xl font-bold">
        AI Air Ticket Chatbot
      </h1>
      <Card className="mx-auto mt-10 w-full max-w-2xl rounded-lg p-4 align-middle text-center h-[70vh] overflow-y-auto">
        {messages.map((m) =>
          m.role === "assistant" ? (
            <AIMessage key={m.id} text={renderMessageContent(m)} />
          ) : (
            <UserMessage key={m.id} text={m.content} />
          )
        )}
        <div ref={endRef} />
      </Card>
      <Textarea
        className="mx-auto mt-2 w-full max-w-2xl rounded-lg p-4 h-[8vh] focus-visible:ring-0"
        rows={2}
        placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isLoading || isToolActive}
      />
    </div>
  );
}
