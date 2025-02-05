'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'agent';
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Brutal auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' });
    if (!isProcessing) inputRef.current?.focus();
  }, [messages, isProcessing]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    // Add user message
    setMessages(prev => [...prev, 
      { id: crypto.randomUUID(), content: input, role: 'user' }
    ]);
    setInput('');
    setIsProcessing(true);

    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, 
        { 
          id: crypto.randomUUID(), 
          content: `SELECT * FROM data WHERE ${input}`,
          role: 'agent' 
        }
      ]);
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="h-screen bg-zinc-900 flex flex-col">
      {/* No-nonsense header */}
      <div className="p-3 border-b border-zinc-700">
        <h1 className="font-mono text-lg text-cyan-400">SQL_GEN//v0.4.2</h1>
      </div>

      {/* Terminal-style messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] p-3 rounded-lg break-words
              ${msg.role === 'user' 
                ? 'bg-cyan-900/50 text-cyan-300' 
                : 'bg-zinc-800 border border-zinc-700 text-gray-200'}
            `}>
              {msg.role === 'agent' && (
                <div className="flex items-center gap-2 mb-2 opacity-70">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs">QUERY_EXECUTION</span>
                </div>
              )}
              {msg.role === 'agent' ? (
                <code className="text-sm text-green-400">{msg.content}</code>
              ) : msg.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Hackable input */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 border-t border-zinc-700"
      >
        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-2">
          <span className="text-zinc-500">{isProcessing ? '>' : 'λ'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isProcessing ? "PARSING..." : "RAW_INPUT//"}
            disabled={isProcessing}
            className="flex-1 bg-transparent text-gray-200 outline-none placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className={`px-3 py-1.5 text-sm rounded-md ${
              isProcessing 
                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-cyan-800/50 text-cyan-400 hover:bg-cyan-800/70'
            }`}
          >
            {isProcessing ? '[...]' : 'EXECUTE'}
          </button>
        </div>
      </form>
    </div>
  );
}


