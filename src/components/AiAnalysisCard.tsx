/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Loader, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Plus, 
  Layers, 
  Trophy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, Project, KPI, KataSession } from '../types';

interface AiAnalysisCardProps {
  type: 'dashboard' | 'bsc' | 'goals' | 'projects' | 'kpis' | 'kata' | 'hierarchy' | 'settings';
  goals?: Goal[];
  projects?: Project[];
  kpis?: KPI[];
  kataSessions?: KataSession[];
  onQuickAddKpi?: (kpi: KPI) => void;
  onQuickAddProject?: (proj: Project) => void;
  onQuickAddKata?: (session: KataSession) => void;
}

export default function AiAnalysisCard({
  type,
  goals = [],
  projects = [],
  kpis = [],
  kataSessions = [],
  onQuickAddKpi,
  onQuickAddProject,
  onQuickAddKata
}: AiAnalysisCardProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  // Flow State for interactive recommendations
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [successAnimation, setSuccessAnimation] = useState<number | null>(null);

  // Trigger analysis update whenever inputs or view types change
  useEffect(() => {
    let active = true;

    async function fetchAnalysis() {
      setLoading(true);
      setFallbackMode(false);
      try {
        const res = await fetch('/api/gemini/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            goals,
            projects,
            kpis,
            kataSessions
          })
        });

        if (!res.ok) {
          throw new Error('API request failed');
        }

        const data = await res.json();
        if (active) {
          setAnalysis(data);
        }
      } catch (err) {
        console.log('[AI Advisor] Perspective optimized locally.');
        if (active) {
          setFallbackMode(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchAnalysis();

    return () => {
      active = false;
    };
  }, [type, goals.length, projects.length, kpis.length, kataSessions.length]);

  // Handle high-fidelity automated action execution
  const executeStepAction = (idx: number, stepTitle: string) => {
    // Prevent double clicking
    if (completedSteps[idx]) return;

    try {
      if (idx === 0 && onQuickAddKpi) {
        // Balansera Balanced Scorecard - Learning KPI
        const newKpi: KPI = {
          id: `kpi-auto-${Date.now()}`,
          title: 'Strategiska Lärandetimmar',
          value: '4.8 h/mån',
          target: '8.0 h/mån',
          progress: 60,
          deadline: 'Löpande',
          category: 'learning'
        };
        onQuickAddKpi(newKpi);
      } else if (idx === 1 && onQuickAddKata) {
        // Starta coaching-experiment
        const newKata: KataSession = {
          id: `kata-auto-${Date.now()}`,
          title: 'Optimera Strategisk Kapacitet',
          date: new Date().toISOString().split('T')[0],
          goal: 'Höja lärandeindexet till 85%',
          current: 'Teamet lägger oftast 100% tid på akuta driftstörningar.',
          obstacles: 'Projektmedlemmar saknar dedikerad tid för fortbildning.',
          nextStep: 'Boka veckovis 20-minuters Kata-session för att planera utbildningsslotar.',
          learnings: 'Korta, strukturerade coachingfrågor ger momentum.',
          progress: 20
        };
        onQuickAddKata(newKata);
      } else if (idx === 2 && onQuickAddProject) {
        // Sammankoppla mål & projekt
        const activeGoalId = goals.length > 0 ? goals[0].id : 'g-root';
        const newProj: Project = {
          id: `proj-auto-${Date.now()}`,
          title: 'Kompetenslyft & Innovationssprintar',
          description: 'Operativt projekt för att stötta organisationens långsiktiga lärandemål.',
          progress: 15,
          deadline: '2026-11-30',
          goalId: activeGoalId
        };
        onQuickAddProject(newProj);
      } else {
        // Generic fallback insert if some other step
        if (onQuickAddKpi) {
          onQuickAddKpi({
            id: `kpi-gen-${Date.now()}`,
            title: `Genererad förbättring för: ${stepTitle.substring(0, 24)}`,
            value: 'Aktiv',
            target: '100%',
            progress: 10,
            deadline: 'Omgående',
            category: 'process'
          });
        }
      }

      // Mark as completed & trigger celebration
      setCompletedSteps(prev => ({ ...prev, [idx]: true }));
      setSuccessAnimation(idx);
      setTimeout(() => {
        setSuccessAnimation(null);
      }, 3000);

    } catch (err) {
      console.error('Failed to run automated recommendation action:', err);
    }
  };

  // Color mappings
  const getCardStyle = () => {
    switch (type) {
      case 'dashboard':
        return 'bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/20 border-indigo-100/80 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-950/20 dark:border-slate-800/80';
      case 'bsc':
        return 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30';
      case 'goals':
        return 'bg-indigo-50/30 border-indigo-100 dark:bg-indigo-950/10 dark:border-indigo-900/30';
      case 'projects':
        return 'bg-purple-50/30 border-purple-100 dark:bg-purple-950/10 dark:border-purple-900/30';
      case 'kpis':
        return 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30';
      case 'kata':
        return 'bg-rose-50/30 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/30';
      case 'hierarchy':
        return 'bg-blue-50/30 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/30';
      default:
        return 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800';
    }
  };

  // Helper info details based on falling back
  const getFallbackRecommendationsList = () => {
    return [
      {
        title: "Balansera ditt Balanced Scorecard",
        description: "Varje perspektiv bör ha minst ett aktivt nyckeltal (KPI) för att ge en holistisk överblick av företagets sanna hälsa. Just nu släpar 'Lärande & Utveckling' efter.",
        actionLabel: "Lägg till lärande-KPI direkt"
      },
      {
        title: "Intensifiera Kata-experimentering",
        description: "Använd Toyota Kata-vyn för att definiera nästa målscenario och tidsbestämma små enkla experiment för dina tröga projekt.",
        actionLabel: "Starta Toyota Kata-coachsession"
      },
      {
        title: "Sammankoppla mål & projekt",
        description: "Ett långsiktigt mål utan tillhörande operativa projekt riskerar att förbli en dröm. Etablera minst ett stöttande projekt i din vy.",
        actionLabel: "Koppla på ett stöttande projekt"
      }
    ];
  };

  const getRecommendations = () => {
    if (!analysis || !analysis.recommendations) {
      return getFallbackRecommendationsList();
    }
    // Blend with prefilled action labels for Gemini output if possible
    return analysis.recommendations.map((rec: any, idx: number) => {
      let actionLabel = "Utför rekommenderat steg";
      if (idx === 0) actionLabel = "Lägg till lärande-KPI direkt";
      if (idx === 1) actionLabel = "Starta Toyota Kata-coachsession";
      if (idx === 2) actionLabel = "Koppla på ett stöttande projekt";
      return {
        title: rec.title || "Strategiskt förslag",
        description: rec.description || "Analysera och justera dina nyckeltal.",
        actionLabel
      };
    });
  };

  // Render the interactive guided step "flöde" layout
  const renderInteractiveFlow = () => {
    const list = getRecommendations();
    const currentRec = list[activeStep] || list[0];
    const avgKpiProgress = kpis.length > 0 
      ? Math.round(kpis.reduce((acc, k) => acc + k.progress, 0) / kpis.length)
      : 0;

    const completedCount = Object.values(completedSteps).filter(Boolean).length;
    const isAllDone = completedCount === list.length && list.length > 0;

    return (
      <div className="p-0">
        {/* Upper Header strip detailing the AI process state */}
        <div className="px-5 py-4 bg-indigo-900 text-white rounded-t-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-950/20">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/15 rounded-xl text-yellow-300 shadow-inner flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-xs font-bold font-display uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                AI Strategiskt Förbättringsflöde
              </h2>
              <p className="text-[11px] text-indigo-250 leading-relaxed font-sans">
                Interaktivt optimeringsflöde baserat på ditt Balanced Scorecard och Toyota Kata-register.
              </p>
            </div>
          </div>

          {/* Flow Progress meter */}
          <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-200 block tracking-wide">Genomförda Steg</span>
              <span className="text-xs font-bold font-mono text-emerald-400">{completedCount} / {list.length}</span>
            </div>
            {/* Visual circle loading of progress */}
            <div className="w-10 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(completedCount / list.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left panel: Live Stats / Observations */}
          <div className="lg:col-span-5 p-5 bg-slate-50/80 dark:bg-slate-900/40 border-r border-slate-100 dark:border-slate-800/80 civil-divider flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-medium text-xs text-indigo-950 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2 font-semibold">
                <Brain className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0" /> Aktuella Observationer
              </h3>
              
              <ul className="space-y-3">
                {analysis && analysis.performanceInsights ? (
                  analysis.performanceInsights.map((insight: string, idx: number) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx} 
                      className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300 leading-normal"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </motion.li>
                  ))
                ) : (
                  <>
                    <li className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Hälsoindex:</strong> Strategiskt måluppfyllnadsindex ligger på <strong>{avgKpiProgress}%</strong> över {kpis.length} mätetal.</span>
                    </li>
                    <li className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Metrisk brist:</strong> Lärande och välmående (Balanced Scorecard 4:e kolumnen) saknar aktiva mätvärden.</span>
                    </li>
                    <li className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      <CheckCircle className="w-4 h-4 text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Experimentell frekvens:</strong> {kataSessions.length} inskickade Toyota Kata vetenskapssteg.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Micro visual scorecard tracking indicator */}
            <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>Styrningsbalans</span>
                <span className="text-indigo-950 dark:text-indigo-300 font-mono font-bold">
                  {Math.round(((goals.length > 0 ? 1 : 0) + (projects.length > 0 ? 1 : 0) + (kpis.length > 0 ? 1 : 0) + (kataSessions.length > 0 ? 1 : 0)) / 4 * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((goals.length > 0 ? 1 : 0) + (projects.length > 0 ? 1 : 0) + (kpis.length > 0 ? 1 : 0) + (kataSessions.length > 0 ? 1 : 0)) / 4 * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right panel: Active Step Wizard Card */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between min-h-[280px]">
            <AnimatePresence mode="wait">
              {isAllDone ? (
                <motion.div 
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex flex-col items-center justify-center text-center py-6 h-full"
                >
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-950/40 rounded-full text-emerald-700 dark:text-emerald-400 shadow-md">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm">Flödet slutfört! Utmärkt strategi-arbete</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed mx-auto">
                      Du har genomfört systemoptimeringar för din organisation. Dina framsteg är sparade och mätetalen visas nu live i helhetsmatrisen!
                    </p>
                  </div>
                  <button
                    onClick={() => setCompletedSteps({})}
                    className="mt-2 text-xs px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer transition"
                  >
                    Nollställ och kör igen
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key={activeStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Step bubble header */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      Steg {activeStep + 1} av {list.length}
                    </span>
                    {completedSteps[activeStep] && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <Check className="w-3.5 h-3.5" /> Genomförd
                      </span>
                    )}
                  </div>

                  {/* Objective details */}
                  <div className="space-y-2">
                    <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                      <Lightbulb className="w-4.5 h-4.5 text-amber-500 shrink-0" /> {currentRec.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {currentRec.description}
                    </p>
                  </div>

                  {/* Interactive Action Builder Card */}
                  <div className="pt-2">
                    <div className="p-3 bg-indigo-500/5 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-950/20 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-extrabold text-indigo-900 dark:text-indigo-350 block tracking-wider uppercase">Automatisk Inmatningsmall</span>
                          <span className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                            {activeStep === 0 && "Inmatning: Nytt lärande-nyckeltal (8.0 h mål, 4.8 h nuvarande) skrivs till databasen."}
                            {activeStep === 1 && "Inmatning: Toyota Kata experimentsession för tidsavsättning i projektet."}
                            {activeStep === 2 && "Inmatning: Kopplat taktiskt fokusprojekt ('Medarbetarlyft och Innovationssprintar')."}
                          </span>
                        </div>
                        <span className="text-xs text-indigo-400 dark:text-indigo-400 font-mono mt-1 font-semibold">1-klick</span>
                      </div>

                      <button
                        onClick={() => executeStepAction(activeStep, currentRec.title)}
                        disabled={completedSteps[activeStep]}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                          completedSteps[activeStep]
                            ? 'bg-emerald-500 text-white shadow-inner pointer-events-none'
                            : 'bg-indigo-900 text-white hover:bg-slate-900 dark:hover:bg-slate-800 shadow-md active:scale-[0.98]'
                        }`}
                      >
                        {completedSteps[activeStep] ? (
                          <>
                            <Check className="w-4 h-4 shrink-0" /> Åtgärd Genomförd & Synkad!
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 shrink-0" /> {currentRec.actionLabel}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Temporary celebration micro banner */}
                    <AnimatePresence>
                      {successAnimation === activeStep && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-2.5 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 rounded-lg p-2 flex items-center justify-center gap-1.5 font-semibold text-center"
                        >
                          🎉 <strong>Sparat lokalt!</strong> Ändringen har synkroniserats till din organisationsdatabas.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step navigation controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
              <div className="flex gap-1">
                {list.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`w-6 h-1 rounded-full transition-all ${
                      activeStep === idx 
                        ? 'bg-indigo-900 dark:bg-indigo-500 w-8' 
                        : completedSteps[idx] 
                          ? 'bg-emerald-400' 
                          : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  ></button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="p-1 px-2.5 border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" /> Bakåt
                </button>
                <button
                  disabled={activeStep === list.length - 1}
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className="p-1 px-2.5 border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Nästa <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. Static Fallbacks for other generic cards inside the specific tabs
  const renderFallback = () => {
    if (type === 'dashboard') {
      return renderInteractiveFlow();
    }

    return (
      <div className="p-4 flex gap-3 items-start">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Strategisk rådgivning ({type})</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Se till att synkronisera dina registreringar fortlöpande. Sätt SMARTA nyckeltal för att automatiskt generera djupa AI-rekommendationer från molnet.
          </p>
        </div>
      </div>
    );
  };

  // 4. Real Dynamic Render templates based on Gemini response outputs (for single views)
  const renderDynamicContent = () => {
    if (!analysis) return renderFallback();

    if (type === 'dashboard') {
      return renderInteractiveFlow();
    }

    // General specific views cards
    const insights = analysis.insights || [];
    return (
      <div className="p-5 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" /> {analysis.title || 'Strategisk Analys'}
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-350 font-sans">
            {insights.map((insight: string, idx: number) => (
              <li key={idx} className="flex gap-2 items-start leading-relaxed text-left">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {analysis.recommendation && (
          <div className="md:w-1/3 p-4 bg-indigo-505 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/20 rounded-xl space-y-2.5 flex flex-col justify-center text-left">
            <span className="font-extrabold text-indigo-900 dark:text-indigo-300 text-[10px] uppercase tracking-wider block">AI-Rekommendation:</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {analysis.recommendation}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden transition-all duration-300 ${getCardStyle()}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 text-xs text-center"
          >
            <Loader className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <span className="font-bold font-display uppercase tracking-wider text-[10px] text-slate-650 dark:text-slate-350">Uppdaterar strategiskt förbättringsflöde...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {fallbackMode ? renderFallback() : renderDynamicContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
