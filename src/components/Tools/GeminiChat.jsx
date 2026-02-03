import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useLocation } from 'react-router-dom';
import { HiSparkles, HiOutlineX, HiOutlinePaperAirplane, HiOutlineDotsHorizontal, HiOutlineDuplicate, HiOutlineCheck } from 'react-icons/hi';
import { chatWithGemini } from '../../services/gemini';
import { renderMarkdown } from '../../utils/helpers';

const GeminiChat = () => {
    const { isChatOpen: isOpen, setIsChatOpen: setIsOpen } = useAppContext();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am Google Gemini. How can I help you with your studies today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);
    const location = useLocation();

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    if (location.pathname === '/') return null;

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const history = [...messages, userMsg];
            const response = await chatWithGemini(history);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Trigger Button */}
            <div className="fixed bottom-6 right-6 z-[10000] flex flex-col items-end gap-3 pointer-events-none">
                {/* Space for Timer Overlay is handled by natural flow or absolute positioning of timer */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-tr from-cyan-500 to-blue-600 hover:scale-110 active:scale-95'}`}
                >
                    {isOpen ? <HiOutlineX size={24} className="text-white" /> : <HiSparkles size={28} className="text-white" />}
                </button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[10000] w-[min(90vw,400px)] h-[min(85vh,600px)] animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-300 origin-bottom-right">
                    <div className="sb-card !p-0 h-full flex flex-col border-white/10 overflow-hidden backdrop-blur-2xl bg-slate-900/95 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]">
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                    <HiSparkles className="text-white text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">Gemini AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                <HiOutlineX size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`group relative max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                                        }`}>
                                        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />

                                        {/* Copy Button */}
                                        <button
                                            onClick={() => handleCopy(msg.content, i)}
                                            className={`absolute ${msg.role === 'user' ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 hover:text-white`}
                                            title="Copy message"
                                        >
                                            {copiedIndex === i ? <HiOutlineCheck size={14} className="text-emerald-400" /> : <HiOutlineDuplicate size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl rounded-tl-none flex gap-1">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Gemini anything..."
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white pr-12 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                                >
                                    <HiOutlinePaperAirplane className="rotate-90" size={16} />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-500 mt-2">
                                AI may provide inaccurate info.
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default GeminiChat;
