"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Database, FileText, Layers, Loader2, Bot, User } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";


type Message = {
  role: "user" | "assistant";
  content: string;
  tool?: "RAG" | "SQL" | "BOTH";
  citations?: string[];
  sql?: string;
  error?: boolean;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // Calling your NestJS backend on port 4000
    const res = await fetch(`${baseUrl}/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: userMsg }),
});

      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "I processed that, but returned no text.",
          tool: data.tool,
          citations: data.citations,
          sql: data.sql,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "Error connecting to the backend. Make sure NestJS is running on port 4000!",
          error: true
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolBadge = (tool?: string) => {
    if (!tool) return null;
    if (tool === "RAG") return <span className="flex items-center gap-1 text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full"><FileText size={14}/> Policies (RAG)</span>;
    if (tool === "SQL") return <span className="flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full"><Database size={14}/> Database (SQL)</span>;
    if (tool === "BOTH") return <span className="flex items-center gap-1 text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full"><Layers size={14}/> RAG + SQL</span>;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <Bot className="text-blue-600" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Support Agent</h1>
          <p className="text-xs text-gray-500 font-medium">Powered by Groq, Gemini & LangChain</p>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center mt-32 flex flex-col items-center">
              <div className="bg-blue-50 text-blue-500 p-4 rounded-full mb-4">
                <Bot size={40} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">How can I help you today?</h2>
              <p className="text-gray-500 max-w-md">
                Try asking about company policies (e.g., "What is the return window?") or query the database (e.g., "How many pending orders do we have?").
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              
              {/* Avatar for Assistant */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <Bot size={18} className="text-blue-600" />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 shadow-sm ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-sm" 
                  : msg.error 
                    ? "bg-red-50 border border-red-100 text-red-800 rounded-tl-sm"
                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
              }`}>
                
                {/* Tool Badge Header */}
                {msg.role === "assistant" && msg.tool && (
                  <div className="mb-4 flex items-center border-b border-gray-100 pb-3">
                    {renderToolBadge(msg.tool)}
                  </div>
                )}

                {/* Primary Message */}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Metadata Footers (SQL & Citations) */}
                {msg.role === "assistant" && (msg.citations?.length || msg.sql) ? (
                  <div className="mt-5 pt-4 border-t border-gray-100 text-sm space-y-3">
                    
                    {/* SQL Execution Block */}
                    {msg.sql && (
                      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        <div className="bg-gray-900 px-3 py-2 text-xs font-mono text-gray-400 flex items-center border-b border-gray-700">
                          <Database size={12} className="mr-2"/> Generated SQL
                        </div>
                        <code className="block text-green-400 p-3 overflow-x-auto font-mono text-xs">
                          {msg.sql}
                        </code>
                      </div>
                    )}

                    {/* PDF Citations Block */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <span className="font-semibold text-purple-800 flex items-center text-xs mb-2">
                          <FileText size={12} className="mr-1"/> Sources Referenced:
                        </span>
                        <ul className="list-disc list-inside text-purple-700 text-xs space-y-1">
                          {Array.from(new Set(msg.citations)).map((cit, i) => (
                            <li key={i}>{cit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Avatar for User */}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-3 mt-1 flex-shrink-0">
                  <User size={18} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                <Bot size={18} className="text-blue-600" />
              </div>
              <div className="bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-500" size={18} /> Processing request...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about orders or policies..."
              className="flex-1 border border-gray-200 rounded-full pl-6 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-800 transition-shadow"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send size={20} />
            </button>
          </form>
         
        </div>
      </footer>
    </div>
  );
}