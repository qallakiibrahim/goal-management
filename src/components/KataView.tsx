/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  RefreshCw, 
  Trash2, 
  Edit, 
  Plus, 
  Calendar, 
  Target, 
  Search, 
  ArrowRight, 
  HelpCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KataSession } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface KataViewProps {
  kataSessions: KataSession[];
  onOpenAddModal: () => void;
  onOpenEditModal: (session: KataSession) => void;
  onDeleteSession: (id: string) => void;
  onUpdateSessionProgress: (id: string, progress: number) => void;
}

export default function KataView({
  kataSessions,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteSession,
  onUpdateSessionProgress
}: KataViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = kataSessions.filter(s => {
    return s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.goal.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
            Toyota Kata - Coaching & Experimentation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Genomför strukturerade experimentloops där vi ringar in hinder och testar små steg för att nå nästa önskade måltillstånd.
          </p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4 animate-spin-slow" /> Starta Kata Session
        </button>
      </div>

      {/* Kata AI Analysis */}
      <AiAnalysisCard type="kata" kataSessions={kataSessions} />

      {/* Filter and control */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sök efter experiment, hinder, eller sessionsnamn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Guide explaining the 5 Questions */}
      <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl shadow-xs border border-slate-800 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-1 border-r border-slate-800 pr-4 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-1 text-rose-500 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>KATA METOD</span>
          </div>
          <h4 className="text-xs font-bold font-display text-white mt-1">De 5 Coaching-frågorna:</h4>
          <p className="text-[10px] text-slate-400 leading-normal">
            Används av coachen vid varje avstämning för att stimulera vetenskapligt tänkande.
          </p>
        </div>
        <div className="md:col-span-4 flex flex-wrap gap-3 items-center justify-start text-[11px] text-slate-300">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/55 flex-1 min-w-[150px]">
            <span className="font-bold text-rose-400 block">1. Önskat tillstånd?</span>
            <span>Var vill vi vara på sikt?</span>
          </div>
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/55 flex-1 min-w-[150px]">
            <span className="font-bold text-rose-400 block">2. Nuvarande läge?</span>
            <span>Var befinner vi oss idag?</span>
          </div>
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/55 flex-1 min-w-[150px]">
            <span className="font-bold text-rose-400 block">3. Vilka är hindren?</span>
            <span>Vad stoppar oss nu?</span>
          </div>
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/55 flex-1 min-w-[150px]">
            <span className="font-bold text-rose-400 block">4. Nästa experiment?</span>
            <span>Vad provar vi nu direkt?</span>
          </div>
        </div>
      </div>

      {/* Sessions list */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredSessions.map((session) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 p-5 flex flex-col justify-between transition group"
            >
              {/* Header inside the Session */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold font-display text-slate-800 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-rose-600 animate-spin-slow" /> {session.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Registrerat datum: {session.date}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100/50">
                    KATA-SESSION
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => onOpenEditModal(session)}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-900 transition"
                      title="Redigera session"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Är du säker på att du vill ta bort Kata-sessionen för "${session.title}"?`)) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 rounded text-slate-500 hover:text-red-650 transition"
                      title="Ta bort session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* The Toyota Kata steps displayed as sequential visual cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Step 1 */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide block mb-1">
                    🎯 ÖNSKAT TILLSTÅND
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                    {session.goal}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3 bg-teal-50/50 border border-teal-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wide block mb-1">
                    🔍 NU-TILLSTÅND
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {session.current}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3 bg-amber-50/50 border border-amber-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide block mb-1">
                    🚧 HINDER ATT LÖSA
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {session.obstacles}
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3 bg-rose-50/50 border border-rose-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wide block mb-1">
                    🧪 NÄSTA EXPERIMENT
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                    {session.nextStep}
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide block mb-1">
                    📊 LÄRDOMAR
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed italic">
                    {session.learnings}
                  </p>
                </div>
              </div>

              {/* Progress Slider on each Kata session */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 text-left">
                <div className="flex-grow max-w-md space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Milstolpsuppfyllelse i testet:</span>
                    <span className="font-mono text-indigo-950 font-bold">{session.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={session.progress}
                    onChange={(e) => onUpdateSessionProgress(session.id, parseInt(e.target.value))}
                    className="accent-rose-600 h-1 bg-slate-150 rounded-full cursor-pointer w-full"
                  />
                </div>

                <div className="text-[10px] text-slate-400 font-semibold font-mono self-end md:self-auto mt-2 md:mt-0">
                  SESSION-ID: {session.id}
                </div>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSessions.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 text-sm">Hittade inga Kata-sessioner</h4>
            <p className="text-xs text-slate-400 mt-1">Skapa en ny session för att påbörja coaching-loopen.</p>
          </div>
        )}
      </div>

    </div>
  );
}
