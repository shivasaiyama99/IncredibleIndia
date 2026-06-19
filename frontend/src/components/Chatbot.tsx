import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const backendBaseUrl = useMemo(() => {
    // Adjust if your backend runs elsewhere
    return import.meta.env.VITE_BACKEND_URL || '';
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    // Smoothly scroll to bottom after DOM paints
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [messages, loading, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim().slice(0, 400);
    if (!trimmed || loading) return;

    const newUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    // Prepare compact history: keep last 6 prior messages (without any system items; backend enforces system prompt)
    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content.slice(0, 400) }));

    // Add a 10s timeout via AbortController for responsiveness
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${backendBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...history,
            { role: 'user', content: trimmed },
          ],
          model: 'llama-3.3-70b-versatile',
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.reply || err?.message || `Request failed with ${res.status}`);
      }
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || 'I am your Trip Assistant. Please ask a concise travel question (dates, destination, budget).',
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      const isAbort = e?.name === 'AbortError';
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: isAbort
          ? 'Taking longer than expected. Please ask one specific travel question (e.g., 5 days in Jaipur, ₹25k budget).'
          : `Error: ${e?.message || 'Something went wrong.'}`,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        aria-label="Open Trip Planner Assistant"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[1000] h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[1000] w-80 md:w-96 bg-white border border-orange-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold flex items-center justify-between">
        <span>Trip Planner Assistant</span>
        <button aria-label="Close" onClick={() => setIsOpen(false)} className="text-white/90 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 max-h-[65vh] h-[420px] overflow-y-auto overscroll-contain p-4 space-y-3 bg-white">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500">Ask me to plan an itinerary, find hotels, or explore culture.</div>
        )}
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={
              'inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm ' +
              (m.role === 'user' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-50 border border-orange-100')
            }>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <div className="inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-gray-50 border border-orange-100">Thinking…</div>
          </div>
        )}
      </div>

      <div className="p-2 border-t bg-white flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Plan a 5-day Delhi & Agra trip…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;


