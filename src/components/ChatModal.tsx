import type React from "react";
import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User } from "lucide-react";
import FormattedMessage from "./FormattedMessage";

interface ChatModalProps {
  workflow: any;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function ChatModal({ workflow, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("https://workflow-server-u99y.onrender.com/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: inputValue,
          workflow_id: workflow.workflow_id,
          session_id: sessionId,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (!sessionId) {
          setSessionId(result.session_id);
        }

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.response,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I encountered an error while processing your request. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[700px] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Chat with Workflow
            </h2>
            <p className="text-sm text-gray-600 mt-1">{workflow.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Bot size={40} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500">
                Ask any question and I'll process it through your configured
                workflow components.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-4 ${
                message.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  message.sender === "user"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                }`}
              >
                {message.sender === "user" ? (
                  <User size={18} />
                ) : (
                  <Bot size={18} />
                )}
              </div>

              <div
                className={`max-w-[75%] rounded-2xl shadow-sm ${
                  message.sender === "user"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="p-4">
                  {message.sender === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  ) : (
                    <FormattedMessage content={message.content} />
                  )}
                </div>
                <div
                  className={`px-4 pb-3 text-xs ${
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-gray-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center shadow-md">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <span className="text-gray-500 text-sm ml-2">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none min-h-[50px] max-h-[120px]"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
