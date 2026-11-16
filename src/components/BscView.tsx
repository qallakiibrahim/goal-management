/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Activity, 
  GraduationCap, 
  TrendingUp, 
  Plus, 
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { KPI, GoalCategory } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface BscViewProps {
  kpis: KPI[];
  onAddKpi: (cat: GoalCategory) => void;
}

export default function BscView({ kpis, onAddKpi }: BscViewProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ perspectiveIndex: number; monthIndex: number } | null>(null);

  // Filter KPIs by perspective
  const financialKpis = kpis.filter(k => k.category === 'financial');
  const customerKpis = kpis.filter(k => k.category === 'customer');
  const processKpis = kpis.filter(k => k.category === 'process');
  const learningKpis = kpis.filter(k => k.category === 'learning');

  // Compute average progress per category
  const getCategoryAvg = (categoryKpis: KPI[], defaultVal: number) => {
    if (categoryKpis.length === 0) return defaultVal;
    return Math.round(categoryKpis.reduce((acc, k) => acc + k.progress, 0) / categoryKpis.length);
  };

  const financialAvg = getCategoryAvg(financialKpis, 77);
  const customerAvg = getCategoryAvg(customerKpis, 78);
  const processAvg = getCategoryAvg(processKpis, 88);
  const learningAvg = getCategoryAvg(learningKpis, 72);

  // Trend data for the 6-month chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun'];
  const trends = [
    { name: 'Finansiellt', color: '#1e9e74', points: [65, 69, 72, 70, 73, financialAvg] },
    { name: 'Kund', color: '#4b7bb8', points: [70, 72, 75, 73, 76, customerAvg] },
    { name: 'Processer', color: '#d99026', points: [80, 82, 85, 84, 86, processAvg] },
    { name: 'Lärande', color: '#c45c82', points: [60, 65, 68, 66, 70, learningAvg] }
  ];

  return (
    <div className="space-y-8 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Balanced Scorecard - Strategisk Modell
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Övervaka och fördela företagets ambitioner över finansiella och icke-finansiella mätetal (KPI:er) i realtid.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => onAddKpi('financial')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600/85 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Ny BSC-KPI
          </button>
        </div>
      </div>

      {/* BSC AI Analysis */}
      <AiAnalysisCard type="bsc" kpis={kpis} />

      {/* Grid of the Four BSC Perspectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Finansiellt Perspektiv */}
        <div className="bg-white dark:bg-slate-900/75 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300/80 dark:hover:border-slate-700 transition duration-200">
          <div>
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-sm">💰 Finansiellt Perspektiv</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Aktieägarnas fokus</span>
                </div>
              </div>
              <span className="bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 text-xs px-2.5 py-1 rounded-full font-bold tabular-nums">
                Medel: {financialAvg}%
              </span>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
              Hur ser vi ut för aktieägarna? Syftar till att säkra långsiktig lönsamhet, CO₂-kostnadshantering och hållbart kassaflöde.
            </p>

            {/* List of relative KPIs */}
            <div className="space-y-3">
              {financialKpis.map(k => (
                <div key={k.id} className="p-3 bg-slate-50/80 dark:bg-slate-800/45 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs transition hover:bg-slate-100/60 dark:hover:bg-slate-800/70">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{k.title}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">{k.value}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Mål: {k.target}</span>
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600/75 dark:bg-emerald-500/75 h-full rounded-full" style={{ width: `${k.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {financialKpis.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Inga finansiella KPI:er tillagda ännu.</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => onAddKpi('financial')}
            className="mt-5 w-full text-center py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            + Lägg till mätetal
          </button>
        </div>

        {/* Card 2: Kundperspektiv */}
        <div className="bg-white dark:bg-slate-900/75 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300/80 dark:hover:border-slate-700 transition duration-200">
          <div>
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-50/80 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-sm">🤝 Kundperspektiv</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Kundens värdedrivare</span>
                </div>
              </div>
              <span className="bg-sky-50/80 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40 text-xs px-2.5 py-1 rounded-full font-bold tabular-nums">
                Medel: {customerAvg}%
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
              Hur ser kunderna oss? Fokuserar på kundnöjdhet, NPS, varumärkeslojalitet och ökade gröna mervärden.
            </p>

            <div className="space-y-3">
              {customerKpis.map(k => (
                <div key={k.id} className="p-3 bg-slate-50/80 dark:bg-slate-800/45 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs transition hover:bg-slate-100/60 dark:hover:bg-slate-800/70">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{k.title}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">{k.value}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Mål: {k.target}</span>
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-600/75 dark:bg-sky-500/75 h-full rounded-full" style={{ width: `${k.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {customerKpis.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Inga kund-KPI:er tillagda ännu.</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => onAddKpi('customer')}
            className="mt-5 w-full text-center py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            + Lägg till mätetal
          </button>
        </div>

        {/* Card 3: Interna processer */}
        <div className="bg-white dark:bg-slate-900/75 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300/80 dark:hover:border-slate-700 transition duration-200">
          <div>
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-sm">⚙️ Interna processer</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Operativ excellens</span>
                </div>
              </div>
              <span className="bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 text-xs px-2.5 py-1 rounded-full font-bold tabular-nums">
                Medel: {processAvg}%
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
              Vad måste vi excellera i internt? Hanterar produktivitet, kvalitetscykler, logistik och resurseffektivitet.
            </p>

            <div className="space-y-3">
              {processKpis.map(k => (
                <div key={k.id} className="p-3 bg-slate-50/80 dark:bg-slate-800/45 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs transition hover:bg-slate-100/60 dark:hover:bg-slate-800/70">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{k.title}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">{k.value}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Mål: {k.target}</span>
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-600/75 dark:bg-amber-500/75 h-full rounded-full" style={{ width: `${k.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {processKpis.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Inga interna process-KPI:er tillagda ännu.</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => onAddKpi('process')}
            className="mt-5 w-full text-center py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            + Lägg till mätetal
          </button>
        </div>

        {/* Card 4: Lärande & Utveckling */}
        <div className="bg-white dark:bg-slate-900/75 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300/80 dark:hover:border-slate-700 transition duration-200">
          <div>
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-sm">📚 Lärande & Utveckling</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Kreativitet & Kompetens</span>
                </div>
              </div>
              <span className="bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 text-xs px-2.5 py-1 rounded-full font-bold tabular-nums">
                Medel: {learningAvg}%
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
              Hur bibehåller och utvecklar vi kompetens? Innefattar medarbetarutbildning, kulturförbättringar och innovationskraft.
            </p>

            <div className="space-y-3">
              {learningKpis.map(k => (
                <div key={k.id} className="p-3 bg-slate-50/80 dark:bg-slate-800/45 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs transition hover:bg-slate-100/60 dark:hover:bg-slate-800/70">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{k.title}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">{k.value}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Mål: {k.target}</span>
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500/75 dark:bg-rose-400/75 h-full rounded-full" style={{ width: `${k.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {learningKpis.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Inga lärande-KPI:er tillagda ännu.</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => onAddKpi('learning')}
            className="mt-5 w-full text-center py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            + Lägg till mätetal
          </button>
        </div>

      </div>

      {/* Bespoke Interactive SVG Dashboard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Chart A: Perspective Comparison Bar Chart */}
        <div className="bg-white dark:bg-slate-900/75 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-left select-none">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Jämförelse mellan Perspektiv (%)
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase font-semibold">Aktuellt medelvärde</span>
          </div>

          <div className="relative w-full h-64 flex justify-center items-center">
            {/* Custom SVG Bar Chart */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              {/* Grid Lines */}
              <g className="text-slate-200/80 dark:text-slate-800">
                <line x1="40" y1="20" x2="380" y2="20" stroke="currentColor" strokeWidth="1" />
                <line x1="40" y1="60" x2="380" y2="60" stroke="currentColor" strokeWidth="1" />
                <line x1="40" y1="100" x2="380" y2="100" stroke="currentColor" strokeWidth="1" />
                <line x1="40" y1="140" x2="380" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
              </g>
              <line x1="40" y1="180" x2="380" y2="180" className="text-slate-300 dark:text-slate-700" stroke="currentColor" strokeWidth="1.5" />

              {/* Y Axis Labels */}
              <text x="32" y="24" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono text-right" textAnchor="end">100%</text>
              <text x="32" y="64" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono text-right" textAnchor="end">75%</text>
              <text x="32" y="104" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono text-right" textAnchor="end">50%</text>
              <text x="32" y="144" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono text-right" textAnchor="end">25%</text>
              <text x="32" y="184" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono text-right" textAnchor="end">0%</text>

              {/* Four Bars */}
              {[
                { name: 'Finans', val: financialAvg, color: '#1e9e74', labelColor: 'fill-emerald-700 dark:fill-emerald-300' },
                { name: 'Kund', val: customerAvg, color: '#4b7bb8', labelColor: 'fill-sky-700 dark:fill-sky-300' },
                { name: 'Processer', val: processAvg, color: '#d99026', labelColor: 'fill-amber-700 dark:fill-amber-300' },
                { name: 'Lärande', val: learningAvg, color: '#c45c82', labelColor: 'fill-rose-700 dark:fill-rose-300' }
              ].map((bar, i) => {
                const x = 70 + i * 80;
                // Height calculations mapping 0-100% to Y space from 180 (0%) down to 20 (100%), so height scale is 1.6
                const barHeight = bar.val * 1.6;
                const y = 180 - barHeight;

                return (
                  <g key={bar.name} onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                    {/* Hover highlights background column */}
                    <rect 
                      x={x - 15} 
                      y="15" 
                      width="60" 
                      height="165" 
                      className={`transition-all duration-150 ${hoveredBar === i ? 'fill-slate-900/5 dark:fill-slate-100/5' : 'fill-transparent'}`}
                      rx="8"
                    />

                    {/* The bar itself */}
                    <motion.rect
                      x={x}
                      y={y}
                      width="30"
                      height={barHeight}
                      fill={bar.color}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      className="origin-bottom cursor-pointer hover:opacity-90 transition-opacity"
                      rx="4"
                    />

                    {/* Text values */}
                    <text 
                      x={x + 15} 
                      y={y - 8} 
                      className={`text-[10px] font-bold font-mono text-center ${bar.labelColor}`}
                      textAnchor="middle"
                    >
                      {bar.val}%
                    </text>

                    {/* Bottom label */}
                    <text 
                      x={x + 15} 
                      y="198" 
                      className="text-[9px] font-bold fill-slate-500 dark:fill-slate-400" 
                      textAnchor="middle"
                    >
                      {bar.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Chart B: Progress Trend line Chart */}
        <div className="bg-white dark:bg-slate-900/75 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Historisk utveckling (6 mån)
            </h4>
            {/* Color-coded Legend */}
            <div className="flex flex-wrap gap-2 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1e9e74] inline-block"></span>Finans</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4b7bb8] inline-block"></span>Kund</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#d99026] inline-block"></span>Processer</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c45c82] inline-block"></span>Lärande</span>
            </div>
          </div>

          <div className="relative w-full h-64 flex justify-center items-center">
            {/* Custom SVG Line Chart */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              {/* Backing Grid */}
              <g className="text-slate-200/80 dark:text-slate-800">
                <line x1="40" y1="20" x2="380" y2="20" stroke="currentColor" strokeWidth="1" />
                <line x1="40" y1="60" x2="380" y2="60" stroke="currentColor" strokeWidth="0.8" />
                <line x1="40" y1="100" x2="380" y2="100" stroke="currentColor" strokeWidth="0.8" />
                <line x1="40" y1="140" x2="380" y2="140" stroke="currentColor" strokeWidth="0.8" />
              </g>
              <line x1="40" y1="180" x2="380" y2="180" className="text-slate-300 dark:text-slate-700" stroke="currentColor" strokeWidth="1.2" />

              {/* Months vertical grid lines */}
              {months.map((m, idx) => {
                const x = 50 + idx * 62;
                return (
                  <g key={m}>
                    <line x1={x} y1="20" x2={x} y2="180" className="text-slate-200/70 dark:text-slate-800" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
                    <text x={x} y="196" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-bold" textAnchor="middle">{m}</text>
                  </g>
                );
              })}

              {/* Y Axis Labels */}
              <text x="32" y="24" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono text-right" textAnchor="end">100%</text>
              <text x="32" y="104" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono text-right" textAnchor="end">50%</text>
              <text x="32" y="184" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono text-right" textAnchor="end">0%</text>

              {/* Draw Trend Lines */}
              {trends.map((trend, tIdx) => {
                // Generate path string
                const points = trend.points.map((pt, pIdx) => {
                  const x = 50 + pIdx * 62;
                  const y = 180 - pt * 1.6;
                  return { x, y, pt };
                });

                const pathString = points.reduce((acc, p, idx) => {
                  return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
                }, '');

                return (
                  <g key={trend.name}>
                    {/* The continuous line */}
                    <motion.path
                      d={pathString}
                      fill="none"
                      stroke={trend.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: tIdx * 0.15 }}
                    />

                    {/* Nodes representing months */}
                    {points.map((p, pIdx) => (
                      <circle
                        key={pIdx}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="currentColor"
                        stroke={trend.color}
                        strokeWidth="2"
                        className="cursor-pointer transition-all text-white dark:text-slate-900"
                        onMouseEnter={() => setHoveredPoint({ perspectiveIndex: tIdx, monthIndex: pIdx })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </g>
                );
              })}

              {/* Hover Tooltip display inside the SVG */}
              {hoveredPoint && (
                <g>
                  {(() => {
                    const t = trends[hoveredPoint.perspectiveIndex];
                    const val = t.points[hoveredPoint.monthIndex];
                    const x = 50 + hoveredPoint.monthIndex * 62;
                    const y = 180 - val * 1.6;
                    
                    return (
                      <g className="pointer-events-none">
                        <rect 
                          x={x - 45} 
                          y={y - 32} 
                          width="90" 
                          height="23" 
                          className="fill-slate-800 dark:fill-slate-700" 
                          rx="4" 
                        />
                        <text 
                          x={x} 
                          y={y - 18} 
                          className="text-[9px] fill-white font-semibold font-sans text-center" 
                          textAnchor="middle"
                        >
                          {t.name}: {val}%
                        </text>
                        <polygon 
                          points={`${x - 4},${y - 9} ${x + 4},${y - 9} ${x},${y - 5}`} 
                          className="fill-slate-800 dark:fill-slate-700" 
                        />
                      </g>
                    );
                  })()}
                </g>
              )}
            </svg>
          </div>
        </div>

      </div>

      {/* Info footer on BSC system */}
      <div className="p-4 bg-slate-50/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Vad är syftet med Balanced Scorecard?</p>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Metoden utvecklades av Kaplan &amp; Norton för att säkerställa att chefer inte enbart blickar på kortsiktiga ekonomiska siffror (💰 Finansiellt). Genom att balansera med Kundnöjdhet (🤝), interna Processer (⚙️) och kontinuerligt Lärande &amp; Innovation (📚) bygger företaget en långsiktigt hållbar framtid och sund kultur.
          </p>
        </div>
      </div>

    </div>
  );
}
