/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Target, 
  Briefcase, 
  TrendingUp, 
  RefreshCw,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, Project, KPI, KataSession, CtqKanoItem } from '../types';

interface AIAssistantProps {
  goals: Goal[];
  projects: Project[];
  kpis: KPI[];
  kataSessions: KataSession[];
  ctqKanoItems: CtqKanoItem[];
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export default function AIAssistant({
  goals,
  projects,
  kpis,
  kataSessions,
  ctqKanoItems
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hej! Jag är din strategiska AI-assistent. Jag analyserar företagets Balanced Scorecard-mål och Toyota Kata-sessioner i realtid. Hur kan jag hjälpa dig med din verksamhetsstyrning idag?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    triggerAIResponse(inputText);
  };

  const selectSuggestion = (suggestionText: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: suggestionText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    triggerAIResponse(suggestionText);
  };

  const triggerAIResponse = async (query: string) => {
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          state: { goals, projects, kpis, kataSessions, ctqKanoItems }
        })
      });

      if (!response.ok) {
        throw new Error('Server returned unsafe status');
      }

      const data = await response.json();
      if (!data.text) {
        throw new Error('Received empty response text');
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn('Real Gemini API failed, falling back to heuristics:', err);
      
      const avgKpiProgress = kpis.length > 0 
        ? Math.round(kpis.reduce((acc, k) => acc + k.progress, 0) / kpis.length)
        : 0;

      let reply = '';
      const text = query.toLowerCase();

      if (text.includes('mål') || text.includes('strategi') || text.includes('vision')) {
        const goalNames = goals.map(g => `"${g.title}" (${g.progress}% klart)`).join(', ');
        const avgGoals = goals.length > 0 
          ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) 
          : 0;
        reply = `Jag har analyserat era **${goals.length} aktiva målvisioner** i databasen. Medeluppfyllnaden ligger för närvarande på **${avgGoals}%**.\n\nEra nuvarande registrerade mål är: ${goalNames || 'inga registrerade än'}.\n\n*Rekommendation*: Målet "Bli den mest hållbara aktören" är särskilt viktigt, men har en utmanande CO₂-mätning. Du bör para ihop detta mål med en Kata-session för att experimentera med lösningar på transporthinder!`;
      } 
      else if (text.includes('kano') || text.includes('ctq') || text.includes('krav') || text.includes('voc')) {
        const total = ctqKanoItems.length;
        const mustBe = ctqKanoItems.filter(i => i.kanoCategory === 'Must-be').length;
        const attractive = ctqKanoItems.filter(i => i.kanoCategory === 'Attractive').length;
        const oneDim = ctqKanoItems.filter(i => i.kanoCategory === 'One-dimensional').length;
        reply = `Jag har analyserat era **${total} kravspecifikationer** i Kano & CTQ-modulen:\n\n• **Ska-krav (Must-be):** ${mustBe} st\n• **Prestandakrav (One-dimensional):** ${oneDim} st\n• **Wow-faktorer (Attractive):** ${attractive} st\n\n*Strategisk rekommendation:* Prioritera alltid att åtgärda och leverera era **Must-be** (Ska-krav) först. Att lansera attraktiva wow-funktioner utan att grundkraven fungerar leder till missnöjda kunder. Koppla dina CTQ-specifikationer till strategiska mål för att säkerställa att utvecklingen är helt kundstyrd!`;
      }
      else if (text.includes('projekt') || text.includes('aktivitet') || text.includes('schema')) {
        const progressList = projects.map(p => `"${p.title}" (${p.progress}% slutfört)`);
        const lagging = projects.filter(p => p.progress < 45);
        reply = `Just nu övervakar jag **${projects.length} operativa projekt**.\n\n${progressList.map(p => `• ${p}`).join('\n')}\n\n`;
        if (lagging.length > 0) {
          reply += `⚠️ **Risk-notis:** Projektet ${lagging.map(p => `"${p.title}"`).join(', ')} utvecklas långsamt och riskerar flaskhalsar. Det är starkt rekommenderat att omfördela 10% av kapaciteten eller lägga till konkreta underuppgifter (Tasks) för att få fart på framdriften!`;
        } else {
          reply += `✓ **Status:** Samtliga projekt framskrider enligt schema och uppvisar stabil framgång. Bra jobbat!`;
        }
      } 
      else if (text.includes('kpi') || text.includes('mätetal') || text.includes('index')) {
        const avgKpi = kpis.length > 0 
          ? Math.round(kpis.reduce((acc, k) => acc + k.progress, 0) / kpis.length)
          : 0;
        const lowestKpi = kpis.reduce((min, k) => k.progress < min.progress ? k : min, kpis[0] || { title: 'Inga', progress: 100 });
        reply = `Era KPI:er uppvisar en genomsnittlig uppfyllelsegrad på **${avgKpi}%**.\n\n`;
        if (lowestKpi && lowestKpi.title !== 'Inga') {
          reply += `Mätaren som kräver omedelbara åtgärder är **"${lowestKpi.title}"** som just nu bara uppnår **${lowestKpi.progress}%** måluppfyllnad.\n\n*Strategisk åtgärd:* Eftersom mätetalen är uppdelade över de 4 BSC-perspektiven, tenderar svaga ekonomiska siffror ofta att bero på att lärande eller marknadsaktiviteter släpar efter. Investera mer i interna kompetensutbildningar!`;
        } else {
          reply += `Inga tydliga avvikelser eller riskfaktorer har hittats i mätgalleriet för närvarande.`;
        }
      } 
      else if (text.includes('kata') || text.includes('coaching') || text.includes('hinder') || text.includes('experiment')) {
        reply = `Toyota Kata är ryggraden i er förbättringsmetodik. Du har för närvarande **${kataSessions.length} aktiva förbättringssessioner**.\n\n`;
        if (kataSessions.length > 0) {
          const latest = kataSessions[0];
          reply += `Senaste sessionen behandlar **"${latest.title}"** med fokus på hindret: *"${latest.obstacles}"*.\n\n*Coachtips:* Ditt nästa planerade experiment är *"${latest.nextStep}"*. Se till att följa upp detta redan imorgon för att utvärdera lärdomarna snabbt!`;
        } else {
          reply += `Du har inte skapat några Toyota Kata-sessioner ännu. Klicka på "Starta Kata" på Dashboarden för att påbörja ditt första experiment!`;
        }
      }
      else {
        reply = `Baserat på systemets nuvarande register ({ Mål: ${goals.length}, Projekt: ${projects.length}, KPI-medel: ${avgKpiProgress}% }) rekommenderar jag att fokusera på **📚 Lärande och välmående** för att övervinna operativa trösklar.`;
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    { text: 'Kano & CTQ kravanalys 📋', query: 'kano' },
    { text: 'Analysera mina strategiska Mål 🎯', query: 'mål' },
    { text: 'Projektstatus & risker ⚠️', query: 'projekt' },
    { text: 'Granska KPI-benchmark 📈', query: 'kpi' },
    { text: 'Toyota Kata coachtips 🧪', query: 'kata' }
  ];

  return (
    <>
      {/* 1. Floating Round Trigger Button */}
      <button
        id="aiAssistantTrigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-900 border border-indigo-950/20 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 cursor-pointer z-40 transition-transform duration-150 group"
        title="AI Assistant v2.0"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-indigo-50 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 border-2 border-indigo-900 rounded-full animate-bounce" />
        </div>
      </button>

      {/* 2. Floating Chat Container Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            id="aiChatContainer"
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden z-40"
          >
            {/* Header */}
            <div className="p-4 bg-indigo-900 text-white flex items-center justify-between border-b border-indigo-950/20">
              <div className="flex items-center gap-2 text-left">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xs leading-none">MålAssistant Pro</h3>
                  <span className="text-[9px] text-indigo-250 font-mono font-medium tracking-wider">ONLINE • VERKSAMHETSSTÖD</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-indigo-200 hover:text-white transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Messages body list */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4 text-left">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${
                    m.sender === 'user' ? 'ml-auto items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      m.sender === 'user'
                        ? 'bg-indigo-900 text-white rounded-br-none font-medium'
                        : 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                    {m.timestamp.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex flex-col items-start max-w-[85%]">
                  <div className="p-3 bg-white border border-slate-150 rounded-2xl rounded-bl-none shadow-xs text-xs flex items-center gap-1.5 py-2.5">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Quick Chips */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-150 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.query}
                  onClick={() => selectSuggestion(s.text)}
                  className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-150 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-indigo-900 transition text-left cursor-pointer flex items-center gap-1 shrink-0"
                >
                  {s.query === 'kano' && <Scale className="w-3 h-3 text-amber-500" />}
                  {s.query === 'mål' && <Target className="w-3 h-3 text-indigo-700" />}
                  {s.query === 'projekt' && <Briefcase className="w-3 h-3 text-violet-600" />}
                  {s.query === 'kpi' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                  {s.query === 'kata' && <RefreshCw className="w-3 h-3 text-rose-500" />}
                  <span>{s.text}</span>
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-150 flex gap-2.5 items-center bg-white">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Skriv en fråga om dina mål..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-indigo-600 placeholder-slate-400 font-medium"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-indigo-900 hover:bg-indigo-950 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
