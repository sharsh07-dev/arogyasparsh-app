import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Mic, MicOff, Loader2, Database, FileJson, AlertCircle, Clock } from 'lucide-react';

const SwasthyaPHCBot = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `SwasthyaAI-PHC Online. Assigned to: ${contextData.userPHC || 'Unknown'}.`, type: 'text' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(scrollToBottom, [messages, isOpen]);

  // 🎙️ WEB SPEECH API FOR VOICE
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice not supported. Please use Chrome.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript, true); // Auto-send as voice
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSend = async (text = input, isVoice = false) => {
    if (!text.trim()) return;
    
    // Add User Message
    setMessages(prev => [...prev, { sender: 'user', text: text, isVoice }]);
    setInput('');
    setIsLoading(true);

    try {
        const res = await fetch("https://arogyasparsh-ml.onrender.com/phc-assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                query: text, 
                is_voice: isVoice,
                context: { phc_id: contextData.userPHC }
            })
        });
        const data = await res.json();
        
        setMessages(prev => [...prev, { 
            sender: 'bot', 
            text: data.text, 
            type: data.type, 
            table: data.data,
            stt: data.stt,
            timestamp: data.retrieved_at 
        }]);

    } catch (err) {
        setMessages(prev => [...prev, { sender: 'bot', text: "Error connecting to PHC Database.", type: 'error' }]);
    }
    setIsLoading(false);
  };

  // RENDER LOGIC
  const renderContent = (msg) => {
      return (
          <div className="space-y-2">
              {/* STT Transcript Badge */}
              {msg.stt?.transcript && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                      <Mic size={10}/> Transcript ({msg.stt.confidence * 100}% confidence)
                  </div>
              )}

              {/* Main Text */}
              <p dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}}></p>

              {/* Data Table */}
              {msg.type === 'table' && msg.table && (
                  <div className="bg-slate-50 rounded border border-slate-200 overflow-hidden mt-2">
                      <div className="bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 flex justify-between">
                          <span>{msg.table.title}</span>
                          <span className="flex items-center gap-1"><Database size={10}/> Live DB</span>
                      </div>
                      <table className="w-full text-left text-[10px]">
                          <thead className="bg-white border-b"><tr>{msg.table.headers.map((h,i)=><th key={i} className="p-2">{h}</th>)}</tr></thead>
                          <tbody className="divide-y">{msg.table.rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j} className="p-2 text-slate-700">{c}</td>)}</tr>)}</tbody>
                      </table>
                  </div>
              )}

              {/* Timestamp Footer */}
              {msg.timestamp && (
                  <p className="text-[9px] text-slate-300 mt-1 flex justify-end gap-1">
                      <Clock size={10}/> Data synced: {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
              )}
          </div>
      );
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end font-sans">
      
      {isOpen && (
        <div className="bg-white w-96 h-[600px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5">
            <div className="bg-emerald-700 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-1.5 rounded-lg"><Bot size={20} className="text-emerald-300" /></div>
                    <div><h3 className="font-bold text-sm">SwasthyaAI-PHC</h3><p className="text-[10px] text-emerald-200">Database Connected</p></div>
                </div>
                <button onClick={() => setIsOpen(false)}><X size={18}/></button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                            {renderContent(msg)}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-500 flex items-center gap-2 text-xs"><Loader2 size={14} className="animate-spin text-emerald-600"/> Querying Database...</div></div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
                <input className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-sm outline-none" placeholder="Ask about stock, orders..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}/>
                <button onClick={startListening} className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600'}`}>{isListening ? <MicOff size={18}/> : <Mic size={18}/>}</button>
                <button onClick={() => handleSend()} className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl"><Send size={18}/></button>
            </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className={`p-4 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 ${isOpen ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'}`}>{isOpen ? <X size={24} /> : <Bot size={24} />}</button>
    </div>
  );
};

export default SwasthyaPHCBot;