import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Loader2, BarChart2, Map, TrendingUp } from 'lucide-react';

const SwasthyaAIBot = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Greetings. I am SwasthyaAI. Ready to analyze logistics data.', type: 'text' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    // Build Context (Current User, Inventory Summary)
    const payload = {
        query: userMsg,
        context: {
            userPHC: "Wagholi PHC", // In real app, pass this from props
            inventoryCount: contextData?.inventory?.length || 0
        }
    };

    try {
        const res = await fetch("https://arogyasparsh-ml.onrender.com/swasthya-ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        setMessages(prev => [...prev, { 
            sender: 'bot', 
            text: data.text, 
            type: data.type,
            data: data.data 
        }]);
    } catch (err) {
        setMessages(prev => [...prev, { sender: 'bot', text: "Connection to Neural Core failed. Please check network.", type: 'error' }]);
    }
    setIsLoading(false);
  };

  // RENDER DIFFERENT RESPONSE TYPES
  const renderBotContent = (msg) => {
      if (msg.type === 'table' && msg.data) {
          return (
              <div className="space-y-2">
                  <p className="mb-2 text-slate-700" dangerouslySetInnerHTML={{__html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}}></p>
                  <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden text-xs">
                      <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-600">
                              <tr>{msg.data.headers.map((h,i) => <th key={i} className="p-2">{h}</th>)}</tr>
                          </thead>
                          <tbody className="divide-y">
                              {msg.data.rows.map((row, r) => (
                                  <tr key={r}>
                                      {row.map((cell, c) => <td key={c} className="p-2">{cell}</td>)}
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          );
      }
      if (msg.type === 'tracking' && msg.data) {
          return (
              <div>
                  <p className="mb-3 text-slate-700" dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}}></p>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                          <Map size={16}/> LIVE TRACKING
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">Active</span>
                  </div>
              </div>
          );
      }
      if (msg.type === 'forecast' && msg.data) {
         return (
            <div>
                <p className="mb-3 text-slate-700" dangerouslySetInnerHTML={{__html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}}></p>
                <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-purple-700 flex items-center gap-1"><TrendingUp size={14}/> PREDICTION</span>
                        <span className="text-[10px] text-purple-500">{msg.data.confidence} Confidence</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">{msg.data.prediction} Units</div>
                    <div className="text-xs text-slate-500">Range: {msg.data.range} • Trend: {msg.data.trend}</div>
                </div>
            </div>
         );
      }
      // Default Text
      return <p dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}}></p>;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end font-sans">
      
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[550px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Bot size={20} className="text-white" /></div>
                    <div>
                        <h3 className="font-bold text-sm">SwasthyaAI</h3>
                        <p className="text-[10px] text-teal-100 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Operational</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={18}/></button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4 scrollbar-thin">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                            {renderBotContent(msg)}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-500 flex items-center gap-2 text-xs shadow-sm">
                            <Loader2 size={14} className="animate-spin text-teal-600"/> Processing Logic...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input 
                    className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 placeholder:text-slate-400"
                    placeholder="Ask to compare, track, or forecast..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                    <Send size={18} />
                </button>
            </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 hover:shadow-teal-500/30 ${isOpen ? 'bg-slate-800 text-white' : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'}`}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        {!isOpen && <span className="font-bold text-sm pr-1">Ask SwasthyaAI</span>}
      </button>
    </div>
  );
};

export default SwasthyaAIBot;