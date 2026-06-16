/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles, Brain, Lightbulb, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, Project, KPI, KataSession } from '../types';

interface AiAnalysisCardProps {
  type: 'dashboard' | 'bsc' | 'goals' | 'projects' | 'kpis' | 'kata' | 'hierarchy' | 'settings';
  goals?: Goal[];
  projects?: Project[];
  kpis?: KPI[];
  kataSessions?: KataSession[];
}

export default function AiAnalysisCard({
  type,
  goals = [],
  projects = [],
  kpis = [],
  kataSessions = []
}: AiAnalysisCardProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

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
        console.warn('Real AI Analysis failed, enabling local fallbacks:', err);
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

  // Color mappings
  const getCardStyle = () => {
    switch (type) {
      case 'dashboard':
        return 'bg-indigo-50/30 border-indigo-100';
      case 'bsc':
        return 'bg-emerald-50/30 border-emerald-100';
      case 'goals':
        return 'bg-indigo-50/30 border-indigo-100';
      case 'projects':
        return 'bg-purple-50/30 border-purple-100';
      case 'kpis':
        return 'bg-emerald-50/30 border-emerald-100';
      case 'kata':
        return 'bg-rose-50/30 border-rose-100';
      case 'hierarchy':
        return 'bg-blue-50/30 border-blue-100';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  // 1. Static Fallbacks when Gemini API is offline or loading fails
  const renderFallback = () => {
    const totalGoalsCount = goals.length;
    const totalProjectsCount = projects.length;
    const avgKpiProgress = kpis.length > 0 
      ? Math.round(kpis.reduce((acc, k) => acc + k.progress, 0) / kpis.length)
      : 0;
    const lowProgressProjects = projects.filter(p => p.progress < 40);

    if (type === 'dashboard') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-700" /> Analysinsikter (Lokal analys)
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex gap-2 items-start">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Lönsamhet & Kultur:</strong> Finansiella och interna processmätetal uppvisar goda medelvärden.</span>
              </li>
              <li className="flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Utvecklingsområden:</strong> Lärande och välmående behöver fyllas på med nya KPIer.</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Framstegsindex:</strong> Snittuppfyllnaden ligger på <strong>{avgKpiProgress}%</strong> över {kpis.length} mätetal.</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-display font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Rekommenderade Åtgärder
            </h3>
            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-150/40 text-xs text-slate-600">
              <strong>⚙️ Öka lärandefokus:</strong> Lägg till nya KPI:er för anställdas fortbildning och innovation, vilket stärker de långsiktiga ekonomiska målen sekundärt.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 flex gap-3 items-start">
        <Sparkles className="w-5 h-5 text-indigo-650 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800">Strategisk rådgivning ({type})</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Se till att synkronisera dina registreringar fortlöpande. Sätt SMARTA nyckeltal för att automatiskt generera djupa AI-rekommendationer från molnet.
          </p>
        </div>
      </div>
    );
  };

  // 2. Real Dynamic Render templates based on Gemini response outputs
  const renderDynamicContent = () => {
    if (!analysis) return renderFallback();

    if (type === 'dashboard') {
      const insights = analysis.performanceInsights || [];
      const recs = analysis.recommendations || [];

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          {/* Insights */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-700" /> Prestationsinsikter (Live AI-analys)
            </h3>
            <ul className="space-y-3">
              {insights.map((insight: string, idx: number) => (
                <motion.li 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </motion.li>
              ))}
              {insights.length === 0 && (
                <li className="text-xs text-slate-400 italic">Analysen slutförd men inga avvikelser rapporterades.</li>
              )}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Strategiska AI-Rekommendationer
            </h3>
            <div className="space-y-3">
              {recs.map((rec: any, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-100/50"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-900 flex items-center gap-1">
                    ✨ {rec.title || 'Strategiskt förslag'}
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    {rec.description}
                  </p>
                </motion.div>
              ))}
              {recs.length === 0 && (
                <p className="text-xs text-slate-400 italic">Välj ett annat perspektiv för att ladda strategiska tips.</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // General specific views cards
    const insights = analysis.insights || [];
    return (
      <div className="p-5 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-indigo-650" /> {analysis.title || 'Strategisk Analys'}
          </h4>
          <ul className="space-y-2 text-xs text-slate-600">
            {insights.map((insight: string, idx: number) => (
              <li key={idx} className="flex gap-2 items-start leading-relaxed">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {analysis.recommendation && (
          <div className="md:w-1/3 p-3 bg-indigo-500/5 border border-indigo-100/50 rounded-xl space-y-1 flex flex-col justify-center">
            <span className="font-bold text-indigo-900 text-[10px] uppercase tracking-wider block">AI-Rekommendation:</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
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
      className={`rounded-2xl border bg-white shadow-xs overflow-hidden transition-all duration-300 ${getCardStyle()}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 flex items-center justify-center gap-2.5 text-slate-500 text-xs"
          >
            <Loader className="w-4.5 h-4.5 text-indigo-600 animate-spin" />
            <span className="font-medium font-mono text-[10px] uppercase tracking-wider">Genererar strategisk AI-analys...</span>
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
