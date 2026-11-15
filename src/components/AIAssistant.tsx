/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo, FormEvent } from 'react';
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
  Scale,
  Radio,
  Activity,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Goal,
  Objective,
  Project,
  Initiative,
  Task,
  KPI,
  KataSession,
  CtqKanoItem,
  MatrixRelation,
  Member
} from '../types';
import { summarizeVsmStreamsForAi } from '../utils/vsmHelpers';
import { computeXMatrixGaps } from '../utils/xMatrixHelpers';

interface AIAssistantProps {
  goals: Goal[];
  objectives?: Objective[];
  projects: Project[];
  initiatives?: Initiative[];
  tasks?: Task[];
  kpis: KPI[];
  kataSessions: KataSession[];
  ctqKanoItems: CtqKanoItem[];
  matrixRelations?: MatrixRelation[];
  members?: Member[];
  activeProfile?: { name: string; email?: string; role: string };
  onOpenVoiceCoach?: () => void;
  currentView?: string;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export default function AIAssistant({
  goals,
  objectives = [],
  projects,
  initiatives = [],
  tasks = [],
  kpis,
  kataSessions,
  ctqKanoItems,
  matrixRelations = [],
  members = [],
  activeProfile,
  onOpenVoiceCoach,
  currentView
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hej! Jag är din strategiska AI-assistent. Jag har full överblick över hela plattformen — mål, delmål, Balanced Scorecard, X-matris, projekt, uppgifter, KPI:er, VSM, Kano/CTQ, team och Toyota Kata. Vad vill du fråga om?',
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

    const vsmStreams = summarizeVsmStreamsForAi();
    const xMatrixGaps = computeXMatrixGaps({
      goals,
      objectives,
      projects,
      initiatives,
      kpis,
      relations: matrixRelations,
      members
    });
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text
      }));

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          history,
          state: {
            currentView,
            activeProfile,
            goals,
            objectives,
            projects,
            initiatives,
            tasks,
            kpis,
            kataSessions,
            ctqKanoItems,
            matrixRelations,
            xMatrixGaps,
            vsmStreams,
            members
          }
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

      if (text.includes('x-matris') || text.includes('matris') || text.includes('hoshin') || text.includes('glapp') || text.includes('gap') || text.includes('samband')) {
        const critical = xMatrixGaps.filter((g) => g.severity === 'critical');
        const warnings = xMatrixGaps.filter((g) => g.severity === 'warning');
        reply = `Jag har skannat er **Hoshin Kanri X-Matris** (${matrixRelations.filter(r => r.strength > 0).length} aktiva korrelationer):\n\n• **Kritiska glapp:** ${critical.length} st\n• **Varningar:** ${warnings.length} st\n\n`;
        if (xMatrixGaps.length > 0) {
          reply += xMatrixGaps.slice(0, 3).map(g => `• ${g.message}`).join('\n');
        } else {
          reply += `✓ Alla mål, delmål, projekt och KPI:er har fullständig strategisk koppling och utpekade ägare!`;
        }
      }
      else if (text.includes('vsm') || text.includes('flöde') || text.includes('pce') || text.includes('ledtid') || text.includes('flaskhals')) {
        const primary = vsmStreams[0];
        if (primary) {
          reply = `Här är nuläget för ert primära värdeflöde **"${primary.name}"** (${primary.stepCount} processteg):\n\n• **Processtid (PT):** ${primary.totalProcessTimeHours} h\n• **Total ledtid (LT):** ${primary.totalLeadTimeHours} h\n• **Flödeseffektivitet (PCE):** ${primary.pcePercent}%\n• **First Pass Yield:** ${primary.rolledFirstPassYieldPercent}%\n\n`;
          if (primary.bottleneckStep) {
            reply += `*Största flaskhals:* **"${primary.bottleneckStep.name}"** (${primary.bottleneckStep.waitHours} h väntetid — ${primary.bottleneckStep.wasteDescription || primary.bottleneckStep.wasteType}).`;
          }
        } else {
          reply = `Inga värdeflöden hittades i VSM-modulen just nu.`;
        }
      }
      else if (text.includes('delmål') || text.includes('objective')) {
        const avgObj = objectives.length > 0 ? Math.round(objectives.reduce((s, o) => s + o.progress, 0) / objectives.length) : 0;
        reply = `Ni har **${objectives.length} delmål (Objectives)** med ett genomsnitt på **${avgObj}%** framdrift.\n\n${objectives.slice(0, 4).map(o => `• **${o.title}** (${o.progress}%) — KPI: ${o.kpi}`).join('\n')}`;
      }
      else if (text.includes('uppgift') || text.includes('task') || text.includes('initiativ')) {
        const doneTasks = tasks.filter(t => t.completed).length;
        reply = `Ni har **${initiatives.length} initiativ** och **${tasks.length} dagliga uppgifter** (${doneTasks} slutförda, ${tasks.length - doneTasks} kvarstående).\n\n${tasks.filter(t => !t.completed).slice(0, 4).map(t => `• Kvar att göra: ${t.title}`).join('\n')}`;
      }
      else if (text.includes('team') || text.includes('medlem') || text.includes('användare') || text.includes('ägare')) {
        reply = `Organisationen har **${members.length} registrerade teammedlemmar** (aktiv användare: **${activeProfile?.name || 'Användare'}**, ${activeProfile?.role || 'Strateg'}).\n\n${members.slice(0, 5).map(m => `• **${m.name}** — ${m.role} (${m.status})`).join('\n')}`;
      }
      else if (text.includes('mål') || text.includes('strategi') || text.includes('vision')) {
        const goalNames = goals.map(g => `"${g.title}" (${g.progress}% klart)`).join(', ');
        const avgGoals = goals.length > 0 
          ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) 
          : 0;
        reply = `Jag har analyserat era **${goals.length} aktiva målvisioner** och **${objectives.length} delmål**. Medeluppfyllnaden för målen ligger på **${avgGoals}%**.\n\nRegistrerade mål: ${goalNames || 'inga registrerade än'}.\n\n*Rekommendation*: Säkerställ att varje mål bryts ner i delmål och stöttas av aktiva projekt i X-matrisen.`;
      } 
      else if (text.includes('kano') || text.includes('ctq') || text.includes('krav') || text.includes('voc')) {
        const total = ctqKanoItems.length;
        const mustBe = ctqKanoItems.filter(i => i.kanoCategory === 'Must-be').length;
        const attractive = ctqKanoItems.filter(i => i.kanoCategory === 'Attractive').length;
        const oneDim = ctqKanoItems.filter(i => i.kanoCategory === 'One-dimensional').length;
        reply = `Jag har analyserat era **${total} kravspecifikationer** i Kano & CTQ-modulen:\n\n• **Ska-krav (Must-be):** ${mustBe} st\n• **Prestandakrav (One-dimensional):** ${oneDim} st\n• **Wow-faktorer (Attractive):** ${attractive} st\n\n*Strategisk rekommendation:* Prioritera alltid att åtgärda och leverera era **Must-be** (Ska-krav) först innan ni lägger resurser på Delighter-funktioner.`;
      }
      else if (text.includes('projekt') || text.includes('aktivitet') || text.includes('schema')) {
        const progressList = projects.map(p => `"${p.title}" (${p.progress}% slutfört)`);
        const lagging = projects.filter(p => p.progress < 45);
        reply = `Just nu övervakar jag **${projects.length} operativa projekt** och **${initiatives.length} initiativ**.\n\n${progressList.map(p => `• ${p}`).join('\n')}\n\n`;
        if (lagging.length > 0) {
          reply += `⚠️ **Risk-notis:** Projektet ${lagging.map(p => `"${p.title}"`).join(', ')} utvecklas långsamt. Dela upp i mindre uppgifter (${tasks.filter(t => !t.completed).length} öppna uppgifter i systemet) eller koppla till en Kata-session.`;
        } else {
          reply += `✓ **Status:** Samtliga projekt framskrider enligt schema och uppvisar stabil framgång.`;
        }
      } 
      else if (text.includes('kpi') || text.includes('mätetal') || text.includes('index')) {
        const avgKpi = kpis.length > 0 
          ? Math.round(kpis.reduce((acc, k) => acc + k.progress, 0) / kpis.length)
          : 0;
        const lowestKpi = kpis.length > 0
          ? kpis.reduce((min, k) => k.progress < min.progress ? k : min, kpis[0])
          : null;
        reply = `Era **${kpis.length} KPI:er** uppvisar en genomsnittlig uppfyllelsegrad på **${avgKpi}%**.\n\n`;
        if (lowestKpi) {
          reply += `Mätaren som kräver mest uppmärksamhet är **"${lowestKpi.title}"** som just nu ligger på **${lowestKpi.progress}%** (${lowestKpi.value} / mål ${lowestKpi.target}).`;
        }
      } 
      else if (text.includes('kata') || text.includes('coaching') || text.includes('hinder') || text.includes('experiment')) {
        reply = `Ni har för närvarande **${kataSessions.length} Toyota Kata-sessioner**.\n\n`;
        if (kataSessions.length > 0) {
          const latest = kataSessions[0];
          reply += `Senaste sessionen behandlar **"${latest.title}"** med fokus på hindret: *"${latest.obstacles}"*.\n\n*Nästa steg:* *"${latest.nextStep}"*.`;
        } else {
          reply += `Du har inte skapat några Toyota Kata-sessioner ännu.`;
        }
      }
      else {
        reply = `Jag har full överblick över er data: **${goals.length} mål**, **${objectives.length} delmål**, **${projects.length} projekt**, **${kpis.length} KPI:er** (snitt ${avgKpiProgress}%), **${vsmStreams.length} värdeflöden**, **${ctqKanoItems.length} Kano-krav**, **${kataSessions.length} Kata-sessioner** och **${xMatrixGaps.length} identifierade X-matrisglapp**. Vad vill du dyka djupare i?`;
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

  const suggestions = useMemo(() => {
    switch (currentView) {
      case 'goals':
        return [
          { text: 'Formulera ett SMART-mål 🎯', query: 'mål' },
          { text: 'Vilka mål saknar mätetal? 🔍', query: 'mål' },
          { text: 'Koppla mål till BSC-perspektiv ⚖️', query: 'mål' }
        ];
      case 'projects':
        return [
          { text: 'Projektstatus & risker ⚠️', query: 'projekt' },
          { text: 'Bryt ner projekt i uppgifter 📋', query: 'projekt' },
          { text: 'Prioritera mellan projekt 🚀', query: 'projekt' }
        ];
      case 'x-matrix':
        return [
          { text: 'Analysera X-matrisens strategiska glapp', query: 'x-matris samband gap' },
          { text: 'Vilka KPI:er saknar drivande projekt?', query: 'kpi projekt samband' },
          { text: 'Hur stärker vi Hoshin-kopplingen?', query: 'hoshin strategi' }
        ];
      case 'kpis':
      case 'bsc':
        return [
          { text: 'Granska KPI-balans 📊', query: 'kpi' },
          { text: 'Föreslå ledande mätetal 📈', query: 'kpi' },
          { text: 'Vilka KPI:er släpar efter? ⚠️', query: 'kpi' }
        ];
      case 'vsm':
        return [
          { text: 'Hur sänker vi ledtider? ⏱️', query: 'vsm' },
          { text: 'Vad är bra PCE-verkningsgrad? ⚡', query: 'vsm' },
          { text: 'Eliminera flaskhalsar 🛑', query: 'vsm' }
        ];
      case 'kano':
        return [
          { text: 'Kano & CTQ kravanalys 📋', query: 'kano' },
          { text: 'Prioritera Must-be krav 🛡️', query: 'kano' },
          { text: 'Översätt Voice of Customer 🗣️', query: 'kano' }
        ];
      case 'kata':
        return [
          { text: 'Toyota Kata coachtips 🧪', query: 'kata' },
          { text: 'Formulera nästa PDCA-steg 🔄', query: 'kata' },
          { text: 'Definiera måltillstånd 🎯', query: 'kata' }
        ];
      default:
        return [
          { text: 'Kano & CTQ kravanalys 📋', query: 'kano' },
          { text: 'Analysera mina strategiska Mål 🎯', query: 'mål' },
          { text: 'Projektstatus & risker ⚠️', query: 'projekt' },
          { text: 'Granska KPI-benchmark 📈', query: 'kpi' },
          { text: 'Toyota Kata coachtips 🧪', query: 'kata' }
        ];
    }
  }, [currentView]);

  return (
    <>
      {/* 1. Floating Round Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="aiAssistantTrigger"
          onClick={() => setIsOpen(!isOpen)}
          className="w-13 h-13 bg-indigo-900 border border-indigo-950/20 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 cursor-pointer transition-transform duration-150 group"
          title="MålAssistant AI Chat"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-indigo-50 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 border-2 border-indigo-900 rounded-full animate-bounce" />
          </div>
        </button>
      </div>

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

              <div className="flex items-center gap-2">
                {onOpenVoiceCoach && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenVoiceCoach();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[10px] font-semibold text-white transition cursor-pointer"
                    title="Byt till muntlig röstcoach (gemini-3.8-live)"
                  >
                    <Radio className="w-3 h-3 text-rose-300 animate-pulse" />
                    <span>Live Röst</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-indigo-200 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
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
              {suggestions.map((s, idx) => (
                <button
                  key={`${currentView || 'default'}-${s.query}-${idx}`}
                  onClick={() => selectSuggestion(s.text)}
                  className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-indigo-900 transition text-left cursor-pointer flex items-center gap-1 shrink-0"
                >
                  {s.query === 'kano' && <Scale className="w-3 h-3 text-amber-500" />}
                  {s.query === 'mål' && <Target className="w-3 h-3 text-indigo-700" />}
                  {s.query === 'projekt' && <Briefcase className="w-3 h-3 text-violet-600" />}
                  {s.query === 'kpi' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                  {s.query === 'kata' && <RefreshCw className="w-3 h-3 text-rose-500" />}
                  {s.query === 'vsm' && <Activity className="w-3 h-3 text-cyan-600" />}
                  {(s.query.includes('x-matris') || s.query.includes('hoshin')) && <Compass className="w-3 h-3 text-indigo-600" />}
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
