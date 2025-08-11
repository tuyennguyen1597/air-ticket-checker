"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AIMessage, UserMessage } from "@/components/chat/Message";
import axios from "axios";

type ChatItem = { id: string; role: "assistant" | "user"; content: string };

const DotLoader = () => (
  <span className="inline-flex gap-1">
    <span className="animate-bounce">.</span>
    <span className="animate-bounce [animation-delay:0.15s]">.</span>
    <span className="animate-bounce [animation-delay:0.3s]">.</span>
  </span>
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
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function sendMessage() {
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

    try {
      const response = await axios.post("http://localhost:8100/chat", {
        newMessage: { role: "user", content: text },
        history: messages
          .map((m) => ({
            role: m.role,
            content: m.content,
          }))
          .slice(1, -1),
      });

      const aiItem: ChatItem = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: response.data,
      };
      setMessages((prev) => [...prev, aiItem]);
    } catch (error) {
      const errorItem: ChatItem = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
      };
      setMessages((prev) => [...prev, errorItem]);
    } finally {
      setIsLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
            <AIMessage key={m.id} text={m.content} />
          ) : (
            <UserMessage key={m.id} text={m.content} />
          )
        )}
        {isLoading && <AIMessage key="typing" text={<DotLoader />} />}
        <div ref={endRef} />
      </Card>
      <Textarea
        className="mx-auto mt-2 w-full max-w-2xl rounded-lg p-4 h-[8vh] focus-visible:ring-0"
        rows={2}
        placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isLoading}
      />
    </div>
  );
}
