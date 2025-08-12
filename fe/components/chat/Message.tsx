import { CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";

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
  const isLoading = text === "...";

  // Render content based on role
  const renderContent = () => {
    if (isAI && typeof text === "string") {
      return (
        <div className="w-full max-w-[75%] text-left leading-relaxed prose prose-sm max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      );
    }
    return (
      <div className="w-full max-w-[75%] text-left leading-relaxed">{text}</div>
    );
  };

  return (
    <CardContent
      className={cn(
        "flex flex-row items-start",
        isAI ? "justify-end " : "justify-start",
        className
      )}
    >
      {isAI ? (
        <>
          <div className="bg-gray-100 p-2 rounded-md max-w-[75%]">
            {renderContent()}
          </div>
          {!isLoading && (
            <Avatar className="ml-4 h-10 w-10">
              <AvatarImage src={src} alt={isAI ? "AI" : "User"} />
              <AvatarFallback>{isAI ? "AI" : "U"}</AvatarFallback>
            </Avatar>
          )}
        </>
      ) : (
        <>
          <Avatar className="mr-4 h-10 w-10">
            <AvatarImage src={src} alt={isAI ? "AI" : "User"} />
            <AvatarFallback>{isAI ? "AI" : "U"}</AvatarFallback>
          </Avatar>
          <div className="bg-gray-100 p-2 rounded-md max-w-[75%]">
            {renderContent()}
          </div>
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
