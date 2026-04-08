import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2 } from "lucide-react";
import { aiService } from "../../services/ai.service";
import LoadingSpinner from "../ui/LoadingSpinner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm your AI financial advisor. Ask me anything about your finances — I'll be straight with you. No sugar-coating. 💰" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await aiService.chat(msg, history);
      const reply = res.data.message || res.data.response || "I couldn't process that. Try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    }
    setLoading(false);
  };

  const clear = () => {
    setMessages([{ role: "assistant", content: "Fresh start! What do you want to know about your finances?" }]);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl shadow-primary-200 dark:shadow-primary-950 flex items-center justify-center transition-all hover:scale-105"
          title="AI Chat"
        >
          <MessageCircle size={24}/>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <Bot size={20}/>
              <div>
                <p className="text-sm font-semibold">AI Financial Advisor</p>
                <p className="text-[10px] text-white/70">Honest insights · No fluff</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clear} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Clear chat"><Trash2 size={14}/></button>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X size={16}/></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={14} className="text-primary-600 dark:text-primary-400"/>
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary-600 text-white rounded-br-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md"
                }`}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={14} className="text-gray-500 dark:text-gray-400"/>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0"><Bot size={14} className="text-primary-600 dark:text-primary-400"/></div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}}/>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}}/>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}}/>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask about your finances..."
                className="flex-1 px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
