/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Activity, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KPI, GoalCategory } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface KpisViewProps {
  kpis: KPI[];
  onOpenAddModal: () => void;
  onOpenEditModal: (kpi: KPI) => void;
  onDeleteKpi: (id: string, title?: string) => void;
  onUpdateKpiProgress: (id: string, progress: number) => void;
}

export default function KpisView({
  kpis,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteKpi,
  onUpdateKpiProgress
}: KpisViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter lists
  const filteredKpis = kpis.filter(k => {
    return k.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getCategoryColor = (category?: GoalCategory) => {
    switch (category) {
      case 'financial': return 'bg-emerald-50/80 dark:bg-emerald-950/35 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40';
      case 'customer': return 'bg-sky-50/80 dark:bg-sky-950/35 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/40';
      case 'process': return 'bg-amber-50/80 dark:bg-amber-950/35 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40';
      case 'learning': return 'bg-rose-50/80 dark:bg-rose-950/35 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/40';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Mätetalsnivå - Detaljerade KPI:er
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kvantitativa nyckeltal för löpande benchmarking, målstyrning och utvärdering av strategiska framsteg.
          </p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600/85 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap self-stretch md:self-auto justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Lägg till KPI
        </button>
      </div>

      {/* KPIs AI Analysis */}
      <AiAnalysisCard type="kpis" kpis={kpis} />

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sök efter mätetal eller KPI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-slate-400 dark:focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredKpis.map((k) => {
            const isHighProgress = k.progress >= 75;
            const isLowProgress = k.progress < 40;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={k.id}
                className="bg-white dark:bg-slate-900/75 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300/80 dark:hover:border-slate-700 p-5 flex flex-col justify-between transition duration-200 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold rounded-full border ${getCategoryColor(k.category)}`}>
                      {k.category || 'Mätetal'}
                    </span>
                    
                    <div className="flex gap-1.5 opacity-65 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onOpenEditModal(k)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-indigo-400 transition cursor-pointer"
                        title="Redigera"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteKpi(k.id, k.title)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                        title="Ta bort"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold font-display text-slate-800 dark:text-slate-100 text-left line-clamp-2">
                    {k.title}
                  </h3>

                  {/* Absolute numerical metrics */}
                  <div className="mt-4 p-3 bg-slate-50/80 dark:bg-slate-800/45 border border-slate-200/60 dark:border-slate-700/80 rounded-xl flex items-center justify-between text-left">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase font-mono">Aktuellt:</span>
                      <span className="text-base font-bold font-display text-slate-800 dark:text-slate-100 tabular-nums">{k.value}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase font-mono">Bör-värde:</span>
                      <span className="text-sm font-semibold font-display text-slate-600 dark:text-slate-300 tabular-nums">{k.target}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5">
                  {/* Performance Indicators Gauge info */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      <span>Måluppfyllelse:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-100 tabular-nums">{k.progress}%</span>
                    </div>
                    
                    {/* Live input range with stepper buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateKpiProgress(k.id, Math.max(0, k.progress - 10))}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono font-semibold transition cursor-pointer"
                        title="Minska med 10%"
                      >
                        -10%
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={k.progress}
                        onChange={(e) => onUpdateKpiProgress(k.id, parseInt(e.target.value))}
                        className="accent-emerald-600 dark:accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer flex-1"
                      />
                      <button
                        onClick={() => onUpdateKpiProgress(k.id, Math.min(100, k.progress + 10))}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono font-semibold transition cursor-pointer"
                        title="Öka med 10%"
                      >
                        +10%
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800 pt-3.5">
                    <span className="flex items-center gap-1">
                      {isHighProgress ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isLowProgress ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                      ) : (
                        <Activity className="w-3.5 h-3.5 text-slate-600 dark:text-indigo-400 shrink-0" />
                      )}
                      {k.deadline}
                    </span>
                    <span className="font-mono text-[10px] text-slate-300 dark:text-slate-600">ID: {k.id}</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredKpis.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900/75 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Hittade inga KPI:er</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm ? `Inga mätetal matchar "${searchTerm}".` : 'Det finns inga definierade mätetal i systemet.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Rensa sökning
                </button>
              ) : (
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-2 bg-slate-800 dark:bg-indigo-600/85 hover:bg-slate-900 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Skapa första KPI
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Aggregate KPI Chart comparative list */}
      {filteredKpis.length > 0 && (
        <div className="bg-white dark:bg-slate-900/75 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-left mt-8">
          <h3 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-5">
            Övergripande KPI Benchmarking-Index
          </h3>
          <div className="space-y-4">
            {filteredKpis.map(k => (
              <div key={k.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <span>{k.title}</span>
                  <span className="font-mono tabular-nums">{k.progress}% ({k.value} av {k.target})</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      k.progress >= 75 ? 'bg-emerald-600/80 dark:bg-emerald-500/75' : k.progress < 40 ? 'bg-amber-500/80 dark:bg-amber-400/75' : 'bg-slate-700 dark:bg-indigo-500/80'
                    }`}
                    style={{ width: `${k.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
