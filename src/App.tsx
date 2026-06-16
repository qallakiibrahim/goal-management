/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, 
  X, 
  CheckCircle2, 
  Clock, 
  User, 
  RotateCcw, 
  HelpCircle,
  Bell,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


// Imports of types and default values
import { 
  Goal, 
  Objective, 
  Project, 
  Initiative, 
  Task, 
  KPI, 
  KataSession, 
  UserProfile, 
  GoalCategory 
} from './types';
import { 
  DEFAULT_GOALS, 
  DEFAULT_OBJECTIVES, 
  DEFAULT_PROJECTS, 
  DEFAULT_INITIATIVES, 
  DEFAULT_TASKS, 
  DEFAULT_KPIS, 
  DEFAULT_KATA_SESSIONS, 
  DEFAULT_USER_PROFILE 
} from './demoData';

// Modular view components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import BscView from './components/BscView';
import GoalsView from './components/GoalsView';
import ProjectsView from './components/ProjectsView';
import KpisView from './components/KpisView';
import KataView from './components/KataView';
import HierarchyEditorView from './components/HierarchyEditorView';
import SettingsView from './components/SettingsView';
import AIAssistant from './components/AIAssistant';

export default function App() {
  // Navigation
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Application database states
  const [goals, setGoals] = useState<Goal[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [kataSessions, setKataSessions] = useState<KataSession[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  // Modal triggering states
  const [activeModal, setActiveModal] = useState<
    null | 'addGoal' | 'editGoal' | 'addProject' | 'editProject' | 'addKpi' | 'editKpi' | 'addKata' | 'editKata'
  >(null);
  
  // Storage for currently editing node items
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [editingKata, setEditingKata] = useState<KataSession | null>(null);

  // Form input variables for modals
  const [formGoal, setFormGoal] = useState({ title: '', description: '', kpi: '', category: 'financial' as GoalCategory, progress: 0, deadline: '2026-12-31' });
  const [formProject, setFormProject] = useState({ title: '', description: '', progress: 0, deadline: '2026-12-31' });
  const [formKpi, setFormKpi] = useState({ title: '', value: '', target: '', progress: 0, deadline: 'Löpande', category: 'financial' as GoalCategory });
  const [formKata, setFormKata] = useState({ title: '', date: '', goal: '', current: '', obstacles: '', nextStep: '', learnings: '', progress: 0 });

  // System alert displays
  const [showDemoAlert, setShowDemoAlert] = useState(true);

  // 1. Initial State bootstrapping
  useEffect(() => {
    const localGoals = localStorage.getItem('goals');
    const localObjectives = localStorage.getItem('objectives');
    const localProjects = localStorage.getItem('projects');
    const localInitiatives = localStorage.getItem('initiatives');
    const localTasks = localStorage.getItem('tasks');
    const localKpis = localStorage.getItem('kpis');
    const localKata = localStorage.getItem('kataSessions');
    const localProfile = localStorage.getItem('userProfile');

    if (localGoals) setGoals(JSON.parse(localGoals));
    else { setGoals(DEFAULT_GOALS); localStorage.setItem('goals', JSON.stringify(DEFAULT_GOALS)); }

    if (localObjectives) setObjectives(JSON.parse(localObjectives));
    else { setObjectives(DEFAULT_OBJECTIVES); localStorage.setItem('objectives', JSON.stringify(DEFAULT_OBJECTIVES)); }

    if (localProjects) setProjects(JSON.parse(localProjects));
    else { setProjects(DEFAULT_PROJECTS); localStorage.setItem('projects', JSON.stringify(DEFAULT_PROJECTS)); }

    if (localInitiatives) setInitiatives(JSON.parse(localInitiatives));
    else { setInitiatives(DEFAULT_INITIATIVES); localStorage.setItem('initiatives', JSON.stringify(DEFAULT_INITIATIVES)); }

    if (localTasks) setTasks(JSON.parse(localTasks));
    else { setTasks(DEFAULT_TASKS); localStorage.setItem('tasks', JSON.stringify(DEFAULT_TASKS)); }

    if (localKpis) setKpis(JSON.parse(localKpis));
    else { setKpis(DEFAULT_KPIS); localStorage.setItem('kpis', JSON.stringify(DEFAULT_KPIS)); }

    if (localKata) setKataSessions(JSON.parse(localKata));
    else { setKataSessions(DEFAULT_KATA_SESSIONS); localStorage.setItem('kataSessions', JSON.stringify(DEFAULT_KATA_SESSIONS)); }

    if (localProfile) setUserProfile(JSON.parse(localProfile));
    else { setUserProfile(DEFAULT_USER_PROFILE); localStorage.setItem('userProfile', JSON.stringify(DEFAULT_USER_PROFILE)); }
  }, []);

  // 2. State-to-localStorage synchronization functions
  const saveGoals = (items: Goal[]) => { setGoals(items); localStorage.setItem('goals', JSON.stringify(items)); };
  const saveObjectives = (items: Objective[]) => { setObjectives(items); localStorage.setItem('objectives', JSON.stringify(items)); };
  const saveProjects = (items: Project[]) => { setProjects(items); localStorage.setItem('projects', JSON.stringify(items)); };
  const saveInitiatives = (items: Initiative[]) => { setInitiatives(items); localStorage.setItem('initiatives', JSON.stringify(items)); };
  const saveTasks = (items: Task[]) => { setTasks(items); localStorage.setItem('tasks', JSON.stringify(items)); };
  const saveKpis = (items: KPI[]) => { setKpis(items); localStorage.setItem('kpis', JSON.stringify(items)); };
  const saveKata = (items: KataSession[]) => { setKataSessions(items); localStorage.setItem('kataSessions', JSON.stringify(items)); };
  const saveProfile = (p: UserProfile) => { setUserProfile(p); localStorage.setItem('userProfile', JSON.stringify(p)); };

  // 3. Action callbacks
  const handleAddNewNode = (type: string, data: any) => {
    const randomId = `${type.substring(0, 1)}-${Date.now()}`;
    const itemWithId = { ...data, id: randomId };

    switch (type) {
      case 'goal':
        saveGoals([...goals, itemWithId as Goal]);
        break;
      case 'objective':
        saveObjectives([...objectives, itemWithId as Objective]);
        break;
      case 'project':
        saveProjects([...projects, itemWithId as Project]);
        break;
      case 'initiative':
        saveInitiatives([...initiatives, itemWithId as Initiative]);
        break;
      case 'task':
        saveTasks([...tasks, itemWithId as Task]);
        break;
    }
  };

  const handleUpdateGoalProgress = (id: string, progress: number) => {
    const updated = goals.map(g => g.id === id ? { ...g, progress } : g);
    saveGoals(updated);
  };

  const handleUpdateProjectProgress = (id: string, progress: number) => {
    const updated = projects.map(p => p.id === id ? { ...p, progress } : p);
    saveProjects(updated);
  };

  const handleUpdateKpiProgress = (id: string, progress: number) => {
    const updated = kpis.map(k => k.id === id ? { ...k, progress } : k);
    saveKpis(updated);
  };

  const handleUpdateSessionProgress = (id: string, progress: number) => {
    const updated = kataSessions.map(s => s.id === id ? { ...s, progress } : s);
    saveKata(updated);
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed, progress: !t.completed ? 100 : 0 } : t);
    saveTasks(updatedTasks);

    // Auto calculate project progress if tasks are ticked! (True Craftsmanship)
    const linkedTask = tasks.find(t => t.id === taskId);
    if (linkedTask && linkedTask.projectId) {
      const projId = linkedTask.projectId;
      const projTasks = updatedTasks.filter(t => t.projectId === projId);
      const completed = projTasks.filter(t => t.completed).length;
      const total = projTasks.length;
      if (total > 0) {
        const autoProgress = Math.round((completed / total) * 100);
        handleUpdateProjectProgress(projId, autoProgress);
      }
    }
  };

  const handleAddTaskToProject = (projectId: string, title: string) => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      projectId,
      title,
      completed: false,
      progress: 0
    };
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);

    // Recalculate progress coefficients after brand-new task addition
    const projTasks = updatedTasks.filter(t => t.projectId === projectId);
    const completed = projTasks.filter(t => t.completed).length;
    const total = projTasks.length;
    if (total > 0) {
      const autoProgress = Math.round((completed / total) * 100);
      handleUpdateProjectProgress(projectId, autoProgress);
    }
  };

  const handleDeleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
    // clean orphaned child Objectives
    saveObjectives(objectives.filter(o => o.goalId !== id));
  };

  const handleDeleteProject = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id));
    saveTasks(tasks.filter(t => t.projectId !== id));
    saveInitiatives(initiatives.filter(i => i.projectId !== id));
  };

  const handleDeleteKpi = (id: string) => {
    saveKpis(kpis.filter(k => k.id !== id));
  };

  const handleDeleteSession = (id: string) => {
    saveKata(kataSessions.filter(s => s.id !== id));
  };

  const handleUpdateProfile = (p: UserProfile) => {
    saveProfile(p);
  };

  const handleResetDatabase = () => {
    localStorage.clear();
    setGoals(DEFAULT_GOALS);
    setObjectives(DEFAULT_OBJECTIVES);
    setProjects(DEFAULT_PROJECTS);
    setInitiatives(DEFAULT_INITIATIVES);
    setTasks(DEFAULT_TASKS);
    setKpis(DEFAULT_KPIS);
    setKataSessions(DEFAULT_KATA_SESSIONS);
    setUserProfile(DEFAULT_USER_PROFILE);
  };

  const handleExportData = () => {
    const fullJson = {
      goals,
      objectives,
      projects,
      initiatives,
      tasks,
      kpis,
      kataSessions
    };
    return JSON.stringify(fullJson, null, 2);
  };

  const handleImportData = (rawString: string) => {
    try {
      const parsed = JSON.parse(rawString);
      if (parsed.goals && Array.isArray(parsed.goals)) saveGoals(parsed.goals);
      if (parsed.objectives && Array.isArray(parsed.objectives)) saveObjectives(parsed.objectives);
      if (parsed.projects && Array.isArray(parsed.projects)) saveProjects(parsed.projects);
      if (parsed.initiatives && Array.isArray(parsed.initiatives)) saveInitiatives(parsed.initiatives);
      if (parsed.tasks && Array.isArray(parsed.tasks)) saveTasks(parsed.tasks);
      if (parsed.kpis && Array.isArray(parsed.kpis)) saveKpis(parsed.kpis);
      if (parsed.kataSessions && Array.isArray(parsed.kataSessions)) saveKata(parsed.kataSessions);
      return true;
    } catch (e) {
      return false;
    }
  };

  // 4. Modal actions
  const openAddGoalModal = () => {
    setFormGoal({ title: '', description: '', kpi: '', category: 'financial', progress: 0, deadline: '2026-12-31' });
    setActiveModal('addGoal');
  };

  const openEditGoalModal = (g: Goal) => {
    setEditingGoal(g);
    setFormGoal({ title: g.title, description: g.description, kpi: g.kpi, category: g.category, progress: g.progress, deadline: g.deadline });
    setActiveModal('editGoal');
  };

  const submitGoalForm = (e: FormEvent) => {
    e.preventDefault();
    if (!formGoal.title.trim()) return alert('Titel får ej vara tom.');

    if (activeModal === 'addGoal') {
      const newG: Goal = {
        id: `g-${Date.now()}`,
        ...formGoal
      };
      saveGoals([...goals, newG]);
    } else if (activeModal === 'editGoal' && editingGoal) {
      const updated = goals.map(g => g.id === editingGoal.id ? { ...g, ...formGoal } : g);
      saveGoals(updated);
    }
    setActiveModal(null);
  };

  const openAddProjectModal = () => {
    setFormProject({ title: '', description: '', progress: 0, deadline: '2026-12-31' });
    setActiveModal('addProject');
  };

  const openEditProjectModal = (p: Project) => {
    setEditingProject(p);
    setFormProject({ title: p.title, description: p.description, progress: p.progress, deadline: p.deadline });
    setActiveModal('editProject');
  };

  const submitProjectForm = (e: FormEvent) => {
    e.preventDefault();
    if (!formProject.title.trim()) return alert('Titel får ej vara tom.');

    if (activeModal === 'addProject') {
      const newP: Project = {
        id: `p-${Date.now()}`,
        ...formProject
      };
      saveProjects([...projects, newP]);
    } else if (activeModal === 'editProject' && editingProject) {
      const updated = projects.map(p => p.id === editingProject.id ? { ...p, ...formProject } : p);
      saveProjects(updated);
    }
    setActiveModal(null);
  };

  const openAddKpiModal = (defaultCategory?: GoalCategory) => {
    setFormKpi({ title: '', value: '', target: '', progress: 0, deadline: 'Löpande', category: defaultCategory || 'financial' });
    setActiveModal('addKpi');
  };

  const openEditKpiModal = (k: KPI) => {
    setEditingKpi(k);
    setFormKpi({ title: k.title, value: k.value, target: k.target, progress: k.progress, deadline: k.deadline, category: k.category || 'financial' });
    setActiveModal('editKpi');
  };

  const submitKpiForm = (e: FormEvent) => {
    e.preventDefault();
    if (!formKpi.title.trim() || !formKpi.value.trim() || !formKpi.target.trim()) return alert('Rubrik, Värde samt Mål är obligatoriska fält.');

    if (activeModal === 'addKpi') {
      const newK: KPI = {
        id: `k-${Date.now()}`,
        ...formKpi
      };
      saveKpis([...kpis, newK]);
    } else if (activeModal === 'editKpi' && editingKpi) {
      const updated = kpis.map(k => k.id === editingKpi.id ? { ...k, ...formKpi } : k);
      saveKpis(updated);
    }
    setActiveModal(null);
  };

  const openAddKataModal = () => {
    setFormKata({ title: '', date: new Date().toISOString().split('T')[0], goal: '', current: '', obstacles: '', nextStep: '', learnings: '', progress: 0 });
    setActiveModal('addKata');
  };

  const openEditKataModal = (s: KataSession) => {
    setEditingKata(s);
    setFormKata({ title: s.title, date: s.date, goal: s.goal, current: s.current, obstacles: s.obstacles, nextStep: s.nextStep, learnings: s.learnings, progress: s.progress });
    setActiveModal('editKata');
  };

  const submitKataForm = (e: FormEvent) => {
    e.preventDefault();
    if (!formKata.title.trim() || !formKata.goal.trim()) return alert('Rubrik samt önskat tillstånd är obligatoriska fält.');

    if (activeModal === 'addKata') {
      const newS: KataSession = {
        id: `ka-${Date.now()}`,
        ...formKata
      };
      saveKata([...kataSessions, newS]);
    } else if (activeModal === 'editKata' && editingKata) {
      const updated = kataSessions.map(s => s.id === editingKata.id ? { ...s, ...formKata } : s);
      saveKata(updated);
    }
    setActiveModal(null);
  };

  // Compute stats for Sidebar
  const stats = {
    goalsCount: goals.length,
    projectsCount: projects.length,
    kpiPercentage: kpis.length > 0 
      ? Math.round(kpis.reduce((acc, kpi) => acc + kpi.progress, 0) / kpis.length)
      : 0,
    kataSessionsCount: kataSessions.length
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
      
      {/* 1. Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => setCurrentView(view)} 
        stats={stats}
      />

      {/* 2. Main content compartment */}
      <main className="flex-1 overflow-y-auto flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 bg-white border-b border-slate-200 z-10 px-8 py-4 flex items-center justify-between shadow-xs mb-8">
          <div className="flex items-center gap-2 text-left">
            <span className="text-sm font-semibold text-slate-400 capitalize tracking-wide">
              {userProfile.role} Dashboard
            </span>
            <span className="text-slate-350">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Inloggad som: <strong className="text-indigo-900">{userProfile.name}</strong>
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 font-mono">
            <span>{new Date().toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <div className="w-8 h-8 rounded-full bg-indigo-900 text-white font-bold flex items-center justify-center font-display shadow-xs shrink-0 select-none">
              {userProfile.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic viewport container */}
        <div className="flex-1 px-8 pb-12 w-full max-w-7xl mx-auto space-y-6">
          
          {/* Demo Alert banner */}
          {showDemoAlert && (
            <div className="p-3 bg-indigo-900 text-indigo-50 border border-indigo-950/20 rounded-2xl flex items-center justify-between shadow-xs text-xs font-semibold select-none leading-relaxed text-left">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-300 shrink-0" />
                Interaktiv Prototyp v2.0 - All data du matar in eller justerar sparas lokalt i din webbläsares LocalStorage.
              </span>
              <button 
                onClick={() => setShowDemoAlert(false)}
                className="hover:bg-white/10 p-1 rounded-lg text-indigo-250 hover:text-white transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Router views switch */}
          {currentView === 'dashboard' && (
            <DashboardView
              goals={goals}
              objectives={objectives}
              projects={projects}
              initiatives={initiatives}
              tasks={tasks}
              kpis={kpis}
              kataSessions={kataSessions}
              onNavigateToView={(v) => setCurrentView(v)}
              onStartKata={openAddKataModal}
            />
          )}

          {currentView === 'bsc' && (
            <BscView
              kpis={kpis}
              onAddKpi={(cat) => openAddKpiModal(cat)}
            />
          )}

          {currentView === 'goals' && (
            <GoalsView
              goals={goals}
              onOpenAddModal={openAddGoalModal}
              onOpenEditModal={openEditGoalModal}
              onDeleteGoal={handleDeleteGoal}
              onUpdateGoalProgress={handleUpdateGoalProgress}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              tasks={tasks}
              goals={goals}
              onOpenAddModal={openAddProjectModal}
              onOpenEditModal={openEditProjectModal}
              onDeleteProject={handleDeleteProject}
              onUpdateProjectProgress={handleUpdateProjectProgress}
              onToggleTask={handleToggleTask}
              onAddTaskToProject={handleAddTaskToProject}
            />
          )}

          {currentView === 'kpis' && (
            <KpisView
              kpis={kpis}
              onOpenAddModal={openAddKpiModal}
              onOpenEditModal={openEditKpiModal}
              onDeleteKpi={handleDeleteKpi}
              onUpdateKpiProgress={handleUpdateKpiProgress}
            />
          )}

          {currentView === 'kata' && (
            <KataView
              kataSessions={kataSessions}
              onOpenAddModal={openAddKataModal}
              onOpenEditModal={openEditKataModal}
              onDeleteSession={handleDeleteSession}
              onUpdateSessionProgress={handleUpdateSessionProgress}
            />
          )}

          {currentView === 'hierarchy-editor' && (
            <HierarchyEditorView
              goals={goals}
              objectives={objectives}
              projects={projects}
              onAddNewNode={handleAddNewNode}
              onImportData={handleImportData}
              onExportData={handleExportData}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onResetDatabase={handleResetDatabase}
            />
          )}

        </div>
      </main>

      {/* 3. Global Dynamic Overlay Modals with AnimatePresence */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col justify-start text-left max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
                <h3 className="font-display font-bold text-base text-indigo-900">
                  {activeModal === 'addGoal' && 'Lägg till Strategiskt Mål'}
                  {activeModal === 'editGoal' && 'Redigera Strategiskt Mål'}
                  {activeModal === 'addProject' && 'Lägg till Operativt Projekt'}
                  {activeModal === 'editProject' && 'Redigera Operativt Projekt'}
                  {activeModal === 'addKpi' && 'Lägg till ny KPI-mätare'}
                  {activeModal === 'editKpi' && 'Redigera KPI-mätare'}
                  {activeModal === 'addKata' && 'Starta ny Toyota Kata session'}
                  {activeModal === 'editKata' && 'Redigera Toyota Kata session'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 text-xs font-semibold border"
                >
                  Stäng
                </button>
              </div>

              {/* Goal Form content */}
              {(activeModal === 'addGoal' || activeModal === 'editGoal') && (
                <form onSubmit={submitGoalForm} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Rubrik / Målrubrik:</label>
                    <input
                      type="text"
                      required
                      value={formGoal.title}
                      onChange={(e) => setFormGoal({ ...formGoal, title: e.target.value })}
                      placeholder="Bli fullständigt CO2 neutrala..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Beskrivning av målvisionen:</label>
                    <textarea
                      required
                      value={formGoal.description}
                      onChange={(e) => setFormGoal({ ...formGoal, description: e.target.value })}
                      placeholder="Förklara syfte, tidsaspekter samt förväntat mervärde..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Konkret mätetal (KPI):</label>
                    <input
                      type="text"
                      required
                      value={formGoal.kpi}
                      onChange={(e) => setFormGoal({ ...formGoal, kpi: e.target.value })}
                      placeholder="Mäts via totalt avtryck i ton..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Kategori:</label>
                      <select
                        value={formGoal.category}
                        onChange={(e: any) => setFormGoal({ ...formGoal, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      >
                        <option value="financial">💰 Finansiellt</option>
                        <option value="customer">🤝 Kund</option>
                        <option value="process">⚙️ Processer</option>
                        <option value="learning">📚 Lärande</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Framsteg (0-100%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formGoal.progress}
                        onChange={(e) => setFormGoal({ ...formGoal, progress: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Deadline:</label>
                    <input
                      type="text"
                      value={formGoal.deadline}
                      onChange={(e) => setFormGoal({ ...formGoal, deadline: e.target.value })}
                      placeholder="Dec 2026"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg text-xs mt-4 transition"
                  >
                    Spara Mål
                  </button>
                </form>
              )}

              {/* Project Form content */}
              {(activeModal === 'addProject' || activeModal === 'editProject') && (
                <form onSubmit={submitProjectForm} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Projekttitel:</label>
                    <input
                      type="text"
                      required
                      value={formProject.title}
                      onChange={(e) => setFormProject({ ...formProject, title: e.target.value })}
                      placeholder="Elektrifiera distributionsledningen..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Projektbeskrivning:</label>
                    <textarea
                      required
                      value={formProject.description}
                      onChange={(e) => setFormProject({ ...formProject, description: e.target.value })}
                      placeholder="Skriv målsättning samt omfattning..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Framsteg (0-100%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formProject.progress}
                        onChange={(e) => setFormProject({ ...formProject, progress: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Deadline:</label>
                      <input
                        type="text"
                        value={formProject.deadline}
                        onChange={(e) => setFormProject({ ...formProject, deadline: e.target.value })}
                        placeholder="Dec 2026"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg text-xs mt-4 transition"
                  >
                    Spara Projekt
                  </button>
                </form>
              )}

              {/* KPI Form content */}
              {(activeModal === 'addKpi' || activeModal === 'editKpi') && (
                <form onSubmit={submitKpiForm} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Mätetalsnamn (KPI):</label>
                    <input
                      type="text"
                      required
                      value={formKpi.title}
                      onChange={(e) => setFormKpi({ ...formKpi, title: e.target.value })}
                      placeholder="Leveranstid / eNPS index..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Aktuellt värde:</label>
                      <input
                        type="text"
                        required
                        value={formKpi.value}
                        onChange={(e) => setFormKpi({ ...formKpi, value: e.target.value })}
                        placeholder="+35%"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Börvärde / Mål:</label>
                      <input
                        type="text"
                        required
                        value={formKpi.target}
                        onChange={(e) => setFormKpi({ ...formKpi, target: e.target.value })}
                        placeholder="+50%"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Category:</label>
                      <select
                        value={formKpi.category}
                        onChange={(e: any) => setFormKpi({ ...formKpi, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      >
                        <option value="financial">💰 Finansiellt</option>
                        <option value="customer">🤝 Kund</option>
                        <option value="process">⚙️ Processer</option>
                        <option value="learning">📚 Lärande</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Framsteg (0-100%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formKpi.progress}
                        onChange={(e) => setFormKpi({ ...formKpi, progress: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Tidsfrist:</label>
                    <input
                      type="text"
                      value={formKpi.deadline}
                      onChange={(e) => setFormKpi({ ...formKpi, deadline: e.target.value })}
                      placeholder="12 mån / Löpande"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg text-xs mt-4 transition"
                  >
                    Spara Mätetal
                  </button>
                </form>
              )}

              {/* Kata Form content */}
              {(activeModal === 'addKata' || activeModal === 'editKata') && (
                <form onSubmit={submitKataForm} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Sessionstitel / Ämne:</label>
                    <input
                      type="text"
                      required
                      value={formKata.title}
                      onChange={(e) => setFormKata({ ...formKata, title: e.target.value })}
                      placeholder="Effektivisera laddning vid distributionscentral..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Avstämningsdatum:</label>
                      <input
                        type="text"
                        required
                        value={formKata.date}
                        onChange={(e) => setFormKata({ ...formKata, date: e.target.value })}
                        placeholder="2026-06-16"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Testprogression (0-100%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formKata.progress}
                        onChange={(e) => setFormKata({ ...formKata, progress: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">1. Önskat tillstånd / Målbild:</label>
                    <textarea
                      required
                      value={formKata.goal}
                      onChange={(e) => setFormKata({ ...formKata, goal: e.target.value })}
                      placeholder="Var vill vi vara nästa vecka?"
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">2. Nuvarande läge:</label>
                    <textarea
                      required
                      value={formKata.current}
                      onChange={(e) => setFormKata({ ...formKata, current: e.target.value })}
                      placeholder="Var står vi exakt nu?"
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">3. Hinder på vägen:</label>
                    <textarea
                      required
                      value={formKata.obstacles}
                      onChange={(e) => setFormKata({ ...formKata, obstacles: e.target.value })}
                      placeholder="Vilka utmaningar stoppar oss?"
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">4. Nästa experiment / Steg:</label>
                    <textarea
                      required
                      value={formKata.nextStep}
                      onChange={(e) => setFormKata({ ...formKata, nextStep: e.target.value })}
                      placeholder="Vad testar vi i eftermiddag?"
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">5. Lärdomar från föregående steg:</label>
                    <textarea
                      value={formKata.learnings}
                      onChange={(e) => setFormKata({ ...formKata, learnings: e.target.value })}
                      placeholder="Vad lärde vi oss av förra mätningen?"
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs mt-4 transition shadow-xs"
                  >
                    Spara Kata-Session
                  </button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIAssistant
        goals={goals}
        projects={projects}
        kpis={kpis}
        kataSessions={kataSessions}
      />
    </div>
  );
}
