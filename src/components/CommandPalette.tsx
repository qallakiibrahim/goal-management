/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, KeyboardEvent } from 'react';
import { 
  Search, 
  Target, 
  Briefcase, 
  TrendingUp, 
  RefreshCw, 
  Layers, 
  Settings, 
  Users, 
  Activity, 
  Scale, 
  FileDown, 
  Table, 
  Moon, 
  Sun, 
  Plus, 
  ArrowRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, Project, KPI, KataSession } from '../types';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (viewId: string) => void;
  goals: Goal[];
  projects: Project[];
  kpis: KPI[];
  kataSessions: KataSession[];
  onOpenAddGoal: () => void;
  onOpenAddProject: () => void;
  onOpenAddKpi: () => void;
  onOpenAddKata: () => void;
  onDownloadPdf: () => void;
  onExportCsv: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Vyer' | 'Åtgärder' | 'Mål' | 'Projekt' | 'KPI:er' | 'Kata';
  icon: any;
  action: () => void;
  badge?: string;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  goals,
  projects,
  kpis,
  kataSessions,
  onOpenAddGoal,
  onOpenAddProject,
  onOpenAddKpi,
  onOpenAddKata,
  onDownloadPdf,
  onExportCsv,
  onToggleTheme,
  darkMode
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allItems: SearchItem[] = useMemo(() => {
    const list: SearchItem[] = [];

    // 1. Navigation items
    const navItems = [
      { id: 'view-dashboard', title: 'Dashboard', subtitle: 'Övergripande vy och nyckeltal', icon: Layers, view: 'dashboard' },
      { id: 'view-vsm', title: 'Värdeflödesanalys (VSM)', subtitle: 'Kartlägg processtider och ledtider', icon: Activity, view: 'vsm' },
      { id: 'view-kano', title: 'Kano & CTQ Analys', subtitle: 'Kunderbjudande och kritiska kvalitetsfaktorer', icon: Scale, view: 'kano' },
      { id: 'view-bsc', title: 'Balanced Scorecard', subtitle: 'Balanserad styrning över 4 perspektiv', icon: Users, view: 'bsc' },
      { id: 'view-goals', title: 'Mål', subtitle: 'Företagsövergripande ambitioner och målnivåer', icon: Target, view: 'goals' },
      { id: 'view-projects', title: 'Projekt', subtitle: 'Pågående projektportfölj och milstolpar', icon: Briefcase, view: 'projects' },
      { id: 'view-kpis', title: 'KPI:er', subtitle: 'Nyckeltal och måluppfyllelser', icon: TrendingUp, view: 'kpis' },
      { id: 'view-kata', title: 'Kata Coaching', subtitle: 'Toyota Kata förbättringsexperiment', icon: RefreshCw, view: 'kata' },
      { id: 'view-hierarchy', title: 'Hierarkiredigerare', subtitle: 'Redigera noder från vision till uppgift', icon: Layers, view: 'hierarchy-editor' },
      { id: 'view-members', title: 'Användare & Medlemmar', subtitle: 'Team och roller i organisationen', icon: Users, view: 'members' },
      { id: 'view-settings', title: 'Inställningar', subtitle: 'Profil, språk och återställning', icon: Settings, view: 'settings' }
    ];

    navItems.forEach((n) => {
      list.push({
        id: n.id,
        title: n.title,
        subtitle: n.subtitle,
        category: 'Vyer',
        icon: n.icon,
        action: () => {
          onNavigate(n.view);
          onClose();
        }
      });
    });

    // 2. Quick Actions
    list.push(
      {
        id: 'action-pdf',
        title: 'Ladda ner PDF-rapport',
        subtitle: 'Generera fullständig strategisk statusrapport som PDF',
        category: 'Åtgärder',
        icon: FileDown,
        action: () => {
          onDownloadPdf();
          onClose();
        }
      },
      {
        id: 'action-csv',
        title: 'Exportera till Excel / CSV',
        subtitle: 'Ladda ner rådata för analys i Excel eller Google Sheets',
        category: 'Åtgärder',
        icon: Table,
        action: () => {
          onExportCsv();
          onClose();
        }
      },
      {
        id: 'action-add-goal',
        title: 'Skapa nytt Strategiskt Mål',
        subtitle: 'Definiera ny långsiktig målsättning',
        category: 'Åtgärder',
        icon: Plus,
        action: () => {
          onClose();
          onOpenAddGoal();
        }
      },
      {
        id: 'action-add-project',
        title: 'Skapa nytt Projekt',
        subtitle: 'Starta ett nytt operativt projekt',
        category: 'Åtgärder',
        icon: Plus,
        action: () => {
          onClose();
          onOpenAddProject();
        }
      },
      {
        id: 'action-add-kpi',
        title: 'Definiera nytt KPI',
        subtitle: 'Lägg till ett mätetal och målvärde',
        category: 'Åtgärder',
        icon: Plus,
        action: () => {
          onClose();
          onOpenAddKpi();
        }
      },
      {
        id: 'action-add-kata',
        title: 'Starta ny Kata-session',
        subtitle: 'Registrera experiment och måltillstånd',
        category: 'Åtgärder',
        icon: Plus,
        action: () => {
          onClose();
          onOpenAddKata();
        }
      },
      {
        id: 'action-theme',
        title: darkMode ? 'Växla till ljust läge' : 'Växla till mörkt läge',
        subtitle: 'Byt färgtema i applikationen',
        category: 'Åtgärder',
        icon: darkMode ? Sun : Moon,
        action: () => {
          onToggleTheme();
          onClose();
        }
      }
    );

    // 3. Goals
    goals.forEach((g) => {
      list.push({
        id: `goal-${g.id}`,
        title: g.title,
        subtitle: `${g.category.toUpperCase()} • Framsteg: ${g.progress}% • KPI: ${g.kpi || 'Inget'}`,
        category: 'Mål',
        icon: Target,
        badge: `${g.progress}%`,
        action: () => {
          onNavigate('goals');
          onClose();
        }
      });
    });

    // 4. Projects
    projects.forEach((p) => {
      list.push({
        id: `proj-${p.id}`,
        title: p.title,
        subtitle: `Deadline: ${p.deadline} • Framsteg: ${p.progress}%`,
        category: 'Projekt',
        icon: Briefcase,
        badge: `${p.progress}%`,
        action: () => {
          onNavigate('projects');
          onClose();
        }
      });
    });

    // 5. KPIs
    kpis.forEach((k) => {
      list.push({
        id: `kpi-${k.id}`,
        title: k.title,
        subtitle: `Värde: ${k.value} / Mål: ${k.target} (${k.progress}%)`,
        category: 'KPI:er',
        icon: TrendingUp,
        badge: `${k.progress}%`,
        action: () => {
          onNavigate('kpis');
          onClose();
        }
      });
    });

    // 6. Kata Sessions
    kataSessions.forEach((s) => {
      list.push({
        id: `kata-${s.id}`,
        title: s.title,
        subtitle: `Måltillstånd: ${s.goal} • Framsteg: ${s.progress}%`,
        category: 'Kata',
        icon: RefreshCw,
        badge: `${s.progress}%`,
        action: () => {
          onNavigate('kata');
          onClose();
        }
      });
    });

    return list;
  }, [
    goals,
    projects,
    kpis,
    kataSessions,
    darkMode,
    onNavigate,
    onClose,
    onDownloadPdf,
    onExportCsv,
    onOpenAddGoal,
    onOpenAddProject,
    onOpenAddKpi,
    onOpenAddKata,
    onToggleTheme
  ]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Default view: Show actions and views
      return allItems.filter((i) => i.category === 'Åtgärder' || i.category === 'Vyer');
    }
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[75vh]"
        >
          {/* Search Input Box */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Sök mål, projekt, KPI:er, flikar eller åtgärder... (Esc för att stänga)"
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="p-2 overflow-y-auto flex-1 divide-y divide-slate-50 dark:divide-slate-850">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                Inga resultat matchade &quot;{query}&quot;. Prova ett annat sökord.
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-indigo-900 text-white dark:bg-indigo-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded">
                            {item.category}
                          </span>
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {item.badge && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>
                      )}
                      {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>↑↓ för att navigera</span>
              <span>↵ för att välja</span>
            </div>
            <span>{filteredItems.length} resultat</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
