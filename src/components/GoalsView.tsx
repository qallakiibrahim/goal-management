/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Target, 
  Search, 
  Trash2, 
  Edit, 
  Plus, 
  Calendar, 
  TrendingUp, 
  BarChart2, 
  Compass, 
  SlidersHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, GoalCategory } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface GoalsViewProps {
  goals: Goal[];
  onOpenAddModal: () => void;
  onOpenEditModal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalProgress: (id: string, progress: number) => void;
}

export default function GoalsView({
  goals,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteGoal,
  onUpdateGoalProgress
}: GoalsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Alla Perspektiv', className: 'bg-zinc-100 text-zinc-700' },
    { id: 'financial', name: '💰 Finansiellt', className: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
    { id: 'customer', name: '🤝 Kund', className: 'bg-blue-50 text-blue-800 border-blue-100' },
    { id: 'process', name: '⚙️ Processer', className: 'bg-amber-50 text-amber-800 border-amber-100' },
    { id: 'learning', name: '📚 Lärande', className: 'bg-pink-50 text-pink-800 border-pink-100' },
  ];

  // Filter goals
  const filteredGoals = goals.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.kpi.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryTheme = (category: GoalCategory) => {
    switch (category) {
      case 'financial':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', bar: 'bg-emerald-500' };
      case 'customer':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500', bar: 'bg-blue-500' };
      case 'process':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', bar: 'bg-amber-500' };
      case 'learning':
        return { bg: 'bg-pink-50 text-pink-700 border-pink-100', dot: 'bg-pink-500', bar: 'bg-pink-500' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-100', dot: 'bg-slate-500', bar: 'bg-indigo-900' };
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
            Målnivå - Målvisioner (Goals)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Beskriver företagets långsiktiga ambitioner och de mätbara framgångsfaktorer som styr verksamheten.
          </p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Nytt Strategiskt Mål
        </button>
      </div>

      {/* Goals AI Analysis */}
      <AiAnalysisCard type="goals" goals={goals} />

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sök efter mål, mätetal eller beskrivningar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 transition"
          />
        </div>

        {/* Category Switch Filters */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-900 text-white border-indigo-950'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredGoals.map((g) => {
            const theme = getCategoryTheme(g.category);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={g.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300/80 p-5 flex flex-col justify-between transition duration-200 group"
              >
                {/* Card Title Header */}
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${theme.bg}`}>
                      {g.category === 'financial' && '💰 Finansiellt'}
                      {g.category === 'customer' && '🤝 Kund'}
                      {g.category === 'process' && '⚙️ Processer'}
                      {g.category === 'learning' && '📚 Lärande'}
                    </span>
                    
                    <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition duration-150">
                      <button
                        onClick={() => onOpenEditModal(g)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-900 transition"
                        title="Redigera"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if(confirm(`Är du säker på att du vill ta bort målet "${g.title}"?`)) {
                            onDeleteGoal(g.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-650 transition"
                        title="Ta bort"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-800 font-display tracking-tight text-left">
                    {g.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-2 text-left line-clamp-3">
                    {g.description}
                  </p>
                </div>

                {/* Sub info */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                  {/* KPI metric */}
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Strategiskt mätetal:</span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg truncate">
                      {g.kpi}
                    </span>
                  </div>

                  {/* Progress adjusting block */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Måluppfyllelse:</span>
                      <span className="font-mono text-indigo-950 font-bold">{g.progress}%</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={g.progress}
                        onChange={(e) => onUpdateGoalProgress(g.id, parseInt(e.target.value))}
                        className="focus:outline-hiddenAccent-indigo-800 flex-1 accent-indigo-900 h-1 bg-slate-150 rounded-full cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Deadline info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Deadline: {g.deadline}
                    </span>
                    <span className="text-slate-300 font-mono">ID: {g.id}</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredGoals.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 text-sm">Hittade inga mål</h4>
            <p className="text-xs text-slate-400 mt-1">Ändra dina sökord eller klicka på "Nytt Strategiskt Mål" för att skapa ett.</p>
          </div>
        )}
      </div>

    </div>
  );
}
