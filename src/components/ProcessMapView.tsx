/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Network, 
  Workflow, 
  Target, 
  Briefcase, 
  TrendingUp, 
  RefreshCw, 
  Layers, 
  Activity, 
  Scale, 
  FileDown, 
  Table, 
  Mic, 
  Database, 
  Server, 
  Globe, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  ExternalLink, 
  Compass, 
  Info, 
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProcessMapViewProps {
  onNavigateToView: (viewId: string) => void;
  onOpenVoiceCoach?: () => void;
  onDownloadPdf?: () => void;
}

interface StepDetail {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: any;
  category: 'insikt' | 'strategi' | 'nedbrytning' | 'exekvering' | 'stod';
  color: string;
  bgColor: string;
  borderColor: string;
  viewTarget?: string;
  actionTarget?: 'voiceCoach' | 'pdf';
  description: string;
  methodology: string;
  inputs: string[];
  outputs: string[];
  connectionToNext: string;
  keyQuestions: string[];
}

export default function ProcessMapView({ 
  onNavigateToView, 
  onOpenVoiceCoach, 
  onDownloadPdf 
}: ProcessMapViewProps) {
  const [activeTab, setActiveTab] = useState<'methodology' | 'architecture'>('methodology');
  const [selectedStepId, setSelectedStepId] = useState<string>('kano-ctq');

  const methodologySteps: StepDetail[] = [
    {
      id: 'kano-ctq',
      number: '01',
      title: 'Kano-analys & CTQ',
      subtitle: 'Identifiera kundbehov & kritiska krav',
      icon: Scale,
      category: 'insikt',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-200 dark:border-purple-800',
      viewTarget: 'kano',
      description: 'Kategoriserar kundkrav i Must-be (hygienfaktorer), Performance (linjära förväntningar) och Delighters (differentierande mervärden). Bygger ett CTQ-träd (Critical to Quality) som översätter otydliga kundönskemål till mätbara specifikationer.',
      methodology: 'Noriaki Kano (Kano Model) & Lean Six Sigma (Voice of Customer / CTQ Tree)',
      inputs: ['Kundfeedback och intervjuer', 'Marknadsanalys och konkurrentbevakning', 'Reklamationer och supportärenden'],
      outputs: ['Klassificerade kundkrav', 'Mätbara CTQ-faktorer med toleransnivåer', 'Koppling till strategiska mål'],
      connectionToNext: 'CTQ-faktorerna visar vilka processer som skapar verkligt kundvärde och måste kartläggas i VSM.',
      keyQuestions: [
        'Vad förväntar sig kunden som absolut minimum?',
        'Vilka egenskaper skapar differentierande begeistring?',
        'Hur mäter vi kvalitet ur kundens perspektiv?'
      ]
    },
    {
      id: 'vsm',
      number: '02',
      title: 'Värdeflödesanalys (VSM)',
      subtitle: 'Kartlägg processer & eliminera slöseri',
      icon: Activity,
      category: 'insikt',
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-200 dark:border-rose-800',
      viewTarget: 'vsm',
      description: 'Visar hela flödet från ax till limpa. Mäter cykeltid (PT) gentemot total ledtid (LT) och beräknar processverkningsgrad (PCE). Belyser flaskhalsar, väntetider och icke-värdeskapande moment.',
      methodology: 'Toyota Production System / Lean Management (Value Stream Mapping - Rother & Shook)',
      inputs: ['Processsteg och aktörer', 'Cykeltider (Process Time) och kötider (Lead Time)', 'Kassationsgrader och flaskhalsar'],
      outputs: ['Nulägeskarta (Current State)', 'Processverkningsgrad (PCE %)', 'Framtidsbild (Future State) och förbättringsinitiativ'],
      connectionToNext: 'Flaskhalsarna och effektivitetsluckorna omvandlas till konkreta mål i Balanced Scorecard.',
      keyQuestions: [
        'Hur stor andel av tiden tillför vi faktiskt värde?',
        'Var uppstår de längsta väntetiderna?',
        'Vilket framtida måltillstånd vill vi nå?'
      ]
    },
    {
      id: 'bsc',
      number: '03',
      title: 'Balanced Scorecard (BSC)',
      subtitle: 'Balansera 4 strategiska perspektiv',
      icon: Layers,
      category: 'strategi',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      viewTarget: 'bsc',
      description: 'Förhindrar ensidig kortsiktig finansiell styrning genom att balansera Finans med Kund, Interna Processer samt Lärande & Förnyelse. Säkerställer långsiktig överlevnad och innovationskraft.',
      methodology: 'Robert Kaplan & David Norton (The Balanced Scorecard)',
      inputs: ['Företagets vision och långsiktiga strategi', 'Insikter från Kano & VSM', 'Finansiella målsättningar'],
      outputs: ['Strategisk karta med 4 balanserade perspektiv', 'Strukturerade KPI:er per perspektiv', 'Harmoniserade prioriteringar'],
      connectionToNext: 'BSC-perspektiven bryts ned i konkreta Mål och Delmål med tydliga ägare.',
      keyQuestions: [
        'Hur ser vi ut i aktieägarnas ögon? (Finans)',
        'Hur uppfattas vi av kunderna? (Kund)',
        'Vilka processer måste vi briljera i? (Processer)',
        'Hur behåller vi förmågan att förändras och växa? (Lärande)'
      ]
    },
    {
      id: 'goals-objectives',
      number: '04',
      title: 'Mål & Delmål (Objectives)',
      subtitle: 'Tydlig orsak-verkan-hierarki',
      icon: Target,
      category: 'nedbrytning',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      viewTarget: 'goals',
      description: 'Definierar strategiska huvudmål och delar upp dem i mätbara delmål (Objectives). Skapar full spårbarhet så att ledning och medarbetare förstår exakt varför varje initiativ genomförs.',
      methodology: 'Hoshin Kanri (Policy Deployment) & OKR (Objectives and Key Results)',
      inputs: ['BSC-perspektiv', 'Marknadsmål och tillväxtambitioner', 'Tidsramar och deadlines'],
      outputs: ['Strategiska mål med framdriftsstatus (%)', 'Delmål kopplade till respektive huvudmål', 'Tydlig ägarstruktur'],
      connectionToNext: 'Varje delmål bemannas och förverkligas genom operativa projekt och initiativ.',
      keyQuestions: [
        'Vad vill vi uppnå och när?',
        'Vilka delmål krävs för att målet ska uppfyllas?',
        'Hur säkerställer vi att målet är SMART?'
      ]
    },
    {
      id: 'projects-tasks',
      number: '05',
      title: 'Projekt & Aktiviteter',
      subtitle: 'Operativt genomförande i praktiken',
      icon: Briefcase,
      category: 'nedbrytning',
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/40',
      borderColor: 'border-violet-200 dark:border-violet-800',
      viewTarget: 'projects',
      description: 'Operativa projekt med delaktiviteter och uppgifter. Framdriften i projekten aggregeras automatiskt till målnivå och visar realtidsstatus för organisationens samlade leverans.',
      methodology: 'Agil projektstyrning, Milstolpeplanering & WBS (Work Breakdown Structure)',
      inputs: ['Strategiska delmål', 'Resurser, budget och tidsplan', 'Beroenden mellan team'],
      outputs: ['Projektportfölj med milstolpar', 'Aktivitetslistor med checkbara uppdrag', 'Automatisk framdriftsberäkning'],
      connectionToNext: 'Under projektets gång möter teamet oförutsedda hinder som hanteras via Toyota Kata.',
      keyQuestions: [
        'Vilka konkreta projekt tar oss till målet?',
        'Vem ansvarar för vilka deluppgifter?',
        'Håller tidsplanen och var finns risker?'
      ]
    },
    {
      id: 'kata-coaching',
      number: '06',
      title: 'Toyota Kata Coaching',
      subtitle: 'PDCA-experiment mot måltillstånd',
      icon: RefreshCw,
      category: 'exekvering',
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-200 dark:border-rose-800',
      viewTarget: 'kata',
      description: 'Strukturerat förbättringsmönster baserat på 5 standardiserade frågor: Måltillstånd ➔ Nuläge ➔ Hinder ➔ Nästa steg (PDCA-experiment) ➔ Vad vi lärde oss. Gör förbättringsarbetet till en daglig vana.',
      methodology: 'Mike Rother (Toyota Kata) & PDCA (Plan-Do-Check-Act)',
      inputs: ['Hinder i pågående projekt eller processer', 'Avvikelser mot KPI:er', 'Tidigare experimentresultat'],
      outputs: ['Dokumenterade Kata-sessioner', 'Små, snabba PDCA-experiment med hypoteser', 'Ackumulerat organisatoriskt lärande'],
      connectionToNext: 'Lärdomarna justerar processer och driver upp måluppfyllelsen i KPI-mätningarna.',
      keyQuestions: [
        'Vad är måltillståndet?',
        'Vad är nuläget just nu?',
        'Vilka hinder hindrar oss och vilket adresserar vi nu?',
        'Vad är nästa steg och vad förväntar vi oss lära oss?',
        'Hur snabbt kan vi utvärdera resultatet?'
      ]
    },
    {
      id: 'kpis-metrics',
      number: '07',
      title: 'KPI:er & Nyckeltalsuppföljning',
      subtitle: 'Mätetal & tidiga varningssignaler',
      icon: TrendingUp,
      category: 'exekvering',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      viewTarget: 'kpis',
      description: 'Kopplar hårda mätetal till varje BSC-kategori med startvärde, målvärde och procentuell måluppfyllelse. Fungerar som ledningsgruppens instrumentbräda för att upptäcka avvikelser i tid.',
      methodology: 'Lead & Lag Metrics (Ledande och släpande indikatorer)',
      inputs: ['Verksamhetsdata och ekonomiska utfall', 'Kvalitetsmått och ledtider', 'Kundnöjdhetsindex'],
      outputs: ['Realtidsgrafer och måluppfyllelsestatus (%)', 'Tidiga varningsindikatorer', 'Underlag för ledningsbeslut'],
      connectionToNext: 'Sammanfattas i automatiserade rapporter och diskuteras med AI Röstcoachen.',
      keyQuestions: [
        'Ligger vi i fas mot våra års- och kvartalsmål?',
        'Har vi en bra balans mellan ledande och släpande mätetal?',
        'Vilka åtgärder krävs vid negativa avvikelser?'
      ]
    },
    {
      id: 'ai-voice-coach',
      number: '08',
      title: 'Live Röstcoach & Beslutsstöd',
      subtitle: 'Muntlig AI-sparring & rapporter',
      icon: Mic,
      category: 'stod',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      actionTarget: 'voiceCoach',
      description: 'Avancerat beslutsstöd drivet av Google Gemini 3.8 Live API. Prata direkt med AI:n via röst för att utmana antaganden, diskutera strategiska val och simulera Kata-coaching. Generera dessutom formella PDF-rapporter för styrelse och ledning med ett klick.',
      methodology: 'Google GenAI Live Bi-directional Streaming & AI Decision Augmentation',
      inputs: ['Alla mål, projekt och KPI-statusar från plattformen', 'Användarens talade frågor och funderingar'],
      outputs: ['Direkt talad strategisk feedback och reflektioner', 'Formell PDF-rapport med nuläge och status', 'CSV-export för vidare analys'],
      connectionToNext: 'Återkopplar insikterna tillbaka till steg 1 för kontinuerlig strategisk iteration.',
      keyQuestions: [
        'Vilka blinda fläckar har vi i vår nuvarande plan?',
        'Hur förklarar vi statusen bäst för styrelse och intressenter?',
        'Vilket nästa experiment ger störst effekt per investerad timme?'
      ]
    }
  ];

  const selectedStep = methodologySteps.find(s => s.id === selectedStepId) || methodologySteps[0];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Systemöversikt & Alignment
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">End-to-End Arkitektur</span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Processkarta & Arkitektur
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Se hur organisationens vision, kundkrav, värdeflöden och dagliga PDCA-experiment hänger ihop i en obruten orsak-verkan-kedja.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'methodology'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Workflow className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Metodologiskt Processflöde</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>System- & Dataarkitektur</span>
          </button>
        </div>
      </div>

      {activeTab === 'methodology' ? (
        /* ================= METHODOLOGY PROCESS MAP ================= */
        <div className="space-y-6">
          {/* Main Visual Flow Line */}
          <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-800 dark:text-slate-200">
                  Den strategiska röda tråden (Klicka på ett steg för djupdykning)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Från extern kundinsikt ➔ balanserad strategi ➔ operativ nedbrytning ➔ kontinuerlig förbättring.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Insikt
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Strategi & KPI
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Nedbrytning
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Förbättring
                </span>
              </div>
            </div>

            {/* Grid of interactive pipeline cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {methodologySteps.map((step, idx) => {
                const Icon = step.icon;
                const isSelected = selectedStepId === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-50 dark:bg-slate-850 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-xl ${step.bgColor} ${step.color} transition-transform group-hover:scale-105`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                          {step.number}
                        </span>
                      </div>
                      
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-400 transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {step.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1 font-semibold">
                        Granska detaljer
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Deep-Dive Inspector */}
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${selectedStep.bgColor} ${selectedStep.color} shrink-0 mt-1`}>
                  <selectedStep.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      STEG {selectedStep.number}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {selectedStep.methodology}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedStep.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedStep.subtitle}
                  </p>
                </div>
              </div>

              {/* Direct action button to jump into the app */}
              <div className="shrink-0 flex items-center gap-2">
                {selectedStep.viewTarget && (
                  <button
                    onClick={() => onNavigateToView(selectedStep.viewTarget!)}
                    className="px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
                  >
                    <span>Öppna {selectedStep.title}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {selectedStep.actionTarget === 'voiceCoach' && onOpenVoiceCoach && (
                  <button
                    onClick={onOpenVoiceCoach}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Starta Röstcoachen</span>
                  </button>
                )}
                {selectedStep.actionTarget === 'voiceCoach' && onDownloadPdf && (
                  <button
                    onClick={onDownloadPdf}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Ladda ner PDF</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Col 1: Syfte & Beskrivning */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Syfte & Tillämpning
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedStep.description}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Kritiska Styrfrågor
                  </h5>
                  <ul className="space-y-1.5">
                    {selectedStep.keyQuestions.map((q, idx) => (
                      <li key={idx} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">?</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Col 2: Indata & Utdata */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Indata (Vad som krävs in)
                  </h4>
                  <ul className="space-y-2">
                    {selectedStep.inputs.map((inp, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Utdata (Vad som skapas ut)
                  </h4>
                  <ul className="space-y-2">
                    {selectedStep.outputs.map((out, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Col 3: Hur det kopplar till nästa steg */}
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                    <Workflow className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Koppling till nästa led
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {selectedStep.connectionToNext}
                  </p>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                    <strong className="text-slate-700 dark:text-slate-200">Orsak-verkan-principen: </strong>
                    Inget projekt startas utan ett förankrat delmål, och inget delmål formuleras utan att svara mot ett kundkrav eller ett BSC-perspektiv.
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Metodologiskt ursprung
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                      Best Practice
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Kombinationen av Kaplan & Nortons Balanced Scorecard, Mike Rothers Toyota Kata och Lean Six Sigma skapar ett slutet styrsystem som förenar strategi på ledningsnivå med dagliga experiment i teamen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= TECHNICAL SYSTEM ARCHITECTURE ================= */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Box 1: Client Frontend Layer */}
            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">
                    1. Frontend Klient (SPA)
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">React 19 + TypeScript + Vite</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Single Page Application med noll omladdningar, omedelbar rendering och responsiv layout för både desktop och iPad.
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-200 block mb-1">
                    State Management & Cache
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Realtids synkronisering via Firestore-lyssnare i kombination med <code>localStorage</code>-backup för blixtsnabb återstart utan tom skärm.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-200 block mb-1">
                    Audio Capture & Playback
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <code>AudioContext</code> fångar mikrofonljud i 16 kHz PCM chunk-vis och spelar upp AI-svaret i 24 kHz med sömlös audio buffering.
                  </p>
                </div>
              </div>
            </div>

            {/* Box 2: Node.js / Express Backend & SSE Bridge */}
            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">
                    2. Backend Server & Stream
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Node.js + Express (Port 3000)</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tjänar appen och agerar säker gateway för AI-anrop och strömmande data utan att exponera API-nycklar till klienten.
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                  <span className="font-bold text-[11px] text-indigo-900 dark:text-indigo-300 block mb-1">
                    HTTP SSE Live Audio Stream (/api/live/stream)
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Server-Sent Events bryggar tvåvägsljudet till webbläsaren och undviker de 302-redirect-problem som annars uppstår med WebSockets i cross-origin iframes.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-200 block mb-1">
                    PCM Input Stream (/api/live/input)
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tar emot användarens röst i realtid och vidarebefordrar bitströmmar direkt till Gemini Live-sessionen.
                  </p>
                </div>
              </div>
            </div>

            {/* Box 3: Cloud & AI Integration */}
            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">
                    3. Moln & AI-Motor
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Firebase & Gemini 3.8</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Skalbar molnlagring och nästa generations multimodala AI-motor för direkt muntlig och skriftlig intelligens.
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-200 block mb-1">
                    Firebase Auth & Cloud Firestore
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Google OAuth-inloggning, gäståtkomstläge, rollstyrning (RBAC) och strukturerade samlingar för mål, projekt, KPI:er och Kata.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <span className="font-bold text-[11px] text-emerald-900 dark:text-emerald-300 block mb-1">
                    Google Gemini 3.8 Live API
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Multimodal tvåvägs röstström via <code>ai.live.connect</code> för realtids coachning och dialog utan fördröjning.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dataflow ASCII / Architectural Diagram Card */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
                  Komplett Dataflöde i Drift
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Klient ➔ Server ➔ Moln ➔ AI
              </span>
            </div>

            <pre className="font-mono text-[11px] leading-relaxed text-indigo-300 overflow-x-auto p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
{`[ Webbläsare / Klient ]
     │
     ├── 1. Lokala ändringar (Mål/Projekt/KPI) ──► localStorage Backup (Omedelbar återstart)
     │
     ├── 2. Realtidssynkning ────────────────────► Firebase Firestore (Molndatabas)
     │                                            (Collections: goals, projects, kpis, kata)
     │
     └── 3. Röstcoach & Audio ───────────────────► Express Server (server.ts)
                                                      │
                                                      ├── POST /api/live/input (16kHz PCM chunks)
                                                      │        │
                                                      │        ▼
                                                      └── Google Gemini 3.8 Live API
                                                               │  (ai.live.connect via WebSocket)
                                                               ▼
                                                          Svar & Röst (24kHz PCM)
                                                               │
                                                               ▼
                                                      SSE Stream: GET /api/live/stream
                                                               │
                                                               ▼
                                                      [ Klient Högtalare / AudioContext ]`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
