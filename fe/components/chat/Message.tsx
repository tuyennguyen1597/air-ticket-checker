import { CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type ChatMessageProps = {
  role: "assistant" | "user";
  text: ReactNode;
  avatarSrc?: string;
  className?: string;
};

export function ChatMessage({
  role,
  text,
  avatarSrc,
  className,
}: ChatMessageProps) {
  const isAI = role === "assistant";
  const src = avatarSrc ?? (isAI ? "/images/robot.png" : "/images/user.png");

  return (
    <CardContent
      className={cn(
        "flex flex-row items-center",
        isAI ? "justify-end" : "justify-start",
        className
      )}
    >
      {isAI ? (
        <>
          <p className="max-w-[75%] text-left leading-relaxed">{text}</p>
          <Avatar className="ml-4 h-10 w-10">
            <AvatarImage src={src} alt={isAI ? "AI" : "User"} />
            <AvatarFallback>{isAI ? "AI" : "U"}</AvatarFallback>
          </Avatar>
        </>
      ) : (
        <>
          <Avatar className="mr-4 h-10 w-10">
            <AvatarImage src={src} alt={isAI ? "AI" : "User"} />
            <AvatarFallback>{isAI ? "AI" : "U"}</AvatarFallback>
          </Avatar>
          <p className="max-w-[75%] text-left leading-relaxed">{text}</p>
        </>
      )}
    </CardContent>
  );
}

export function AIMessage(props: Omit<ChatMessageProps, "role">) {
  return <ChatMessage role="assistant" {...props} />;
}

export function UserMessage(props: Omit<ChatMessageProps, "role">) {
  return <ChatMessage role="user" {...props} />;
}
