import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Loader2, Mic, AlertTriangle, FileJson, CheckCircle } from 'lucide-react';

const HospitalSwasthyaBot = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'SwasthyaAI (Hospital Ops) Online. Waiting for voice or text commands.', type: 'text' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
        const res = await fetch("https://arogyasparsh-ml.onrender.com/hospital-ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: userMsg })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.text, type: data.type, data: data.data, rec: data.recommendation }]);
    } catch (err) {
        setMessages(prev => [...prev, { sender: 'bot', text: "Neural Link Offline.", type: 'error' }]);
    }
    setIsLoading(false);
  };

  const renderContent = (msg) => {
      // 🗣️ VOICE ORDER SIMULATION
      if (msg.type === 'voice_process') {
          return (
              <div>
                  <p className="mb-2 text-slate-700" dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}}></p>
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="flex justify-between text-xs font-bold text-green-700 mb-1">
                          <span>ACCEPTANCE PROGRESS</span>
                          <span>{msg.data.progress}%</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-1.5 mb-2">
                          <div className="bg-green-600 h-1.5 rounded-full" style={{width: `${msg.data.progress}%`}}></div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-green-800">
                          <CheckCircle size={12}/> Order ID: {msg.data.order_id} Generated
                      </div>
                  </div>
              </div>
          );
      }
      // 📊 DATA TABLE (Inventory)
      if (msg.type === 'table') {
          return (
              <div>
                  <p className="mb-2 text-slate-700" dangerouslySetInnerHTML={{__html: msg.text}}></p>
                  <div className="bg-slate-50 rounded border overflow-hidden text-[10px]">
                      <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-600"><tr>{msg.data.headers.map((h,i)=><th key={i} className="p-2">{h}</th>)}</tr></thead>
                          <tbody className="divide-y">{msg.data.rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j} className="p-2">{c}</td>)}</tr>)}</tbody>
                      </table>
                  </div>
                  {msg.rec && <div className="mt-2 text-xs bg-red-50 text-red-600 p-2 rounded border border-red-100 font-bold flex items-center gap-2"><AlertTriangle size={12}/> Action: {msg.rec}</div>}
              </div>
          );
      }
      // 📝 JSON DATA (Technical View)
      if (msg.type === 'json') {
          return (
              <div>
                   <p className="mb-2 text-slate-700" dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>')}}></p>
                   <div className="bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-[10px] border border-slate-700 overflow-x-auto">
                       <pre>{JSON.stringify(msg.data, null, 2)}</pre>
                   </div>
              </div>
          );
      }
      return <p dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}}></p>;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end font-sans">
      {isOpen && (
        <div className="bg-white w-96 h-[600px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-1.5 rounded-lg"><Bot size={20} className="text-blue-400" /></div>
                    <div><h3 className="font-bold text-sm">SwasthyaAI <span className="text-[10px] bg-blue-600 px-1 rounded ml-1">OPS</span></h3><p className="text-[10px] text-slate-400">Hospital Command Node</p></div>
                </div>
                <button onClick={() => setIsOpen(false)}><X size={18}/></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>{renderContent(msg)}</div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-500 flex items-center gap-2 text-xs"><Loader2 size={14} className="animate-spin text-blue-600"/> Processing...</div></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-sm outline-none" placeholder="Order stock, check expiry..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}/>
                <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"><Send size={18}/></button>
            </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`p-4 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 ${isOpen ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'}`}>{isOpen ? <X size={24} /> : <Mic size={24} />}</button>
    </div>
  );
};

export default HospitalSwasthyaBot;