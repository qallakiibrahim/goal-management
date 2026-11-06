/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Target, 
  Briefcase, 
  TrendingUp, 
  RefreshCw, 
  Settings, 
  Layers, 
  Users, 
  Activity, 
  UserPlus,
  Scale,
  ChevronLeft,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (viewName: string) => void;
  stats: {
    goalsCount: number;
    projectsCount: number;
    kpiPercentage: number;
    kataSessionsCount: number;
  };
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export default function Sidebar({ currentView, onViewChange, stats, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Layers, color: 'text-indigo-600' },
    { id: 'vsm', name: 'Värdeflödesanalys (VSM)', icon: Activity, color: 'text-rose-500' },
    { id: 'kano', name: 'Kano & CTQ Analys', icon: Scale, color: 'text-indigo-505' },
    { id: 'bsc', name: 'Balanced Scorecard', icon: Users, color: 'text-emerald-600' },
    { id: 'goals', name: 'Mål', icon: Target, color: 'text-indigo-600', badge: stats.goalsCount },
    { id: 'projects', name: 'Projekt', icon: Briefcase, color: 'text-violet-600', badge: stats.projectsCount },
    { id: 'kpis', name: 'KPI:er', icon: TrendingUp, color: 'text-emerald-600', subText: `${stats.kpiPercentage}%` },
    { id: 'kata', name: 'Kata Coaching', icon: RefreshCw, color: 'text-rose-600', badge: stats.kataSessionsCount },
    { id: 'hierarchy-editor', name: 'Hierarkiredigerare', icon: Layers, color: 'text-blue-500' },
    { id: 'members', name: 'Användare & Inbjudna', icon: UserPlus, color: 'text-violet-655' },
    { id: 'settings', name: 'Inställningar', icon: Settings, color: 'text-slate-500' },
  ];

  const handleItemClick = (id: string) => {
    onViewChange(id);
    // Auto-close drawer on tablets and mobile screens
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay for iPad and Mobile (< 1024px) */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Sidebar (Drawer on iPad/mobile, sticky on desktop) */}
      <aside 
        className="w-72 sm:w-80 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 fixed inset-y-0 left-0 z-50 lg:static lg:z-auto shadow-2xl lg:shadow-none transition-all duration-200" 
        id="appSidebar"
      >
        {/* Brand logo & tagline */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-900 dark:bg-indigo-600 rounded-lg text-white">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-indigo-900 dark:text-indigo-400 tracking-tight text-left">
                  MålRamverk
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold font-mono text-left">
                  Alignment Engine
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title="Dölj sidomeny"
              >
                <ChevronLeft className="w-5 h-5 hidden lg:block" />
                <X className="w-5 h-5 lg:hidden" />
              </button>
            )}
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-2 rounded-md leading-relaxed text-left">
            <span className="font-semibold text-indigo-900 dark:text-indigo-400 text-left">Fokus: </span>
            Mål → Målsättning → Projekt → Initiativ → Uppdrag
          </div>
        </div>

        {/* Nav Link List */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-xs border-l-4 border-indigo-900 dark:border-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-400'}`} />
                  <span className="text-left font-display">{item.name}</span>
                </div>
                
                {item.badge !== undefined && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                    {item.badge}
                  </span>
                )}
                {item.subText !== undefined && (
                  <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                    {item.subText}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer metadata info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-500 text-[10px] space-y-1 font-mono text-left">
          <div className="flex items-center justify-between">
            <span>Motor:</span>
            <span className="text-indigo-900 dark:text-indigo-400 font-semibold">v2.5.0 Pro</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Offline-klar:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Aktiv</span>
          </div>
        </div>
      </aside>
    </>
  );
}
