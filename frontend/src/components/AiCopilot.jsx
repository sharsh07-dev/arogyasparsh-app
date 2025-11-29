import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Loader2 } from 'lucide-react';

const AiCopilot = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Health Logistics Copilot. Ask me about stock, drone status, or demand predictions.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
        // Call Python AI Microservice
        const res = await fetch("https://arogyasparsh-ml.onrender.com/ai-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                query: userMsg, 
                context: contextData // Pass current dashboard data (stock, orders) to AI
            })
        });
        
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (err) {
        setMessages(prev => [...prev, { sender: 'bot', text: "⚠️ AI Connection Error. Please try again." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <div className="bg-green-500 p-1.5 rounded-lg"><Bot size={20} className="text-white" /></div>
                    <div>
                        <h3 className="font-bold text-sm">Arogya AI Copilot</h3>
                        <p className="text-[10px] text-green-300 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-400 flex items-center gap-2 text-xs">
                            <Loader2 size={14} className="animate-spin"/> Analyzing Data...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input 
                    className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 placeholder:text-slate-400"
                    placeholder="Ask about stock, ETA, or predictions..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-50">
                    <Send size={18} />
                </button>
            </div>
        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-110 ${isOpen ? 'bg-slate-800 text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'}`}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        {!isOpen && <span className="font-bold text-sm pr-1">Ask AI</span>}
      </button>
    </div>
  );
};

export default AiCopilot;