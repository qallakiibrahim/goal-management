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
  Info,
  AlertTriangle,
  LogOut
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
  GoalCategory,
  Member
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
import LoginView from './components/LoginView';
import MembersView from './components/MembersView';

// Firestore Integration imports
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from './firebase';
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  bootstrapFirestore,
  syncGoalsToFirestore,
  syncObjectivesToFirestore,
  syncProjectsToFirestore,
  syncInitiativesToFirestore,
  syncTasksToFirestore,
  syncKpisToFirestore,
  syncKataSessionsToFirestore,
  syncUserProfileToFirestore,
  syncMembersToFirestore
} from './firebaseSync';

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
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Authentication & Membership States
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authOfflineBypass, setAuthOfflineBypass] = useState<boolean>(() => {
    return localStorage.getItem('authOfflineBypass') === 'true';
  });
  const [members, setMembers] = useState<Member[]>([]);

  // 1. Initial State bootstrapping with Firebase Realtime Sync + Local Backup
  useEffect(() => {
    // Force immediate local storage load for zero empty-screen flash
    const localGoals = localStorage.getItem('goals');
    const localObjectives = localStorage.getItem('objectives');
    const localProjects = localStorage.getItem('projects');
    const localInitiatives = localStorage.getItem('initiatives');
    const localTasks = localStorage.getItem('tasks');
    const localKpis = localStorage.getItem('kpis');
    const localKata = localStorage.getItem('kataSessions');
    const localProfile = localStorage.getItem('userProfile');
    const localMembers = localStorage.getItem('members');

    if (localGoals) setGoals(JSON.parse(localGoals));
    if (localObjectives) setObjectives(JSON.parse(localObjectives));
    if (localProjects) setProjects(JSON.parse(localProjects));
    if (localInitiatives) setInitiatives(JSON.parse(localInitiatives));
    if (localTasks) setTasks(JSON.parse(localTasks));
    if (localKpis) setKpis(JSON.parse(localKpis));
    if (localKata) setKataSessions(JSON.parse(localKata));
    if (localProfile) setUserProfile(JSON.parse(localProfile));
    if (localMembers) setMembers(JSON.parse(localMembers));

    // Initialize cloud syncing
    const db = getFirebaseDb();
    let unsubGoals: () => void = () => {};
    let unsubObjectives: () => void = () => {};
    let unsubProjects: () => void = () => {};
    let unsubInitiatives: () => void = () => {};
    let unsubTasks: () => void = () => {};
    let unsubKpis: () => void = () => {};
    let unsubKata: () => void = () => {};
    let unsubProfile: () => void = () => {};
    let unsubMembers: () => void = () => {};

    const handleSyncError = (error: any) => {
      console.warn('[Firestore] sync connection restricted/denied:', error);
      if (error && (error.code === 'permission-denied' || error.message?.includes('permission'))) {
        setFirebaseError('rules_restricted');
      }
    };

    bootstrapFirestore().then(() => {
      unsubGoals = onSnapshot(collection(db, 'goals'), (snapshot) => {
        const items: Goal[] = [];
        snapshot.forEach((doc) => { items.push({ ...doc.data() } as Goal); });
        if (items.length > 0) {
          setGoals(items);
          localStorage.setItem('goals', JSON.stringify(items));
        }
      }, handleSyncError);

      unsubObjectives = onSnapshot(collection(db, 'objectives'), (snapshot) => {
        const items: Objective[] = [];
        snapshot.forEach((doc) => { items.push({ ...doc.data() } as Objective); });
        if (items.length > 0) {
          setObjectives(items);
          localStorage.setItem('objectives', JSON.stringify(items));
        }
      }, handleSyncError);

      unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
        const items: Project[] = [];
        snapshot.forEach((doc) => { items.push({ ...doc.data() } as Project); });
        if (items.length > 0) {
          setProjects(items);
          localStorage.setItem('projects', JSON.stringify(items));
        }
      }, handleSyncError);

      unsubInitiatives = onSnapshot(collection(db, 'initiatives'), (snapshot) => {
        const items: Initiative[] = [];
        snapshot.forEach((doc) => { items.push({ ...doc.data() } as Initiative); });
        if (items.length > 0) {
          setInitiatives(items);
          localStorage.setItem('initiatives', JSON.stringify(items));
        }
      }, handleSyncError);

      unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
        const items: Task[] = [];
        snapshot.forEach((doc) => { items.push({ ...doc.data() } as Task); });
        if (items.length > 0) {
          setTasks(items);
          localStorage.setItem('tasks', JSON.stringify(items));
        }
      }, handleSyncError);

      unsubKpis = onSnapshot(collection(db, 'kpis'), (snapshot) => {
        const items: KPI[] = [];
        snapshot.forEach((doc) => { items.push({ ...doc.data() } as KPI); });
        if (items.length > 0) {
          setKpis(items);
          localStorage.setItem('kpis', JSON.stringify(items));
        }
      }, handleSyncError);

      unsubKata = onSnapshot(collection(db, 'kataSessions'), (snapshot) => {
        const items: KataSession[] = [];
        snapshot.forEach((doc) => { items.push({ ...doc.data() } as KataSession); });
        if (items.length > 0) {
          setKataSessions(items);
          localStorage.setItem('kataSessions', JSON.stringify(items));
        }
      }, handleSyncError);

      unsubProfile = onSnapshot(doc(db, 'userProfile', 'current'), (snapshot) => {
        if (snapshot.exists()) {
          const profile = snapshot.data() as UserProfile;
          setUserProfile(profile);
          localStorage.setItem('userProfile', JSON.stringify(profile));
        }
      }, handleSyncError);

      unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
        const items: Member[] = [];
        snapshot.forEach((doc) => { items.push({ ...doc.data() } as Member); });
        setMembers(items);
        localStorage.setItem('members', JSON.stringify(items));
      }, handleSyncError);
    }).catch((err) => {
      console.warn('[Firestore] Bootstrap process failed or resolved with error:', err);
      handleSyncError(err);
    });

    const authInstance = getFirebaseAuth();
    const unsubAuth = onAuthStateChanged(authInstance, (user) => {
      setAuthUser(user as FirebaseUser);
      setAuthLoading(false);
    }, (err) => {
      console.error('onAuthStateChanged error:', err);
      setAuthLoading(false);
    });

    return () => {
      unsubGoals();
      unsubObjectives();
      unsubProjects();
      unsubInitiatives();
      unsubTasks();
      unsubKpis();
      unsubKata();
      unsubProfile();
      unsubMembers();
      unsubAuth();
    };
  }, []);

  // 2. State-to-localStorage & CLOUD dual-write synchronizations
  const saveGoals = (items: Goal[]) => { 
    setGoals(items); 
    localStorage.setItem('goals', JSON.stringify(items)); 
    syncGoalsToFirestore(items);
  };
  const saveObjectives = (items: Objective[]) => { 
    setObjectives(items); 
    localStorage.setItem('objectives', JSON.stringify(items)); 
    syncObjectivesToFirestore(items);
  };
  const saveProjects = (items: Project[]) => { 
    setProjects(items); 
    localStorage.setItem('projects', JSON.stringify(items)); 
    syncProjectsToFirestore(items);
  };
  const saveInitiatives = (items: Initiative[]) => { 
    setInitiatives(items); 
    localStorage.setItem('initiatives', JSON.stringify(items)); 
    syncInitiativesToFirestore(items);
  };
  const saveTasks = (items: Task[]) => { 
    setTasks(items); 
    localStorage.setItem('tasks', JSON.stringify(items)); 
    syncTasksToFirestore(items);
  };
  const saveKpis = (items: KPI[]) => { 
    setKpis(items); 
    localStorage.setItem('kpis', JSON.stringify(items)); 
    syncKpisToFirestore(items);
  };
  const saveKata = (items: KataSession[]) => { 
    setKataSessions(items); 
    localStorage.setItem('kataSessions', JSON.stringify(items)); 
    syncKataSessionsToFirestore(items);
  };
  const saveProfile = (p: UserProfile) => { 
    setUserProfile(p); 
    localStorage.setItem('userProfile', JSON.stringify(p)); 
    syncUserProfileToFirestore(p);
  };

  const saveMembers = (items: Member[]) => {
    setMembers(items);
    localStorage.setItem('members', JSON.stringify(items));
    syncMembersToFirestore(items);
  };

  const handleInviteMember = (email: string, name: string, role: string) => {
    const newMember: Member = {
      id: email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'),
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: role,
      status: 'invited',
      invitedAt: new Date().toISOString(),
      invitedBy: authUser?.email || 'Huvudadministratör'
    };
    saveMembers([...members, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    const updated = members.filter(m => m.id !== id);
    saveMembers(updated);
  };

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
    saveGoals(DEFAULT_GOALS);
    saveObjectives(DEFAULT_OBJECTIVES);
    saveProjects(DEFAULT_PROJECTS);
    saveInitiatives(DEFAULT_INITIATIVES);
    saveTasks(DEFAULT_TASKS);
    saveKpis(DEFAULT_KPIS);
    saveKata(DEFAULT_KATA_SESSIONS);
    saveProfile(DEFAULT_USER_PROFILE);
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

  // Google sign in / sign out / Continue offline functions
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      const user = result.user;
      if (user && user.email) {
        const emailLower = user.email.toLowerCase();
        
        // If there are zero members in local/cloud, make this first user an Administrator
        if (members.length === 0) {
          const firstAdmin: Member = {
            id: emailLower.replace(/[^a-zA-Z0-9]/g, '_'),
            email: emailLower,
            name: user.displayName || emailLower.split('@')[0],
            role: 'Administratör',
            status: 'active',
            invitedAt: new Date().toISOString(),
            invitedBy: 'Självregistrerad (Ägare)'
          };
          saveMembers([firstAdmin]);
          saveProfile({
            name: user.displayName || emailLower.split('@')[0],
            email: emailLower,
            role: 'Administratör',
            language: 'Svenska',
            dateFormat: 'YYYY-MM-DD',
            notificationFrequency: 'Dagligen'
          });
        } else {
          // Otherwise check if email is in matching members list
          const matching = members.find(m => m.email.toLowerCase() === emailLower);
          if (matching) {
            if (matching.status === 'invited') {
              const updated = members.map(m => m.id === matching.id ? { ...m, status: 'active' as const, name: user.displayName || m.name } : m);
              saveMembers(updated);
            }
            saveProfile({
              name: user.displayName || matching.name || emailLower.split('@')[0],
              email: emailLower,
              role: matching.role,
              language: userProfile.language || 'Svenska',
              dateFormat: userProfile.dateFormat || 'YYYY-MM-DD',
              notificationFrequency: userProfile.notificationFrequency || 'Dagligen'
            });
          }
        }
      }
    } catch (err: any) {
      console.error('[OAuth] Google Auth Popup Error:', err);
      if (err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('auth/unauthorized-domain'))) {
        setAuthError('auth/unauthorized-domain');
      } else {
        setAuthError(err.message || 'Kunde inte slutföra inloggningen med Google. Kontrollera dina nätverksinställningar.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleContinueOffline = () => {
    setAuthOfflineBypass(true);
    localStorage.setItem('authOfflineBypass', 'true');
    // Set custom guest profile if not already configured
    if (userProfile.email === DEFAULT_USER_PROFILE.email) {
      saveProfile({
        ...userProfile,
        name: 'Gästanvändare',
        role: 'Administratör'
      });
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      await signOut(getFirebaseAuth());
      setAuthOfflineBypass(false);
      localStorage.removeItem('authOfflineBypass');
      // Reset user profile to default
      setUserProfile(DEFAULT_USER_PROFILE);
    } catch (err) {
      console.error('[OAuth] Sign Out Error:', err);
    } finally {
      setAuthLoading(false);
    }
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

  const emailLower = authUser?.email?.toLowerCase() || '';
  const isMember = members.length === 0 || members.some(m => m.email.toLowerCase() === emailLower);

  // Overwrite role depending on true active member info
  const activeMember = authUser ? members.find(m => m.email.toLowerCase() === emailLower) : null;
  const activeRole = activeMember ? activeMember.role : (authOfflineBypass ? 'Administratör' : userProfile.role);
  
  // Create a customized profile for the current session representation
  const activeProfile = {
    ...userProfile,
    role: activeRole,
    name: authUser?.displayName || (activeMember?.name) || (authOfflineBypass ? 'Gästanvändare' : userProfile.name),
    email: authUser?.email || (authOfflineBypass ? 'offline@localhost' : userProfile.email)
  };

  // If loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200 font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono tracking-wider text-slate-400">Verifierar behörighetsstatus...</p>
        </div>
      </div>
    );
  }

  // If not bypassed and not logged in
  if (!authOfflineBypass && !authUser) {
    return (
      <LoginView 
        onGoogleSignIn={handleGoogleSignIn}
        onContinueOffline={handleContinueOffline}
        authState={{ loading: authLoading, error: authError }}
        hasLocalBackup={members.length > 0}
      />
    );
  }

  // If logged in but NOT on the invitations/members register
  if (!authOfflineBypass && authUser && !isMember) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6V9m0-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-display font-bold text-white">Åtkomst nekad</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ditt Google-konto <strong className="text-slate-200">{authUser.email}</strong> är verifierat, men du saknar en aktiv inbjudan till denna plattform.
            </p>
            <p className="text-[11px] text-indigo-400 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-900/30 font-mono text-center">
              Tips: Kontakta systemets huvudadministratör och be dem lägga till din e-post.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-650 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Logga ut / Byt konto
          </button>
        </div>
      </div>
    );
  }

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
              {activeProfile.role} Dashboard
            </span>
            <span className="text-slate-350">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Inloggad som: <strong className="text-indigo-900">{activeProfile.name}</strong>
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 font-mono">
            <span>{new Date().toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-900 text-white font-bold flex items-center justify-center font-display shadow-xs shrink-0 select-none">
                {activeProfile.name.slice(0, 2).toUpperCase()}
              </div>
              
              {/* Logout button */}
              {(authUser || authOfflineBypass) && (
                <button
                  onClick={handleSignOut}
                  title="Logga ut"
                  className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic viewport container */}
        <div className="flex-1 px-8 pb-12 w-full max-w-7xl mx-auto space-y-6">
          
          {/* Firebase rules restriction warning */}
          {firebaseError === 'rules_restricted' && (
            <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs text-xs font-semibold text-left">
              <span className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <strong className="block text-amber-950 font-bold mb-0.5">Firebase/Firestore: Åtkomst Nekad (Permission Denied)</strong>
                  Applikationen använder lokalt minne som reserv (så att allt fungerar offline), men dina säkerhetsregler i Firebase blockerar moln-synkning. 
                  Gå till din <span className="font-mono text-indigo-900 bg-amber-100 px-1 py-0.5 rounded">Firebase Console</span> under 
                  <strong className="text-slate-900"> Firestore Database ➔ Rules</strong> och ändra raden till <code className="font-mono bg-lime-100 text-lime-800 px-1.5 py-0.5 rounded">allow read, write: if true;</code> för att tillåta läsning och skrivning under utveckling.
                </div>
              </span>
              <button 
                onClick={() => setFirebaseError(null)}
                className="hover:bg-amber-100 p-1.5 rounded-lg text-amber-600 hover:text-amber-950 transition self-end md:self-center cursor-pointer font-mono text-[10px]"
              >
                Ignorera
              </button>
            </div>
          )}

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

          {currentView === 'members' && (
            <MembersView
              members={members}
              onInviteMember={handleInviteMember}
              onRemoveMember={handleRemoveMember}
              currentUserIdEmail={authUser?.email || 'guest'}
              currentUserRole={activeRole}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              userProfile={activeProfile}
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
