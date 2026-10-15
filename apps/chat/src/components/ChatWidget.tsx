import React, { useState, useRef, useEffect } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface ChatWidgetProps {
  apiUrl?: string;
  token?: string;
  botName?: string;
  welcomeMessage?: string;
  position?: "bottom-right" | "bottom-left";
  theme?: "dark" | "light";
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  sources?: Array<{ id: number; content?: string }>;
}

let messageCounter = 0
const getNextId = (prefix: string) => `${prefix}-${++messageCounter}-${Date.now()}`
const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiUrl = 'http://localhost:9090',
  token = '',
  botName = 'NexBot AI',
  welcomeMessage = 'Hello! I am your AI assistant. Ask me anything about our business, services, terms, or documentation.',
  position = 'bottom-right',
  theme = 'dark',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: welcomeMessage,
      timestamp: getTimestamp(),
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: getNextId('user'),
      sender: 'user',
      text,
      timestamp: getTimestamp(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInput('')
    setIsLoading(true)

    try {
      const cleanUrl = apiUrl.replace(/\/+$/, '')
      const endpoint = `${cleanUrl}/api/v1/chat/`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['X-API-KEY'] = token
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`)
      }

      const data = await response.json()
      const answer = data.answer || data.message || 'No response returned from the server.'

      const botMessage: Message = {
        id: getNextId('bot'),
        sender: 'assistant',
        text: answer,
        timestamp: getTimestamp(),
        sources: data.sources || [],
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setMessages((prev) => [
        ...prev,
        {
          id: getNextId('error'),
          sender: 'assistant',
          text: `⚠️ Unable to connect to assistant: ${errorMessage}. Please verify backend server at ${apiUrl}.`,
          timestamp: getTimestamp(),
        },
      ])
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "What services do you offer?",
    "What are your terms & warranties?",
    "How do I contact Borhan?",
  ];

  const isRight = position === "bottom-right";
  const isDark = theme === "dark";

  return (
    <div
      className={`fixed z-[999999] flex flex-col font-sans select-none ${
        isRight ? "right-6 bottom-6 items-end" : "left-6 bottom-6 items-start"
      }`}
    >
      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          className={`mb-4 w-[380px] max-w-[calc(100vw-32px)] h-[540px] max-h-[calc(100vh-100px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            isDark
              ? "bg-zinc-950 border-zinc-800 text-zinc-100 shadow-emerald-950/20"
              : "bg-white border-zinc-200 text-zinc-900 shadow-zinc-400/20"
          }`}
        >
          {/* Header */}
          <div
            className={`px-5 py-3.5 flex items-center justify-between border-b ${
              isDark
                ? "bg-zinc-900/80 border-zinc-800/80"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  ⚡
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  {botName}
                </h3>
                <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online • RAG Knowledge
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: "welcome",
                      sender: "assistant",
                      text: welcomeMessage,
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    },
                  ])
                }
                title="Reset conversation"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isDark
                    ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200"
                }`}
              >
                🔄
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isDark
                    ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200"
                }`}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 nex-chat-scrollbar text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-br-xs whitespace-pre-wrap"
                      : isDark
                        ? "bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-bl-xs"
                        : "bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-bl-xs"
                  }`}
                >
                  {msg.sender === "user" ? (
                    msg.text
                  ) : (
                    <MarkdownRenderer content={msg.text} theme={theme} />
                  )}
                </div>

                {/* Sources if present */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-zinc-500">
                    <span className="opacity-70">Sources:</span>
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded border ${
                          isDark
                            ? "bg-zinc-900 border-zinc-800 text-emerald-400"
                            : "bg-zinc-100 border-zinc-200 text-emerald-600"
                        }`}
                      >
                        [Doc Chunk #{src.id}]
                      </span>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-zinc-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl max-w-[80px] bg-zinc-900 border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-zinc-800/50">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    isDark
                      ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-emerald-500/50 hover:text-emerald-600"
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div
            className={`p-3 border-t flex items-center gap-2 ${
              isDark
                ? "bg-zinc-900/60 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={isLoading}
              className={`flex-1 px-3.5 py-2 text-sm rounded-xl border focus:outline-none transition-all ${
                isDark
                  ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-emerald-500/70"
                  : "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500/70"
              }`}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                <path d="m21.854 2.147-10.94 10.939" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all duration-200 cursor-pointer"
        aria-label="Toggle chat widget"
      >
        {isOpen ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
            <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
          </svg>
        )}
      </button>
    </div>
  );
};
