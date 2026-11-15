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
  Plus, 
  ChevronRight, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  Activity,
  Workflow,
  Grid3x3,
  DollarSign,
  Users,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { Goal, Objective, Project, Initiative, Task, KPI, KataSession, UserProfile, MatrixRelation, Member } from '../types';
import AiAnalysisCard from './AiAnalysisCard';
import { computeXMatrixGaps } from '../utils/xMatrixHelpers';

interface DashboardViewProps {
  goals: Goal[];
  objectives: Objective[];
  projects: Project[];
  initiatives: Initiative[];
  tasks: Task[];
  kpis: KPI[];
  kataSessions: KataSession[];
  userProfile?: UserProfile;
  onNavigateToView: (view: string) => void;
  onStartKata: () => void;
  onQuickAddKpi?: (kpi: KPI) => void;
  onQuickAddProject?: (proj: Project) => void;
  onQuickAddKata?: (session: KataSession) => void;
  onDownloadPdf?: () => void;
  onExportCsv?: () => void;
  onOpenVoiceCoach?: () => void;
  matrixRelations?: MatrixRelation[];
  members?: Member[];
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
  onQuickAddKata,
  matrixRelations = [],
  members = []
}: DashboardViewProps) {
  const getCategoryStats = (category: Goal['category']) => {
    const catGoals = goals.filter(g => g.category === category);
    const catKpis = kpis.filter(k => k.category === category);
    const progress = catKpis.length > 0
      ? Math.round(catKpis.reduce((acc, k) => acc + k.progress, 0) / catKpis.length)
      : catGoals.length > 0
        ? Math.round(catGoals.reduce((acc, g) => acc + g.progress, 0) / catGoals.length)
        : 0;
    return { count: catGoals.length, progress };
  };

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
  const xMatrixGaps = computeXMatrixGaps({
    goals,
    objectives,
    projects,
    initiatives,
    kpis,
    relations: matrixRelations,
    members
  });
  const activeMatrixLinksCount = matrixRelations.filter(r => r.strength > 0).length;

  return (
    <div className="space-y-6 text-left">
      {/* Strategic Dashboard Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Strategisk Instrumentpanel
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Samlad lägesbild för organisationens målstyrning, projektportfölj och nyckeltal.
          </p>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium capitalize tabular-nums shrink-0">
          {new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ y: -2 }}
          onClick={() => onNavigateToView('goals')}
          className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl shadow-xs hover:shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all cursor-pointer group"
          title="Klicka för att granska alla mål"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 rounded-xl group-hover:scale-105 transition-transform shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">{activeGoalsCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
              <span>Aktiva Målvisioner</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          onClick={() => onNavigateToView('projects')}
          className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl shadow-xs hover:shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all cursor-pointer group"
          title="Klicka för att hantera projekt"
        >
          <div className="p-3 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 rounded-xl group-hover:scale-105 transition-transform shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">{activeProjectsCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors flex items-center gap-1">
              <span>Pågående Projekt</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          onClick={() => onNavigateToView('kpis')}
          className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl shadow-xs hover:shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all cursor-pointer group"
          title="Klicka för att granska KPI:er"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl group-hover:scale-105 transition-transform shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">{avgKpiProgress}%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>KPI-måluppfyllnad</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          onClick={() => onNavigateToView('kata')}
          className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl shadow-xs hover:shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all cursor-pointer group"
          title="Klicka för att öppna Toyota Kata coaching"
        >
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 rounded-xl group-hover:scale-105 transition-transform shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">{kataSessionsCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center gap-1">
              <span>Kata Coaching-cykler</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Navigation Strip: Process Map & Hoshin Kanri X-Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-xl shrink-0 border border-indigo-200/70 dark:border-indigo-800/60">
              <Workflow className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold font-display text-slate-900 dark:text-slate-100 truncate">
                Processkarta & Systemflöde
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                Se hur Kano/CTQ, VSM, Balanced Scorecard och Toyota Kata hänger ihop.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToView('process-map')}
            className="px-3.5 py-2 bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span>Öppna</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 rounded-xl shrink-0 border border-teal-200/70 dark:border-teal-800/60">
              <Grid3x3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold font-display text-slate-900 dark:text-slate-100 truncate">
                Hoshin Kanri X-Matris
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums line-clamp-2">
                {activeMatrixLinksCount} korskopplingar ·{' '}
                <span className={xMatrixGaps.length > 0 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                  {xMatrixGaps.length === 0 ? 'Full strategisk täckning' : `${xMatrixGaps.length} strategiska gap`}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToView('x-matrix')}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span>Öppna</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Framework Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Column 1: Strategic Perspectives Stack */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Balanced Scorecard Mini View */}
          <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                  Balanced Scorecard (BSC)
                </h3>
                <button 
                  onClick={() => onNavigateToView('bsc')}
                  className="text-xs text-indigo-700 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Detaljer <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-left">
                Strategisk fördelning och måluppfyllnad över de fyra perspektiven.
              </p>

              <div className="space-y-3">
                {(() => {
                  const fin = getCategoryStats('financial');
                  const cust = getCategoryStats('customer');
                  const proc = getCategoryStats('process');
                  const learn = getCategoryStats('learning');

                  return (
                    <>
                      <div 
                        onClick={() => onNavigateToView('goals')}
                        className="p-3 bg-emerald-50/50 dark:bg-emerald-950/15 rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/25 transition text-left"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 shrink-0" />
                            <span>Finansiellt</span>
                          </span>
                          <span className="tabular-nums font-mono text-[11px]">
                            {fin.count} Mål · {fin.progress}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${fin.progress}%` }}></div>
                        </div>
                      </div>

                      <div 
                        onClick={() => onNavigateToView('goals')}
                        className="p-3 bg-blue-50/50 dark:bg-blue-950/15 rounded-xl border border-blue-100/80 dark:border-blue-900/40 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/25 transition text-left"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-blue-800 dark:text-blue-300">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span>Kund</span>
                          </span>
                          <span className="tabular-nums font-mono text-[11px]">
                            {cust.count} Mål · {cust.progress}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${cust.progress}%` }}></div>
                        </div>
                      </div>

                      <div 
                        onClick={() => onNavigateToView('goals')}
                        className="p-3 bg-amber-50/50 dark:bg-amber-950/15 rounded-xl border border-amber-100/80 dark:border-amber-900/40 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/25 transition text-left"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <Settings className="w-3.5 h-3.5 shrink-0" />
                            <span>Processer</span>
                          </span>
                          <span className="tabular-nums font-mono text-[11px]">
                            {proc.count} Mål · {proc.progress}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${proc.progress}%` }}></div>
                        </div>
                      </div>

                      <div 
                        onClick={() => onNavigateToView('goals')}
                        className="p-3 bg-pink-50/50 dark:bg-pink-950/15 rounded-xl border border-pink-100/80 dark:border-pink-900/40 cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950/25 transition text-left"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-pink-800 dark:text-pink-300">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span>Lärande</span>
                          </span>
                          <span className="tabular-nums font-mono text-[11px]">
                            {learn.count} Mål · {learn.progress}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="bg-pink-500 h-full rounded-full transition-all duration-500" style={{ width: `${learn.progress}%` }}></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-left">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
                <span>Synkroniserad hierarki</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Alla 5 hierarkiska nivåer synkroniseras automatiskt med Redigeraren.
              </p>
            </div>
          </div>

          {/* Värdeflödesanalys (VSM) Mini Summary Dashboard Card */}
          <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                    Värdeflöden (VSM)
                  </h3>
                </div>
                <span className="text-[10px] bg-rose-50 dark:bg-rose-950/45 text-rose-600 dark:text-rose-400 font-semibold px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/40">
                  VSM-Takt
                </span>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-normal">
                Ledtidseffektivisering (PCE) genom eliminering av slöserier i verksamheten.
              </p>

              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl space-y-2.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block tracking-wider">Aktivt flöde</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {(() => {
                      try {
                        const local = localStorage.getItem('vsm_streams');
                        if (local) {
                          const s = JSON.parse(local);
                          if (s?.length > 0) return s[0].name;
                        }
                      } catch (e) {}
                      return 'Order till Leverans (Logistik)';
                    })()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold leading-none uppercase mb-1">Processteg</span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                      {(() => {
                        try {
                          const local = localStorage.getItem('vsm_streams');
                          if (local) {
                            const s = JSON.parse(local);
                            if (s?.length > 0) return s[0].steps.length;
                          }
                        } catch (e) {}
                        return 5;
                      })()} st
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold leading-none uppercase mb-1">Flödeseffektivitet</span>
                    <strong className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                      {(() => {
                        try {
                          const local = localStorage.getItem('vsm_streams');
                          if (local) {
                            const s = JSON.parse(local);
                            if (s?.length > 0) {
                              const stream = s[0];
                              let pt = 0, lt = 0;
                              stream.steps.forEach((st: any) => { pt += st.processTime; lt += Math.max(st.leadTime, st.processTime); });
                              return `${lt > 0 ? (pt/lt * 100).toFixed(1) : 0}%`;
                            }
                          }
                        } catch (e) {}
                        return '9.4%';
                      })()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => onNavigateToView('vsm')}
                className="w-full text-center py-2 bg-indigo-900 hover:bg-indigo-950 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Analysera Värdeflöde</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Columns 2-3: Interactive Alignment Hierarchy Path Tree */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Interaktiv Målkedja (Strategy Alignment Tree)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Välj en strategisk målvision för att spåra kedjan ner till dagliga uppgifter.
                </p>
              </div>
              <button 
                onClick={() => onNavigateToView('hierarchy-editor')}
                className="text-xs px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg text-indigo-700 font-semibold transition flex items-center gap-1 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:border-indigo-800/40 dark:text-indigo-300 cursor-pointer shrink-0 whitespace-nowrap"
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
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      selectedGoalId === g.id
                        ? 'bg-indigo-900 text-white shadow-xs dark:bg-indigo-600 dark:text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700/80 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {g.title}
                  </button>
                ))}
              </div>

              {/* Dynamic Strategy Map Visual blocks */}
              <div className="space-y-3.5 border-l-2 border-slate-200/70 dark:border-slate-800 pl-4 ml-2 mt-2">
                
                {/* Visual block showing active goal */}
                {goals.find(g => g.id === selectedGoalId) && (
                  <div className="bg-indigo-900 dark:bg-indigo-950/60 dark:border dark:border-indigo-800/50 text-white p-3.5 rounded-xl">
                    <div className="flex justify-between items-start gap-2 text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-white dark:text-indigo-100">
                        <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {goals.find(g => g.id === selectedGoalId)?.title}
                      </span>
                      <span className="bg-white/20 dark:bg-indigo-900/70 px-2 py-0.5 rounded font-bold font-mono text-white dark:text-indigo-200 tabular-nums shrink-0">
                        {goals.find(g => g.id === selectedGoalId)?.progress}%
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-100 dark:text-indigo-300 mt-1">
                      {goals.find(g => g.id === selectedGoalId)?.description}
                    </p>
                    <div className="text-[10px] text-amber-200 dark:text-amber-400 mt-1.5 font-mono">
                      Mål-KPI: {goals.find(g => g.id === selectedGoalId)?.kpi}
                    </div>
                  </div>
                )}

                {/* Step 2: Goal -> Objective */}
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pt-1">
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
                            ? 'bg-indigo-50/80 border-indigo-200 text-slate-800 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-slate-100'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/60 text-slate-600 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 dark:border-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2 text-xs font-semibold">
                          <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                            <Flag className="w-3 h-3 text-indigo-800 dark:text-indigo-400 shrink-0" />
                            {obj.title}
                          </span>
                          <span className="font-mono bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-slate-700 dark:text-slate-300 tabular-nums shrink-0">
                            {obj.progress}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
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
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                  <Briefcase className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span>Steg 3: Projects (Projekt)</span>
                </div>

                {activeProject ? (
                  <div className="p-3 bg-violet-50/50 border border-violet-100 dark:bg-purple-950/20 dark:border-purple-900/40 rounded-xl text-left">
                    <div className="flex justify-between items-center gap-2 text-xs font-semibold text-violet-900 dark:text-purple-300">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Briefcase className="w-3 h-3 text-violet-700 dark:text-purple-400 shrink-0" />
                        {activeProject.title}
                      </span>
                      <span className="bg-violet-100 dark:bg-purple-900/50 font-mono text-violet-700 dark:text-purple-300 px-1.5 py-0.5 rounded-sm tabular-nums shrink-0">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
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
                          <div className="mt-1.5 text-[10px] text-blue-800 dark:text-blue-300 font-mono bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded inline-block">
                            Mätval: {activeInitiative.kpi}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] text-slate-400 dark:text-slate-500 italic">
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
                        <div className="space-y-1.5">
                          {activeTasks.map(t => (
                            <div 
                              key={t.id}
                              className="flex items-start gap-1.5 text-[11px] p-2 bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 rounded-lg"
                            >
                              <CheckSquare className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${t.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} />
                              <div className="leading-tight">
                                <p className={`font-medium ${t.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                  {t.title}
                                </p>
                                {t.kpi && t.completed && (
                                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-mono">
                                    ✓ {t.kpi}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] text-slate-400 dark:text-slate-500 italic">
                          Inga uppgifter i detta projekt.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center gap-3">
            <span className="truncate">Aktivt filter: <strong className="text-slate-700 dark:text-slate-200">{goals.find(g => g.id === selectedGoalId)?.title}</strong></span>
            <button 
              onClick={() => onNavigateToView('projects')}
              className="text-indigo-900 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Till Projektlista</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 4: Kata Coaching Loop Panel */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl flex flex-col justify-between shadow-xs border border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-rose-500" />
                <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">
                  Kata Coaching Loop
                </h3>
              </div>
              <span className="text-[10px] bg-rose-50 dark:bg-rose-950/45 text-rose-600 dark:text-rose-400 border border-rose-100/70 dark:border-rose-900/40 px-2 py-0.5 rounded font-semibold font-mono">
                PDCA
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
              Strukturerad förbättringsloop som driver experimentellt lärande genom regelbundna avstämningar.
            </p>

            {/* List of Kata coaching questions */}
            <div className="space-y-3">
              <div className="text-[11px] p-3 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/70 dark:border-rose-900/35 rounded-xl">
                <span className="text-rose-700 dark:text-rose-400 font-bold block mb-0.5 uppercase tracking-wide text-[10px]">1. Måltillstånd</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">"Vart vill vi ta oss på sikt?"</p>
                {kataSessions.length > 0 && (
                  <p className="text-slate-800 dark:text-slate-200 text-[11px] font-semibold mt-1 line-clamp-1">
                    {kataSessions[0].goal}
                  </p>
                )}
              </div>

              <div className="text-[11px] p-3 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/70 dark:border-rose-900/35 rounded-xl">
                <span className="text-rose-700 dark:text-rose-400 font-bold block mb-0.5 uppercase tracking-wide text-[10px]">2. Nu-tillstånd</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">"Var befinner vi oss just nu?"</p>
                {kataSessions.length > 0 && (
                  <p className="text-slate-800 dark:text-slate-200 text-[11px] font-semibold mt-1 line-clamp-1">
                    {kataSessions[0].current}
                  </p>
                )}
              </div>

              <div className="text-[11px] p-3 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/70 dark:border-rose-900/35 rounded-xl">
                <span className="text-rose-700 dark:text-rose-400 font-bold block mb-0.5 uppercase tracking-wide text-[10px]">3. Hinder & Tester</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">"Vilka är hindren & vad testar vi?"</p>
                {kataSessions.length > 0 && (
                  <p className="text-slate-800 dark:text-slate-200 text-[11px] font-semibold mt-1 line-clamp-1">
                    Experiment: {kataSessions[0].nextStep}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={onStartKata}
              className="w-full text-center text-xs py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Starta Aktiv Kata
            </button>
            <button
              onClick={() => onNavigateToView('kata')}
              className="w-full text-center text-xs py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-medium transition cursor-pointer dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-300 tabular-nums"
            >
              Se sessionhistorik ({kataSessionsCount})
            </button>
          </div>
        </div>

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

      {/* Action Guidance info banner */}
      <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 rounded-xl shrink-0 border border-indigo-100 dark:border-indigo-900/50">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-xs">Anpassa ramverket efter er organisation</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              MålRamverket synkar företagets strategiska visioner direkt med projekten. Justera noder, perspektiv och terminologi i strukturredigeraren.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateToView('hierarchy-editor')}
          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl tracking-tight transition whitespace-nowrap cursor-pointer self-start sm:self-auto"
        >
          Konfigurera min struktur
        </button>
      </div>

    </div>
  );
}
