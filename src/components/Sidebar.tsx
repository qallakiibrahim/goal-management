/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Target, 
  Briefcase, 
  TrendingUp, 
  RefreshCw, 
  Users, 
  Activity, 
  Scale,
  ChevronLeft,
  ChevronRight,
  X,
  Workflow,
  Grid3x3,
  LayoutDashboard
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
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: typeof Target;
  count?: number;
  metric?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function Sidebar({ currentView, onViewChange, stats, isOpen, onClose, onToggle }: SidebarProps) {
  const sections: MenuSection[] = [
    {
      title: 'Översikt & Analys',
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'process-map', name: 'Processkarta & Flöde', icon: Workflow },
        { id: 'vsm', name: 'Värdeflödesanalys (VSM)', icon: Activity },
        { id: 'kano', name: 'Kano & CTQ Analys', icon: Scale },
      ]
    },
    {
      title: 'Strategisk Styrning',
      items: [
        { id: 'bsc', name: 'Balanced Scorecard', icon: Users },
        { id: 'x-matrix', name: 'X-Matris (Hoshin)', icon: Grid3x3 },
        { id: 'goals', name: 'Mål', icon: Target, count: stats.goalsCount },
        { id: 'projects', name: 'Projekt', icon: Briefcase, count: stats.projectsCount },
        { id: 'kpis', name: 'KPI:er', icon: TrendingUp, metric: `${stats.kpiPercentage}%` },
        { id: 'kata', name: 'Kata Coaching', icon: RefreshCw, count: stats.kataSessionsCount },
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    onViewChange(id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay for iPad and Mobile (< 1024px) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar: Drawer on <1024px when open; persistent collapsible rail on >=1024px */}
      <aside 
        className={`bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex-col h-screen shrink-0 fixed inset-y-0 left-0 z-50 lg:static lg:z-auto shadow-2xl lg:shadow-none transition-all duration-200 ${
          isOpen
            ? 'flex w-72 sm:w-76 lg:w-64'
            : 'hidden lg:flex lg:w-[72px]'
        }`} 
        id="appSidebar"
      >
        {/* Brand Header matching top bar height */}
        <div className={`border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 h-[53px] ${
          isOpen ? 'px-4 gap-2' : 'px-2 gap-1'
        }`}>
          <button
            type="button"
            onClick={() => handleItemClick('dashboard')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group text-left"
            title="Gå till Dashboard"
          >
            <div className={`${isOpen ? 'w-8 h-8' : 'w-7 h-7'} bg-indigo-900 dark:bg-indigo-600 rounded-lg text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-indigo-950 dark:group-hover:bg-indigo-500 transition-colors`}>
              <Target className={isOpen ? 'w-4.5 h-4.5' : 'w-4 h-4'} />
            </div>
            {isOpen && (
              <div className="min-w-0">
                <h1 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate">
                  MålRamverk
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold leading-tight truncate">
                  Alignment Engine
                </p>
              </div>
            )}
          </button>

          {/* Desktop Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={onToggle}
            className={`hidden lg:flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer shrink-0 ${
              isOpen ? 'h-8 w-8' : 'h-7 w-6'
            }`}
            title={isOpen ? 'Komprimera sidomeny' : 'Expandera sidomeny'}
            aria-label={isOpen ? 'Komprimera sidomeny' : 'Expandera sidomeny'}
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden h-8 w-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
            title="Stäng sidomeny"
            aria-label="Stäng sidomeny"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className={`flex-1 overflow-y-auto ${isOpen ? 'px-3 py-3 space-y-5' : 'px-2 py-3 space-y-3'}`}>
          {sections.map((section, sectionIdx) => (
            <div key={section.title} className="space-y-1">
              {isOpen ? (
                <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-left select-none">
                  {section.title}
                </div>
              ) : (
                sectionIdx > 0 && <div className="mx-2 my-2 border-t border-slate-200/80 dark:border-slate-800" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const badgeSuffix = item.count !== undefined
                  ? ` (${item.count})`
                  : item.metric !== undefined
                    ? ` (${item.metric})`
                    : '';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    title={!isOpen ? `${item.name}${badgeSuffix}` : undefined}
                    aria-label={item.name}
                    className={`relative flex items-center transition-colors duration-150 cursor-pointer ${
                      isOpen
                        ? 'w-full justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-[13px]'
                        : 'w-10 h-10 mx-auto justify-center rounded-xl'
                    } ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-200 font-semibold ring-1 ring-indigo-200/70 dark:ring-indigo-800/60'
                        : 'text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`shrink-0 ${isOpen ? 'w-4 h-4' : 'w-4.5 h-4.5'} ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`} />
                      {isOpen && <span className="truncate font-sans">{item.name}</span>}
                    </div>
                    
                    {isOpen && item.count !== undefined && (
                      <span className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-md shrink-0 ${
                        isActive
                          ? 'bg-indigo-100/80 text-indigo-900 dark:bg-indigo-900/70 dark:text-indigo-200 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {isOpen && item.metric !== undefined && (
                      <span className="text-[11px] font-mono tabular-nums font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shrink-0">
                        {item.metric}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Subtle Strategy Chain Reference Footer */}
        <div className={`border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 shrink-0 ${
          isOpen ? 'px-4 py-3 text-left' : 'py-3 flex justify-center'
        }`}>
          {isOpen ? (
            <span className="block font-medium text-slate-500 dark:text-slate-400 truncate">
              Mål → Målsättning → Projekt → KPI
            </span>
          ) : (
            <span
              className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 select-none"
              title="Mål → Målsättning → Projekt → KPI"
            >
              Hoshin
            </span>
          )}
        </div>
      </aside>
    </>
  );
}
