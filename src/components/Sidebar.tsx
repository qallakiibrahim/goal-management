/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Target, 
  Flag, 
  Briefcase, 
  TrendingUp, 
  RefreshCw, 
  FileText, 
  Settings, 
  Layers, 
  Users, 
  Activity, 
  Award,
  UserPlus
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
}

export default function Sidebar({ currentView, onViewChange, stats }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Layers, color: 'text-indigo-600' },
    { id: 'bsc', name: 'Balanced Scorecard', icon: Users, color: 'text-emerald-600' },
    { id: 'goals', name: 'Mål', icon: Target, color: 'text-indigo-600', badge: stats.goalsCount },
    { id: 'projects', name: 'Projekt', icon: Briefcase, color: 'text-violet-600', badge: stats.projectsCount },
    { id: 'kpis', name: 'KPI:er', icon: TrendingUp, color: 'text-emerald-600', subText: `${stats.kpiPercentage}%` },
    { id: 'kata', name: 'Kata Coaching', icon: RefreshCw, color: 'text-rose-600', badge: stats.kataSessionsCount },
    { id: 'hierarchy-editor', name: 'Hierarkiredigerare', icon: Layers, color: 'text-blue-500' },
    { id: 'members', name: 'Användare & Inbjudna', icon: UserPlus, color: 'text-violet-655' },
    { id: 'settings', name: 'Inställningar', icon: Settings, color: 'text-slate-500' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 sticky top-0" id="appSidebar">
      {/* Brand logo & tagline */}
      <div className="p-6 border-b border-slate-100 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-900 rounded-lg text-white">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-indigo-900 tracking-tight text-left">
              MålRamverk
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold font-mono text-left">
              Alignment Engine
            </p>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-2 rounded-md leading-relaxed text-left">
          <span className="font-semibold text-indigo-900 text-left">Fokus: </span>
          Mål → Målsättning → Projekt → Initiativ → Uppdrag
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-900 shadow-sm border-l-4 border-indigo-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-900' : 'text-slate-400'}`} />
                <span className="text-left font-display font-medium">{item.name}</span>
              </div>
              
              {item.badge !== undefined && (
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                  {item.badge}
                </span>
              )}
              {item.subText !== undefined && (
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                  {item.subText}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer metadata info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-slate-400 text-[10px] space-y-1 font-mono text-left">
        <p className="font-semibold text-slate-500">Systemstatus: <span className="text-emerald-600 font-bold">● AKTIV</span></p>
        <p className="text-[10px] leading-tight">Version: 2.0 (React/TS)</p>
        <p className="text-[9px] leading-tight text-slate-300">Konfigurerad med LocalStorage</p>
      </div>
    </aside>
  );
}
