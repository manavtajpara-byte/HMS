'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your HMS AI Assistant. Need help with fees, room changes, or attendance?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message.trim();
        setMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.slice(1) // Don't send initial greeting
                })
            });

            const data = await response.json();
            if (data.error) {
                setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${data.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] print:hidden">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[420px] h-[650px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-500">
                    {/* Header */}
                    <div className="bg-black p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm tracking-widest uppercase">HMS Assistant</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">System Active</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all relative z-10"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-gradient-to-b from-gray-50/20 to-transparent">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`p-5 rounded-2xl text-sm leading-relaxed prose prose-sm max-w-none ${msg.role === 'user'
                                        ? 'bg-black text-white font-medium rounded-tr-none shadow-xl prose-invert'
                                        : 'bg-white text-gray-800 font-medium rounded-tl-none border border-gray-100 shadow-sm'
                                        }`}>
                                        {msg.role === 'assistant' ? (
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p className="m-0 leading-relaxed capitalize-first">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-black text-black">{children}</strong>,
                                                    ul: ({ children }) => <ul className="m-0 mt-2 space-y-1 list-none p-0">{children}</ul>,
                                                    li: ({ children }) => (
                                                        <li className="flex items-start gap-2 before:content-['•'] before:text-gray-400">
                                                            <span>{children}</span>
                                                        </li>
                                                    )
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Bot size={14} className="text-gray-300" />
                                    </div>
                                    <div className="flex gap-2 bg-white p-5 rounded-2xl rounded-tl-none border border-gray-100 items-center shadow-sm">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-8 border-t border-gray-100 bg-white">
                        <div className="relative group">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="How can I help you today?"
                                className="w-full h-16 pl-6 pr-14 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:hover:scale-100 shadow-lg"
                            >
                                <Send size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                        <p className="mt-4 text-[9px] text-gray-300 text-center font-bold uppercase tracking-widest">End-to-End Encrypted Session</p>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-700 hover:scale-110 active:scale-90 group relative ${isOpen ? 'bg-white text-black rotate-90 border border-gray-100' : 'bg-black text-white'}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-black border-4 border-white rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                    </div>
                )}
            </button>
        </div>
    );
}
