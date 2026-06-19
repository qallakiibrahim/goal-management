/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Target, 
  Flag, 
  Briefcase, 
  CheckSquare, 
  TrendingUp, 
  RefreshCw, 
  TrendingDown, 
  Plus, 
  ChevronRight, 
  ArrowRight, 
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, Objective, Project, Initiative, Task, KPI, KataSession } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface DashboardViewProps {
  goals: Goal[];
  objectives: Objective[];
  projects: Project[];
  initiatives: Initiative[];
  tasks: Task[];
  kpis: KPI[];
  kataSessions: KataSession[];
  onNavigateToView: (view: string) => void;
  onStartKata: () => void;
  onQuickAddKpi?: (kpi: KPI) => void;
  onQuickAddProject?: (proj: Project) => void;
  onQuickAddKata?: (session: KataSession) => void;
}

export default function DashboardView({
  goals,
  objectives,
  projects,
  initiatives,
  tasks,
  kpis,
  kataSessions,
  onNavigateToView,
  onStartKata,
  onQuickAddKpi,
  onQuickAddProject,
  onQuickAddKata
}: DashboardViewProps) {
  // Trace path state: users can select which Goal to expand
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    goals.length > 0 ? goals[0].id : ''
  );
  
  // Choose objective based on selected goal
  const availableObjectives = objectives.filter(o => o.goalId === selectedGoalId);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>(
    availableObjectives.length > 0 ? availableObjectives[0].id : ''
  );

  // If selectedGoalId changed, and the old objective doesn't fit, pick the first available
  const currentObjectives = objectives.filter(o => o.goalId === selectedGoalId);
  const activeObjective = currentObjectives.find(o => o.id === selectedObjectiveId) || currentObjectives[0];

  // Choose project based on selected objective or goal
  const availableProjects = projects.filter(p => {
    if (activeObjective) return p.objectiveId === activeObjective.id;
    return p.goalId === selectedGoalId;
  });
  const activeProject = availableProjects[0];

  // Choose initiative based on project
  const availableInitiatives = activeProject 
    ? initiatives.filter(i => i.projectId === activeProject.id)
    : [];
  const activeInitiative = availableInitiatives[0];

  // Choose tasks
  const activeTasks = activeProject 
    ? tasks.filter(t => t.projectId === activeProject.id)
    : [];

  // Calculate stats
  const activeGoalsCount = goals.length;
  const activeProjectsCount = projects.length;
  const avgKpiProgress = kpis.length > 0 
    ? Math.round(kpis.reduce((acc, kpi) => acc + kpi.progress, 0) / kpis.length)
    : 0;
  const kataSessionsCount = kataSessions.length;

  return (
    <div className="space-y-8 text-left">
      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-4 transition-all"
        >
          <div className="p-3 bg-indigo-50 text-indigo-900 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display tracking-tight text-slate-800">{activeGoalsCount}</div>
            <div className="text-xs text-slate-500 font-medium">Aktiva Målvisioner</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-4 transition-all"
        >
          <div className="p-3 bg-violet-50 text-violet-700 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display tracking-tight text-slate-800">{activeProjectsCount}</div>
            <div className="text-xs text-slate-500 font-medium">Pågående Projekt</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-4 transition-all"
        >
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display tracking-tight text-slate-800">{avgKpiProgress}%</div>
            <div className="text-xs text-slate-500 font-medium">KPI Uppfyllelsegrad</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-4 transition-all"
        >
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <RefreshCw className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display tracking-tight text-slate-800">{kataSessionsCount}</div>
            <div className="text-xs text-slate-500 font-medium">Kata Coaching Sessions</div>
          </div>
        </motion.div>
      </div>

      {/* AI Insights & Recommendations Module */}
      <AiAnalysisCard 
        type="dashboard" 
        goals={goals} 
        projects={projects} 
        kpis={kpis} 
        kataSessions={kataSessions} 
        onQuickAddKpi={onQuickAddKpi}
        onQuickAddProject={onQuickAddProject}
        onQuickAddKata={onQuickAddKata}
      />

      {/* Main Framework Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Column 1: Balanced Scorecard Mini View */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-slate-800 text-sm tracking-tight">
                Balanced Scorecard (BSC)
              </h3>
              <button 
                onClick={() => onNavigateToView('bsc')}
                className="text-xs text-indigo-700 font-medium hover:underline flex items-center gap-1"
              >
                Detaljer <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Strategisk fördelning över de fyra grundläggande perspektiven.
            </p>

            <div className="space-y-4">
              <div 
                onClick={() => onNavigateToView('goals')}
                className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/80 cursor-pointer hover:bg-emerald-50 transition"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span className="flex items-center gap-1.5">💰 Finansiellt</span>
                  <span>
                    {goals.filter(g => g.category === 'financial').length} Mål
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div 
                onClick={() => onNavigateToView('goals')}
                className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/80 cursor-pointer hover:bg-blue-50 transition"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
                  <span className="flex items-center gap-1.5">🤝 Kund</span>
                  <span>
                    {goals.filter(g => g.category === 'customer').length} Mål
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div 
                onClick={() => onNavigateToView('goals')}
                className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/80 cursor-pointer hover:bg-amber-50 transition"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span className="flex items-center gap-1.5">⚙️ Processer</span>
                  <span>
                    {goals.filter(g => g.category === 'process').length} Mål
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <div 
                onClick={() => onNavigateToView('goals')}
                className="p-3 bg-pink-50/50 rounded-xl border border-pink-100/80 cursor-pointer hover:bg-pink-50 transition"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-pink-800">
                  <span className="flex items-center gap-1.5">📚 Lärande</span>
                  <span>
                    {goals.filter(g => g.category === 'learning').length} Mål
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-indigo-700" />
              <span>ALIGNMENT STATUS</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Alla 5 hierarkiska steg synkroniseras nu automatiskt. Redigera noder via Redigeraren.
            </p>
          </div>
        </div>

        {/* Columns 2-4: Interactive Alignment Hierarchy Path Tree */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Interaktiv Målkedja (Strategy Alignment Tree)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Välj en strategisk målvision mätt ovan för att filtrera och visualisera kedjan hela vägen ner till de dagliga uppgifterna.
                </p>
              </div>
              <button 
                onClick={() => onNavigateToView('hierarchy-editor')}
                className="text-xs px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg text-indigo-700 font-semibold transition flex items-center gap-1 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:border-indigo-800/40 dark:text-indigo-300"
              >
                <Plus className="w-3.5 h-3.5" /> Skapa Nivå
              </button>
            </div>

            {/* Step 1: Goal Selection Card */}
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-900 dark:text-indigo-400" />
                <span>Steg 1: Goal (Målvision)</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGoalId(g.id);
                      const relativeObjectives = objectives.filter(o => o.goalId === g.id);
                      if (relativeObjectives.length > 0) {
                        setSelectedObjectiveId(relativeObjectives[0].id);
                      } else {
                        setSelectedObjectiveId('');
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      selectedGoalId === g.id
                        ? 'bg-indigo-900 text-white shadow-xs dark:bg-indigo-600 dark:text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700/80 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {g.title}
                  </button>
                ))}
              </div>

              {/* Dynamic Strategy Map Visual blocks */}
              <div className="space-y-3.5 border-l-2 border-slate-100 dark:border-slate-800/70 pl-4 ml-2.5 mt-2">
                
                {/* Visual block showing active goal */}
                {goals.find(g => g.id === selectedGoalId) && (
                  <div className="bg-indigo-900 dark:bg-indigo-950/50 dark:border dark:border-indigo-800/40 text-white p-3 rounded-xl">
                    <div className="flex justify-between items-start text-xs">
                      <span className="font-bold flex items-center gap-1 text-white dark:text-indigo-200">
                        <Target className="w-3 h-3 text-amber-400" />
                        {goals.find(g => g.id === selectedGoalId)?.title}
                      </span>
                      <span className="bg-white/20 dark:bg-indigo-900/60 px-2 py-0.5 rounded font-bold font-mono text-white dark:text-indigo-250">
                        {goals.find(g => g.id === selectedGoalId)?.progress}%
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-100 dark:text-indigo-300 mt-1">
                      {goals.find(g => g.id === selectedGoalId)?.description}
                    </p>
                    <div className="text-[10px] text-amber-200 dark:text-amber-400 mt-1 font-mono">
                      Mål-KPI: {goals.find(g => g.id === selectedGoalId)?.kpi}
                    </div>
                  </div>
                )}

                {/* Step 2: Goal -> Objective */}
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 pt-1">
                  <Flag className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span>Steg 2: Objective (Målsättning)</span>
                </div>
                
                {currentObjectives.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {currentObjectives.map(obj => (
                      <div 
                        key={obj.id} 
                        onClick={() => setSelectedObjectiveId(obj.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          activeObjective?.id === obj.id
                            ? 'bg-indigo-50 border-indigo-200 text-slate-800 dark:bg-indigo-950/40 dark:border-indigo-850/80 dark:text-slate-100'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-100 text-slate-600 dark:bg-slate-800/40 dark:hover:bg-slate-700/60 dark:border-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                            <Flag className="w-3 h-3 text-indigo-900 dark:text-indigo-400" />
                            {obj.title}
                          </span>
                          <span className="font-mono bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm dark:text-slate-300Shared">
                            {obj.progress}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1">
                          {obj.description}
                        </p>
                        <div className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-1.5 font-mono">
                          Mätetal: {obj.kpi}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                    Inga tillagda målsättningar för detta mål. Skapa en i Redigeraren!
                  </p>
                )}

                {/* Step 3: Objective -> Project */}
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 pt-2">
                  <Briefcase className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span>Steg 3: Projects (Projekt)</span>
                </div>

                {activeProject ? (
                  <div className="p-3 bg-violet-50/50 border border-violet-100 dark:bg-purple-950/20 dark:border-purple-900/40 rounded-xl text-left">
                    <div className="flex justify-between items-center text-xs font-semibold text-violet-900 dark:text-purple-300">
                      <span className="flex items-center gap-1 font-bold">
                        <Briefcase className="w-3 h-3 text-violet-700 dark:text-purple-400" />
                        {activeProject.title}
                      </span>
                      <span className="bg-violet-100 dark:bg-purple-900/45 font-mono text-violet-700 dark:text-purple-300 px-1.5 py-0.5 rounded-sm">
                        {activeProject.progress}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {activeProject.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                    Inga projekt direkt kopplade till den valda målsättningen.
                  </p>
                )}

                {/* Step 4: Project -> Initiative & Step 5: Tasks */}
                {activeProject && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                    {/* Initiative section */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Steg 4: Initiatives
                      </div>
                      {activeInitiative ? (
                        <div className="p-2.5 bg-blue-50/60 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40 rounded-xl text-left">
                          <h4 className="text-[11px] font-bold text-blue-900 dark:text-blue-300 leading-tight">
                            {activeInitiative.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                            {activeInitiative.description}
                          </p>
                          <div className="mt-1.5 text-[9px] text-blue-800 dark:text-blue-300 font-mono bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded inline-block">
                            Mätval: {activeInitiative.kpi}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/40 dark:border dark:border-slate-800/30 rounded-lg text-[10px] text-slate-400 dark:text-slate-500 italic">
                          Inga specifika initiativ definierade.
                        </div>
                      )}
                    </div>

                    {/* Operational Tasks list */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Steg 5: Tasks (Kopplade Uppgifter)
                      </div>
                      {activeTasks.length > 0 ? (
                        <div className="space-y-1">
                          {activeTasks.map(t => (
                            <div 
                              key={t.id}
                              className="flex items-start gap-1.5 text-[10px] p-1.5 bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-850 rounded-lg"
                            >
                              <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${t.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-650'}`} />
                              <div className="leading-tight">
                                <p className={`font-medium ${t.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                  {t.title}
                                </p>
                                {t.kpi && t.completed && (
                                  <span className="text-[8px] text-emerald-700 dark:text-emerald-400 font-mono">
                                    ✓ {t.kpi}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/40 dark:border dark:border-slate-800/30 rounded-lg text-[10px] text-slate-400 dark:text-slate-500 italic">
                          Inga uppgifter i detta projekt.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100/80 dark:border-slate-800 pt-4 mt-6 text-xs text-slate-500 flex justify-between items-center">
            <span>Filter aktivt: Visar kedjan baserat på <strong>{goals.find(g => g.id === selectedGoalId)?.title}</strong></span>
            <button 
              onClick={() => onNavigateToView('projects')}
              className="text-indigo-900 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              Till Projektlista <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 4: Kata Coaching Loop Panel */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl flex flex-col justify-between shadow-xs border border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-rose-500 animate-spin-slow" />
                <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">
                  Kata Coaching Loop
                </h3>
              </div>
              <span className="text-[10px] bg-rose-50 dark:bg-rose-950/45 text-rose-600 dark:text-rose-450 border border-rose-100/60 dark:border-rose-900/40 px-2 py-0.5 rounded font-bold font-mono">
                Toyota model
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed mb-4">
              Vår inbyggda förändringsloop som löser utmaningar experimentellt genom regelbundna avstämningar.
            </p>

            {/* List of Kata coaching questions */}
            <div className="space-y-3">
              <div className="text-[11px] p-2.5 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/60 dark:border-rose-900/30 rounded-xl">
                <span className="text-rose-600 dark:text-rose-450 font-bold block mb-0.5">1. MÅLTILLSTÅND 🎯</span>
                <p className="text-slate-500 dark:text-slate-405 text-[10px] italic">"Vart vill vi ta oss på sikt?"</p>
                {kataSessions.length > 0 && (
                  <p className="text-slate-800 dark:text-slate-200 text-[10px] font-semibold mt-1 line-clamp-1">
                    {kataSessions[0].goal}
                  </p>
                )}
              </div>

              <div className="text-[11px] p-2.5 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/60 dark:border-rose-900/30 rounded-xl">
                <span className="text-rose-600 dark:text-rose-450 font-bold block mb-0.5">2. NU-TILLSTÅND 🔍</span>
                <p className="text-slate-500 dark:text-slate-405 text-[10px] italic">"Var befinner vi oss just nu?"</p>
                {kataSessions.length > 0 && (
                  <p className="text-slate-800 dark:text-slate-200 text-[10px] font-semibold mt-1 line-clamp-1">
                    {kataSessions[0].current}
                  </p>
                )}
              </div>

              <div className="text-[11px] p-2.5 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/60 dark:border-rose-900/30 rounded-xl">
                <span className="text-rose-600 dark:text-rose-450 font-bold block mb-0.5">3. HINDER & TESTER 🧪</span>
                <p className="text-slate-500 dark:text-slate-405 text-[10px] italic">"Vilka är hindren & vad testar vi?"</p>
                {kataSessions.length > 0 && (
                  <p className="text-slate-800 dark:text-slate-200 text-[10px] font-semibold mt-1 line-clamp-1">
                    Experiment: {kataSessions[0].nextStep}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={onStartKata}
              className="w-full text-center text-xs py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Starta Aktiv Kata
            </button>
            <button
              onClick={() => onNavigateToView('kata')}
              className="w-full text-center text-xs py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-medium transition cursor-pointer dark:bg-slate-800/60 dark:hover:bg-slate-705 dark:border-slate-700 dark:text-slate-300"
            >
              Se sessionhistorik ({kataSessionsCount})
            </button>
          </div>
        </div>

      </div>

      {/* Action Guidance info banner */}
      <div className="p-4 bg-slate-100 hover:bg-slate-200/50 border border-slate-200 rounded-2xl flex items-center justify-between gap-5 transition-all text-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-indigo-900 rounded-xl shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-950" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-slate-800 text-xs">Är du ny med detta digitala ramverk?</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              MålRamverket synkar företagets strategiska visioner direkt med projekten. Kontrollera dina personliga preferenser under <strong>Inställningar</strong> för att matcha företagets terminologi.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateToView('hierarchy-editor')}
          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-semibold rounded-xl tracking-tight transition whitespace-nowrap"
        >
          Konfigurera min struktur
        </button>
      </div>

    </div>
  );
}
