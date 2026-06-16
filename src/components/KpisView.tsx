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
  onDeleteKpi: (id: string) => void;
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
      case 'financial': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'customer': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'process': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'learning': return 'bg-pink-50 text-pink-700 border-pink-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
            Mätetalsnivå - Detaljerade KPI:er
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kvantitativa nyckeltal för löpande benchmarking, målstyrning och utvärdering av strategiska framsteg.
          </p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap self-stretch md:self-auto justify-center"
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
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 transition"
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
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md p-5 flex flex-col justify-between transition duration-200 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold rounded-full border ${getCategoryColor(k.category)}`}>
                      {k.category || 'Mätetal'}
                    </span>
                    
                    <div className="flex gap-1.5 opacity-65 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onOpenEditModal(k)}
                        className="p-1.5 hover:bg-slate-150 rounded text-slate-500 hover:text-indigo-900 transition"
                        title="Redigera"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Är du säker på att du vill radera mätetalet "${k.title}"?`)) {
                            onDeleteKpi(k.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-650 transition"
                        title="Ta bort"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold font-display text-slate-800 text-left line-clamp-2">
                    {k.title}
                  </h3>

                  {/* Absolute numerical metrics */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-left">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Aktuellt:</span>
                      <span className="text-base font-bold font-display text-slate-800">{k.value}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Bör-värde:</span>
                      <span className="text-sm font-semibold font-display text-slate-600">{k.target}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5">
                  {/* Performance Indicators Gauge info */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>Måluppfyllelse:</span>
                      <span className="font-mono">{k.progress}%</span>
                    </div>
                    
                    {/* Live input range */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={k.progress}
                      onChange={(e) => onUpdateKpiProgress(k.id, parseInt(e.target.value))}
                      className="accent-emerald-600 h-1 bg-slate-150 rounded-full cursor-pointer w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-t border-slate-100 pt-3.5">
                    <span className="flex items-center gap-1">
                      {isHighProgress ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : isLowProgress ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <Activity className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                      )}
                      {k.deadline}
                    </span>
                    <span className="font-mono text-[10px] text-slate-300">ID: {k.id}</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredKpis.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 text-sm">Hittade inga KPI:er</h4>
            <p className="text-xs text-slate-400 mt-1">Sök på något annat eller skapa en ny KPI.</p>
          </div>
        )}
      </div>

      {/* Aggregate KPI Chart comparative list */}
      {filteredKpis.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-left mt-8">
          <h3 className="font-display font-semibold text-xs text-slate-800 uppercase tracking-wider mb-5">
            Övergripande KPI Benchmarking-Index
          </h3>
          <div className="space-y-4">
            {filteredKpis.map(k => (
              <div key={k.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{k.title}</span>
                  <span className="font-mono">{k.progress}% ({k.value} av {k.target})</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      k.progress >= 75 ? 'bg-emerald-500' : k.progress < 40 ? 'bg-amber-400' : 'bg-indigo-600'
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
