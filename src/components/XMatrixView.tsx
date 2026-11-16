/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Grid3x3,
  Table2,
  AlertTriangle,
  Filter,
  RotateCcw,
  RefreshCw,
  Target,
  Briefcase,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Info,
  Layers
} from 'lucide-react';
import {
  Goal,
  Objective,
  Project,
  Initiative,
  KPI,
  Member,
  CtqKanoItem,
  MatrixRelation,
  MatrixStrength,
  GoalCategory
} from '../types';
import {
  NorthWingMode,
  CATEGORY_LABELS,
  makeRelationId,
  getEffectiveRelation,
  getGoalObjectiveLink,
  computeXMatrixGaps,
  cycleStrength,
  getStrengthLabel
} from '../utils/xMatrixHelpers';

interface XMatrixViewProps {
  goals: Goal[];
  objectives: Objective[];
  projects: Project[];
  initiatives: Initiative[];
  kpis: KPI[];
  members: Member[];
  ctqKanoItems: CtqKanoItem[];
  matrixRelations: MatrixRelation[];
  onUpsertRelation: (fromId: string, toId: string, strength: MatrixStrength, note?: string) => void;
  onUpdateKpiOwnership: (kpiId: string, ownerId?: string, supportOwnerIds?: string[]) => void;
  onNavigateToView: (view: string) => void;
  onStartKataFromGap: (prefill: { title: string; goal: string; current: string; obstacles: string }) => void;
}

type SelectedItem =
  | { type: 'goal'; id: string }
  | { type: 'objective'; id: string }
  | { type: 'north'; id: string }
  | { type: 'kpi'; id: string }
  | { type: 'member'; id: string }
  | { type: 'cell'; quadrant: 'nw' | 'ne'; fromId: string; toId: string }
  | null;

type ViewTab = 'matrix' | 'table' | 'gaps';

function StrengthDot({
  strength,
  variant = 'teal',
  inherited = false
}: {
  strength: MatrixStrength;
  variant?: 'teal' | 'indigo';
  inherited?: boolean;
}) {
  if (strength === 0) {
    return <span className="text-slate-300 dark:text-slate-700 font-medium text-sm select-none">–</span>;
  }

  const borderColor =
    variant === 'indigo'
      ? 'border-indigo-600 dark:border-indigo-400'
      : 'border-teal-600 dark:border-teal-400';

  const fillBg =
    variant === 'indigo'
      ? 'bg-indigo-600 dark:bg-indigo-400'
      : 'bg-teal-600 dark:bg-teal-400';

  const halfBg =
    variant === 'indigo'
      ? 'linear-gradient(90deg, #4f46e5 50%, transparent 50%)'
      : 'linear-gradient(90deg, #0d9488 50%, transparent 50%)';

  return (
    <span className="relative inline-flex items-center justify-center">
      <span
        className={`w-5 h-5 rounded-full border-2 inline-block transition-transform ${borderColor} ${
          strength === 2 ? fillBg : 'bg-transparent'
        }`}
        style={strength === 1 ? { background: halfBg } : undefined}
        title={getStrengthLabel(strength)}
      />
      {inherited && (
        <span
          className="absolute -top-1 -right-1.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 leading-none"
          title="Ärvt samband från projekthierarkin"
        >
          ↗
        </span>
      )}
    </span>
  );
}

export default function XMatrixView({
  goals,
  objectives,
  projects,
  initiatives,
  kpis,
  members,
  ctqKanoItems,
  matrixRelations,
  onUpsertRelation,
  onUpdateKpiOwnership,
  onNavigateToView,
  onStartKataFromGap
}: XMatrixViewProps) {
  const [viewTab, setViewTab] = useState<ViewTab>('matrix');
  const [northMode, setNorthMode] = useState<NorthWingMode>('projects');
  const [categoryFilter, setCategoryFilter] = useState<'all' | GoalCategory>('all');
  const [onlyStrong, setOnlyStrong] = useState<boolean>(false);
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  // Filtered collections based on BSC category
  const filteredGoals = useMemo(() => {
    if (categoryFilter === 'all') return goals;
    return goals.filter((g) => g.category === categoryFilter);
  }, [goals, categoryFilter]);

  const filteredGoalIds = useMemo(() => new Set(filteredGoals.map((g) => g.id)), [filteredGoals]);

  const filteredObjectives = useMemo(() => {
    if (categoryFilter === 'all') return objectives;
    return objectives.filter((o) => filteredGoalIds.has(o.goalId));
  }, [objectives, categoryFilter, filteredGoalIds]);

  const filteredObjectiveIds = useMemo(
    () => new Set(filteredObjectives.map((o) => o.id)),
    [filteredObjectives]
  );

  const northItems = useMemo(() => {
    if (northMode === 'projects') {
      if (categoryFilter === 'all') return projects;
      return projects.filter((p) => {
        if (p.goalId && filteredGoalIds.has(p.goalId)) return true;
        if (p.objectiveId && filteredObjectiveIds.has(p.objectiveId)) return true;
        // Also include if it has any explicit relation to a filtered objective or KPI
        return matrixRelations.some(
          (r) =>
            r.strength > 0 &&
            ((r.toId === p.id && filteredObjectiveIds.has(r.fromId)) ||
              (r.fromId === p.id && filteredObjectiveIds.has(r.toId)))
        );
      });
    } else {
      if (categoryFilter === 'all') return initiatives;
      const projIds = new Set(
        projects
          .filter(
            (p) =>
              (p.goalId && filteredGoalIds.has(p.goalId)) ||
              (p.objectiveId && filteredObjectiveIds.has(p.objectiveId))
          )
          .map((p) => p.id)
      );
      return initiatives.filter((i) => projIds.has(i.projectId));
    }
  }, [northMode, projects, initiatives, categoryFilter, filteredGoalIds, filteredObjectiveIds, matrixRelations]);

  const filteredKpis = useMemo(() => {
    if (categoryFilter === 'all') return kpis;
    return kpis.filter((k) => !k.category || k.category === categoryFilter);
  }, [kpis, categoryFilter]);

  // All strategic gaps across the entire app
  const gaps = useMemo(
    () =>
      computeXMatrixGaps({
        goals,
        objectives,
        projects,
        initiatives,
        kpis,
        relations: matrixRelations,
        members
      }),
    [goals, objectives, projects, initiatives, kpis, matrixRelations, members]
  );

  // Active strong/medium/weak connection count
  const activeConnectionCount = useMemo(() => {
    let count = 0;
    filteredObjectives.forEach((o) => {
      northItems.forEach((n) => {
        const res = getEffectiveRelation(o.id, n.id, matrixRelations, projects, initiatives, objectives);
        if (res.strength > 0) count++;
      });
    });
    northItems.forEach((n) => {
      filteredKpis.forEach((k) => {
        const res = getEffectiveRelation(n.id, k.id, matrixRelations, projects, initiatives, objectives);
        if (res.strength > 0) count++;
      });
    });
    return count;
  }, [filteredObjectives, northItems, filteredKpis, matrixRelations, projects, initiatives, objectives]);

  // Helper to resolve NW and NE strength respecting `onlyStrong` filter
  const resolveStrength = (fromId: string, toId: string) => {
    const res = getEffectiveRelation(fromId, toId, matrixRelations, projects, initiatives, objectives);
    if (onlyStrong && res.strength !== 2) {
      return { ...res, displayStrength: 0 as MatrixStrength };
    }
    return { ...res, displayStrength: res.strength };
  };

  // Compute cause-effect highlight sets when a node or cell is selected
  const highlightSets = useMemo(() => {
    const goalIds = new Set<string>();
    const objIds = new Set<string>();
    const northIds = new Set<string>();
    const kpiIds = new Set<string>();
    const memberIds = new Set<string>();

    if (!selected) {
      return { active: false, goalIds, objIds, northIds, kpiIds, memberIds };
    }

    if (selected.type === 'goal') {
      goalIds.add(selected.id);
      filteredObjectives.forEach((o) => {
        if (o.goalId === selected.id) {
          objIds.add(o.id);
          northItems.forEach((n) => {
            if (resolveStrength(o.id, n.id).displayStrength > 0) {
              northIds.add(n.id);
              filteredKpis.forEach((k) => {
                if (resolveStrength(n.id, k.id).displayStrength > 0) {
                  kpiIds.add(k.id);
                  if (k.ownerId) memberIds.add(k.ownerId);
                  k.supportOwnerIds?.forEach((m) => memberIds.add(m));
                }
              });
            }
          });
        }
      });
    } else if (selected.type === 'objective') {
      objIds.add(selected.id);
      const obj = filteredObjectives.find((o) => o.id === selected.id);
      if (obj) goalIds.add(obj.goalId);
      northItems.forEach((n) => {
        if (resolveStrength(selected.id, n.id).displayStrength > 0) {
          northIds.add(n.id);
          filteredKpis.forEach((k) => {
            if (resolveStrength(n.id, k.id).displayStrength > 0) {
              kpiIds.add(k.id);
              if (k.ownerId) memberIds.add(k.ownerId);
              k.supportOwnerIds?.forEach((m) => memberIds.add(m));
            }
          });
        }
      });
    } else if (selected.type === 'north') {
      northIds.add(selected.id);
      filteredObjectives.forEach((o) => {
        if (resolveStrength(o.id, selected.id).displayStrength > 0) {
          objIds.add(o.id);
          goalIds.add(o.goalId);
        }
      });
      filteredKpis.forEach((k) => {
        if (resolveStrength(selected.id, k.id).displayStrength > 0) {
          kpiIds.add(k.id);
          if (k.ownerId) memberIds.add(k.ownerId);
          k.supportOwnerIds?.forEach((m) => memberIds.add(m));
        }
      });
    } else if (selected.type === 'kpi') {
      kpiIds.add(selected.id);
      const kpi = filteredKpis.find((k) => k.id === selected.id);
      if (kpi?.ownerId) memberIds.add(kpi.ownerId);
      kpi?.supportOwnerIds?.forEach((m) => memberIds.add(m));
      northItems.forEach((n) => {
        if (resolveStrength(n.id, selected.id).displayStrength > 0) {
          northIds.add(n.id);
          filteredObjectives.forEach((o) => {
            if (resolveStrength(o.id, n.id).displayStrength > 0) {
              objIds.add(o.id);
              goalIds.add(o.goalId);
            }
          });
        }
      });
    } else if (selected.type === 'member') {
      memberIds.add(selected.id);
      filteredKpis.forEach((k) => {
        if (k.ownerId === selected.id || k.supportOwnerIds?.includes(selected.id)) {
          kpiIds.add(k.id);
          northItems.forEach((n) => {
            if (resolveStrength(n.id, k.id).displayStrength > 0) {
              northIds.add(n.id);
              filteredObjectives.forEach((o) => {
                if (resolveStrength(o.id, n.id).displayStrength > 0) {
                  objIds.add(o.id);
                  goalIds.add(o.goalId);
                }
              });
            }
          });
        }
      });
    } else if (selected.type === 'cell') {
      if (selected.quadrant === 'nw') {
        objIds.add(selected.fromId);
        northIds.add(selected.toId);
        const obj = filteredObjectives.find((o) => o.id === selected.fromId);
        if (obj) goalIds.add(obj.goalId);
        filteredKpis.forEach((k) => {
          if (resolveStrength(selected.toId, k.id).displayStrength > 0) kpiIds.add(k.id);
        });
      } else {
        northIds.add(selected.fromId);
        kpiIds.add(selected.toId);
        const kpi = filteredKpis.find((k) => k.id === selected.toId);
        if (kpi?.ownerId) memberIds.add(kpi.ownerId);
        filteredObjectives.forEach((o) => {
          if (resolveStrength(o.id, selected.fromId).displayStrength > 0) {
            objIds.add(o.id);
            goalIds.add(o.goalId);
          }
        });
      }
    }

    return { active: true, goalIds, objIds, northIds, kpiIds, memberIds };
  }, [selected, filteredObjectives, northItems, filteredKpis, matrixRelations, projects, initiatives, objectives, onlyStrong]);

  const handleCellClick = (quadrant: 'nw' | 'ne', fromId: string, toId: string) => {
    const isAlreadySelected =
      selected?.type === 'cell' &&
      selected.quadrant === quadrant &&
      selected.fromId === fromId &&
      selected.toId === toId;

    const current = getEffectiveRelation(fromId, toId, matrixRelations, projects, initiatives, objectives);
    if (isAlreadySelected) {
      const nextStrength = cycleStrength(current.strength);
      onUpsertRelation(fromId, toId, nextStrength, current.note);
    } else {
      setSelected({ type: 'cell', quadrant, fromId, toId });
      setNoteDraft(current.note || '');
    }
  };

  const handleOwnerToggle = (kpi: KPI, memberId: string) => {
    const currentSupport = kpi.supportOwnerIds || [];
    if (kpi.ownerId === memberId) {
      // Primary -> Support
      onUpdateKpiOwnership(kpi.id, undefined, [...currentSupport, memberId]);
    } else if (currentSupport.includes(memberId)) {
      // Support -> None
      onUpdateKpiOwnership(
        kpi.id,
        kpi.ownerId,
        currentSupport.filter((id) => id !== memberId)
      );
    } else {
      // None -> Primary
      onUpdateKpiOwnership(kpi.id, memberId, currentSupport);
    }
  };

  // Dynamic dimensions for the 3x3 board
  const objCount = Math.max(filteredObjectives.length, 1);
  const kpiCount = Math.max(filteredKpis.length, 1);
  const northCount = Math.max(northItems.length, 1);
  const goalCount = Math.max(filteredGoals.length, 1);
  const topHeight = Math.max(210, northCount * 54);
  const bottomHeight = Math.max(210, goalCount * 58);

  // Selected entity lookup for Inspector
  const inspectorContent = useMemo(() => {
    if (!selected) return null;

    if (selected.type === 'cell') {
      const fromNode =
        selected.quadrant === 'nw'
          ? objectives.find((o) => o.id === selected.fromId)
          : northItems.find((n) => n.id === selected.fromId);
      const toNode =
        selected.quadrant === 'nw'
          ? northItems.find((n) => n.id === selected.toId)
          : kpis.find((k) => k.id === selected.toId);
      const rel = getEffectiveRelation(
        selected.fromId,
        selected.toId,
        matrixRelations,
        projects,
        initiatives,
        objectives
      );
      return { kind: 'cell' as const, fromNode, toNode, rel, quadrant: selected.quadrant };
    }

    if (selected.type === 'goal') {
      const goal = goals.find((g) => g.id === selected.id);
      if (!goal) return null;
      const linkedKano = ctqKanoItems.filter((c) => c.associatedGoalId === goal.id);
      const childObjs = objectives.filter((o) => o.goalId === goal.id);
      return { kind: 'goal' as const, goal, linkedKano, childObjs };
    }

    if (selected.type === 'objective') {
      const objective = objectives.find((o) => o.id === selected.id);
      if (!objective) return null;
      const parentGoal = goals.find((g) => g.id === objective.goalId);
      const linkedNorth = northItems.filter(
        (n) => getEffectiveRelation(objective.id, n.id, matrixRelations, projects, initiatives, objectives).strength > 0
      );
      return { kind: 'objective' as const, objective, parentGoal, linkedNorth };
    }

    if (selected.type === 'north') {
      const item = northItems.find((n) => n.id === selected.id);
      if (!item) return null;
      const linkedKano = ctqKanoItems.filter((c) => c.associatedProjectId === item.id);
      const linkedObjs = objectives.filter(
        (o) => getEffectiveRelation(o.id, item.id, matrixRelations, projects, initiatives, objectives).strength > 0
      );
      const linkedKpis = kpis.filter(
        (k) => getEffectiveRelation(item.id, k.id, matrixRelations, projects, initiatives, objectives).strength > 0
      );
      return { kind: 'north' as const, item, linkedKano, linkedObjs, linkedKpis };
    }

    if (selected.type === 'kpi') {
      const kpi = kpis.find((k) => k.id === selected.id);
      if (!kpi) return null;
      const owner = members.find((m) => m.id === kpi.ownerId);
      const drivingNorth = northItems.filter(
        (n) => getEffectiveRelation(n.id, kpi.id, matrixRelations, projects, initiatives, objectives).strength > 0
      );
      return { kind: 'kpi' as const, kpi, owner, drivingNorth };
    }

    if (selected.type === 'member') {
      const member = members.find((m) => m.id === selected.id);
      if (!member) return null;
      const primaryKpis = kpis.filter((k) => k.ownerId === member.id);
      const supportKpis = kpis.filter((k) => k.supportOwnerIds?.includes(member.id));
      return { kind: 'member' as const, member, primaryKpis, supportKpis };
    }

    return null;
  }, [selected, objectives, northItems, kpis, goals, ctqKanoItems, members, matrixRelations, projects, initiatives]);

  return (
    <div className="space-y-6 text-left">
      {/* 1. Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Hoshin Kanri X-Matris
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Helhetsöversikt av orsak–verkan mellan långsiktiga mål, delmål, projekt, KPI:er och ansvar.
          </p>
        </div>

        {/* Segmented View Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 self-start">
          <button
            type="button"
            onClick={() => setViewTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              viewTab === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            <span>X-Matris</span>
          </button>
          <button
            type="button"
            onClick={() => setViewTab('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              viewTab === 'table'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Relationstabell</span>
          </button>
          <button
            type="button"
            onClick={() => setViewTab('gaps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              viewTab === 'gaps'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${gaps.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span>Gap-analys ({gaps.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metrics Strip (Single-Elevation, Tabular Numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Långsiktiga Mål · Delmål</div>
          <div className="text-xl font-display font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {filteredGoals.length} <span className="text-sm font-normal text-slate-400">/ {filteredObjectives.length}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {northMode === 'projects' ? 'Projekt' : 'Initiativ'} · KPI:er
          </div>
          <div className="text-xl font-display font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {northItems.length} <span className="text-sm font-normal text-slate-400">/ {filteredKpis.length}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Aktiva Samband i Vy</div>
          <div className="text-xl font-display font-bold text-teal-700 dark:text-teal-400 mt-1 tabular-nums">
            {activeConnectionCount} st
          </div>
        </div>
        <button
          type="button"
          onClick={() => setViewTab('gaps')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 rounded-xl p-4 text-left transition cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Strategiska Gap</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div
            className={`text-xl font-display font-bold mt-1 tabular-nums ${
              gaps.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {gaps.length} {gaps.length === 0 ? '· Balanserad' : 'att åtgärda'}
          </div>
        </button>
      </div>

      {/* 3. Filter & Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as 'all' | GoalCategory);
                setSelected(null);
              }}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
              aria-label="Filtrera BSC-perspektiv"
            >
              <option value="all">Alla BSC-perspektiv</option>
              <option value="financial">Finansiellt</option>
              <option value="customer">Kund & Marknad</option>
              <option value="process">Interna Processer</option>
              <option value="learning">Lärande & Förnyelse</option>
            </select>
          </div>

          {/* North Wing Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setNorthMode('projects');
                setSelected(null);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                northMode === 'projects'
                  ? 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Projekt ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setNorthMode('initiatives');
                setSelected(null);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                northMode === 'initiatives'
                  ? 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Initiativ ({initiatives.length})
            </button>
          </div>

          {/* Strong Only Toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            <input
              type="checkbox"
              checked={onlyStrong}
              onChange={(e) => setOnlyStrong(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Endast starka samband (●)</span>
          </label>
        </div>

        {/* Legend & Reset */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <StrengthDot strength={2} /> Stark
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StrengthDot strength={1} /> Medel
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StrengthDot strength={0.5} /> Svag
            </span>
          </div>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Rensa fokus
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN CONTENT BY TAB */}
      {viewTab === 'matrix' && (
        <div className="space-y-4">
          {filteredGoals.length === 0 && filteredObjectives.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-display font-bold text-slate-800 dark:text-white">
                Inga mål eller delmål matchar valt perspektiv
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Välj &quot;Alla BSC-perspektiv&quot; eller lägg till ett strategiskt mål och delmål för att bygga upp X-matrisen.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className="px-3.5 py-2 bg-indigo-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Visa alla perspektiv
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToView('goals')}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Gå till Mål
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 overflow-x-auto">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Klicka på valfri rad eller kolumn för att spåra orsak–verkan-kedjan. Klicka på en korsningsprick för att inspektera, och klicka igen för att växla styrka.
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Tips: På smal skärm kan du skrolla sidled eller byta till Relationstabell.
                </span>
              </div>

              {/* 3x3 Hoshin Kanri CSS Grid */}
              <div
                className="grid border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900"
                style={{
                  minWidth: `${Math.max(1020, 340 + objCount * 56 + kpiCount * 56)}px`,
                  gridTemplateColumns: `minmax(${Math.max(250, objCount * 52)}px, 1fr) minmax(320px, 1.15fr) minmax(${Math.max(260, kpiCount * 52)}px, 1fr)`,
                  gridTemplateRows: `${topHeight}px 290px ${bottomHeight}px`
                }}
              >
                {/* [1,1] NORTH-WEST: Objectives (cols) x Projects/Initiatives (rows) */}
                <div
                  className="grid border-r border-b border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950/40"
                  style={{
                    gridTemplateColumns: `repeat(${objCount}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${northCount}, minmax(0, 1fr))`
                  }}
                >
                  {northItems.length === 0 || filteredObjectives.length === 0 ? (
                    <div className="col-span-full row-span-full flex items-center justify-center text-[11px] text-slate-400 p-3 text-center">
                      Saknar delmål eller {northMode === 'projects' ? 'projekt' : 'initiativ'}
                    </div>
                  ) : (
                    northItems.map((nItem) =>
                      filteredObjectives.map((obj) => {
                        const res = resolveStrength(obj.id, nItem.id);
                        const isChosen =
                          selected?.type === 'cell' &&
                          selected.quadrant === 'nw' &&
                          selected.fromId === obj.id &&
                          selected.toId === nItem.id;
                        const isRelated =
                          highlightSets.active &&
                          highlightSets.objIds.has(obj.id) &&
                          highlightSets.northIds.has(nItem.id);
                        const isMuted = highlightSets.active && !isRelated && !isChosen;

                        return (
                          <button
                            key={`nw-${nItem.id}-${obj.id}`}
                            type="button"
                            onClick={() => handleCellClick('nw', obj.id, nItem.id)}
                            className={`border-r border-b border-slate-200 dark:border-slate-800 flex items-center justify-center transition cursor-pointer focus-visible:outline-2 focus-visible:outline-teal-600 ${
                              isChosen
                                ? 'bg-teal-100/90 dark:bg-teal-900/60 ring-2 ring-inset ring-teal-600'
                                : isRelated
                                ? 'bg-teal-50/80 dark:bg-teal-950/50'
                                : 'hover:bg-teal-50/60 dark:hover:bg-slate-800'
                            } ${isMuted ? 'opacity-35' : ''}`}
                            title={`${obj.title} ↔ ${nItem.title}: ${getStrengthLabel(res.strength)}`}
                          >
                            <StrengthDot strength={res.displayStrength} inherited={res.isInherited} />
                          </button>
                        );
                      })
                    )
                  )}
                </div>

                {/* [1,2] NORTH WING: Projects or Initiatives */}
                <div
                  className="grid border-r border-b border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60"
                  style={{ gridTemplateRows: `repeat(${northCount}, minmax(0, 1fr))` }}
                >
                  {northItems.length === 0 ? (
                    <div className="flex items-center justify-center text-xs text-slate-400 p-4">
                      Inga {northMode === 'projects' ? 'projekt' : 'initiativ'} registrerade
                    </div>
                  ) : (
                    northItems.map((item, idx) => {
                      const isSel = selected?.type === 'north' && selected.id === item.id;
                      const isRel = highlightSets.active && highlightSets.northIds.has(item.id);
                      const isMuted = highlightSets.active && !isRel;
                      const code = `${northMode === 'projects' ? 'P' : 'I'}${idx + 1}`;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelected({ type: 'north', id: item.id })}
                          className={`border-b border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex items-center gap-2.5 text-left transition cursor-pointer min-w-0 ${
                            isSel
                              ? 'bg-violet-100/70 dark:bg-violet-950/50 ring-2 ring-inset ring-violet-500/70'
                              : isRel
                              ? 'bg-violet-50/80 dark:bg-violet-950/30'
                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                          } ${isMuted ? 'opacity-35' : ''}`}
                        >
                          <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-1.5 py-0.5 rounded shrink-0">
                            {code}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate flex-1">
                            {item.title}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                            {item.progress}%
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* [1,3] NORTH-EAST: Projects/Initiatives (rows) x KPIs (cols) */}
                <div
                  className="grid border-b border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950/40"
                  style={{
                    gridTemplateColumns: `repeat(${kpiCount}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${northCount}, minmax(0, 1fr))`
                  }}
                >
                  {northItems.length === 0 || filteredKpis.length === 0 ? (
                    <div className="col-span-full row-span-full flex items-center justify-center text-[11px] text-slate-400 p-3 text-center">
                      Saknar KPI:er eller {northMode === 'projects' ? 'projekt' : 'initiativ'}
                    </div>
                  ) : (
                    northItems.map((nItem) =>
                      filteredKpis.map((kpi) => {
                        const res = resolveStrength(nItem.id, kpi.id);
                        const isChosen =
                          selected?.type === 'cell' &&
                          selected.quadrant === 'ne' &&
                          selected.fromId === nItem.id &&
                          selected.toId === kpi.id;
                        const isRelated =
                          highlightSets.active &&
                          highlightSets.northIds.has(nItem.id) &&
                          highlightSets.kpiIds.has(kpi.id);
                        const isMuted = highlightSets.active && !isRelated && !isChosen;

                        return (
                          <button
                            key={`ne-${nItem.id}-${kpi.id}`}
                            type="button"
                            onClick={() => handleCellClick('ne', nItem.id, kpi.id)}
                            className={`border-r border-b border-slate-200 dark:border-slate-800 flex items-center justify-center transition cursor-pointer focus-visible:outline-2 focus-visible:outline-teal-600 ${
                              isChosen
                                ? 'bg-teal-100/90 dark:bg-teal-900/60 ring-2 ring-inset ring-teal-600'
                                : isRelated
                                ? 'bg-teal-50/80 dark:bg-teal-950/50'
                                : 'hover:bg-teal-50/60 dark:hover:bg-slate-800'
                            } ${isMuted ? 'opacity-35' : ''}`}
                            title={`${nItem.title} ↔ ${kpi.title}: ${getStrengthLabel(res.strength)}`}
                          >
                            <StrengthDot strength={res.displayStrength} inherited={res.isInherited} />
                          </button>
                        );
                      })
                    )
                  )}
                </div>

                {/* [2,1] WEST WING: Annual/Operational Objectives (Vertical Columns) */}
                <div
                  className="grid border-r border-b border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60"
                  style={{ gridTemplateColumns: `repeat(${objCount}, minmax(0, 1fr))` }}
                >
                  {filteredObjectives.length === 0 ? (
                    <div className="flex items-center justify-center text-xs text-slate-400 p-3 text-center">
                      Inga delmål
                    </div>
                  ) : (
                    filteredObjectives.map((obj, idx) => {
                      const isSel = selected?.type === 'objective' && selected.id === obj.id;
                      const isRel = highlightSets.active && highlightSets.objIds.has(obj.id);
                      const isMuted = highlightSets.active && !isRel;
                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setSelected({ type: 'objective', id: obj.id })}
                          className={`border-r border-slate-200/80 dark:border-slate-800 px-1 py-3 flex flex-col items-center justify-between gap-2 transition cursor-pointer min-w-0 ${
                            isSel
                              ? 'bg-amber-100/70 dark:bg-amber-950/45 ring-2 ring-inset ring-amber-500/70'
                              : isRel
                              ? 'bg-amber-50/80 dark:bg-amber-950/25'
                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                          } ${isMuted ? 'opacity-35' : ''}`}
                          title={obj.title}
                        >
                          <span className="font-mono text-[10px] font-bold text-amber-800/85 dark:text-amber-300/90">
                            O{idx + 1}
                          </span>
                          <span
                            className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-tight overflow-hidden text-ellipsis max-h-[190px]"
                            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                          >
                            {obj.title}
                          </span>
                          <span className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                            {obj.progress}%
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* [2,2] CENTER X-CORE (SVG Diamond / Quadrant Compass) */}
                <div className="relative border-r border-b border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 320 290" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    {/* Top: North Wing (Projects/Initiatives) */}
                    <polygon points="0,0 320,0 160,145" className="fill-[#645c84] dark:fill-[#4a4463]" />
                    {/* Left: West Wing (Objectives) */}
                    <polygon points="0,0 160,145 0,290" className="fill-[#a68346] dark:fill-[#7d6235]" />
                    {/* Right: East Wing (KPIs) */}
                    <polygon points="320,0 320,290 160,145" className="fill-[#43786a] dark:fill-[#335c51]" />
                    {/* Bottom: South Wing (Goals) */}
                    <polygon points="0,290 160,145 320,290" className="fill-[#3f507a] dark:fill-[#303d5e]" />
                    {/* Crisp Subtle X Hairlines */}
                    <line x1="0" y1="0" x2="320" y2="290" stroke="white" strokeWidth="2" strokeOpacity="0.75" />
                    <line x1="320" y1="0" x2="0" y2="290" stroke="white" strokeWidth="2" strokeOpacity="0.75" />
                  </svg>

                  {/* Direction Labels */}
                  <span className="absolute top-3.5 left-1/2 -translate-x-1/2 z-10 text-xs font-display font-bold text-white/95 tracking-wide pointer-events-none select-none whitespace-nowrap">
                    {northMode === 'projects' ? 'Projekt (Hur)' : 'Initiativ (Hur)'}
                  </span>
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-xs font-display font-bold text-white/95 tracking-wide pointer-events-none select-none whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    Delmål (Vad)
                  </span>
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-xs font-display font-bold text-white/95 tracking-wide pointer-events-none select-none whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl' }}
                  >
                    KPI:er (Mätning)
                  </span>
                  <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 text-xs font-display font-bold text-white/95 tracking-wide pointer-events-none select-none whitespace-nowrap">
                    Långsiktiga Mål (Varför)
                  </span>

                  {/* Center Hub Emblem */}
                  <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center shadow-md max-w-[165px]">
                    <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-indigo-300 tracking-wider">
                      HOSHIN KANRI
                    </div>
                    <div className="text-sm font-display font-bold text-slate-900 dark:text-white">
                      X-Matris
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                      {activeConnectionCount} samband · {gaps.length} gap
                    </div>
                  </div>
                </div>

                {/* [2,3] EAST WING: KPIs (Vertical Columns) */}
                <div
                  className="grid border-b border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60"
                  style={{ gridTemplateColumns: `repeat(${kpiCount}, minmax(0, 1fr))` }}
                >
                  {filteredKpis.length === 0 ? (
                    <div className="flex items-center justify-center text-xs text-slate-400 p-3 text-center">
                      Inga KPI:er
                    </div>
                  ) : (
                    filteredKpis.map((kpi, idx) => {
                      const isSel = selected?.type === 'kpi' && selected.id === kpi.id;
                      const isRel = highlightSets.active && highlightSets.kpiIds.has(kpi.id);
                      const isMuted = highlightSets.active && !isRel;
                      return (
                        <button
                          key={kpi.id}
                          type="button"
                          onClick={() => setSelected({ type: 'kpi', id: kpi.id })}
                          className={`border-r border-slate-200/80 dark:border-slate-800 px-1 py-3 flex flex-col items-center justify-between gap-2 transition cursor-pointer min-w-0 ${
                            isSel
                              ? 'bg-emerald-100/70 dark:bg-emerald-950/45 ring-2 ring-inset ring-emerald-500/70'
                              : isRel
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/25'
                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                          } ${isMuted ? 'opacity-35' : ''}`}
                          title={`${kpi.title} (${kpi.value} / ${kpi.target})`}
                        >
                          <span className="font-mono text-[10px] font-bold text-emerald-800/85 dark:text-emerald-300/90">
                            K{idx + 1}
                          </span>
                          <span
                            className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-tight overflow-hidden text-ellipsis max-h-[190px]"
                            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                          >
                            {kpi.title}
                          </span>
                          <span className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                            {kpi.progress}%
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* [3,1] SOUTH-WEST: Goals (rows) x Objectives (cols) */}
                <div
                  className="grid border-r border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950/40"
                  style={{
                    gridTemplateColumns: `repeat(${objCount}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${goalCount}, minmax(0, 1fr))`
                  }}
                >
                  {filteredGoals.length === 0 || filteredObjectives.length === 0 ? (
                    <div className="col-span-full row-span-full flex items-center justify-center text-[11px] text-slate-400 p-3 text-center">
                      Kopplar Mål ↔ Delmål
                    </div>
                  ) : (
                    filteredGoals.map((goal) =>
                      filteredObjectives.map((obj) => {
                        const strength = getGoalObjectiveLink(goal, obj);
                        const isRelated =
                          highlightSets.active &&
                          highlightSets.goalIds.has(goal.id) &&
                          highlightSets.objIds.has(obj.id);
                        const isMuted = highlightSets.active && !isRelated;

                        return (
                          <button
                            key={`sw-${goal.id}-${obj.id}`}
                            type="button"
                            onClick={() => setSelected({ type: 'objective', id: obj.id })}
                            className={`border-r border-b border-slate-200 dark:border-slate-800 flex items-center justify-center transition cursor-pointer ${
                              isRelated
                                ? 'bg-indigo-50/90 dark:bg-indigo-950/50'
                                : 'hover:bg-indigo-50/50 dark:hover:bg-slate-800'
                            } ${isMuted ? 'opacity-35' : ''}`}
                            title={`${goal.title} ↔ ${obj.title}: ${strength === 2 ? 'Direkt delmål' : 'Ej kopplad'}`}
                          >
                            <StrengthDot strength={strength} variant="indigo" />
                          </button>
                        );
                      })
                    )
                  )}
                </div>

                {/* [3,2] SOUTH WING: Long-Term Breakthrough Goals */}
                <div
                  className="grid border-r border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60"
                  style={{ gridTemplateRows: `repeat(${goalCount}, minmax(0, 1fr))` }}
                >
                  {filteredGoals.length === 0 ? (
                    <div className="flex items-center justify-center text-xs text-slate-400 p-4">
                      Inga långsiktiga mål
                    </div>
                  ) : (
                    filteredGoals.map((goal, idx) => {
                      const isSel = selected?.type === 'goal' && selected.id === goal.id;
                      const isRel = highlightSets.active && highlightSets.goalIds.has(goal.id);
                      const isMuted = highlightSets.active && !isRel;
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => setSelected({ type: 'goal', id: goal.id })}
                          className={`border-b border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex items-center gap-2.5 text-left transition cursor-pointer min-w-0 ${
                            isSel
                              ? 'bg-indigo-100/70 dark:bg-indigo-950/50 ring-2 ring-inset ring-indigo-500/70'
                              : isRel
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/30'
                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                          } ${isMuted ? 'opacity-35' : ''}`}
                        >
                          <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-1.5 py-0.5 rounded shrink-0">
                            G{idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {goal.title}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {CATEGORY_LABELS[goal.category]} · {goal.deadline}
                            </div>
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                            {goal.progress}%
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* [3,3] SOUTH-EAST: Cross-Functional KPI Ownership Matrix */}
                <div className="bg-slate-50/70 dark:bg-slate-950/50 p-3 flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
                    <div>
                      <div className="text-xs font-display font-bold text-slate-800 dark:text-slate-100">
                        Ägarskap & Ansvar (KPI)
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {members.length > 0 ? '● Huvudansvar · ○ Stöd (klicka för att växla)' : 'Bjud in teammedlemmar för personligt ägarskap'}
                      </div>
                    </div>
                    {members.length === 0 && (
                      <button
                        type="button"
                        onClick={() => onNavigateToView('members')}
                        className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 hover:underline whitespace-nowrap cursor-pointer"
                      >
                        Lägg till team →
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-auto">
                    {members.length > 0 ? (
                      <table className="w-full text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <th className="text-left py-1 pr-2 font-semibold">KPI</th>
                            {members.map((m) => (
                              <th key={m.id} className="text-center py-1 px-1 font-semibold">
                                <button
                                  type="button"
                                  onClick={() => setSelected({ type: 'member', id: m.id })}
                                  className={`hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer truncate max-w-[68px] ${
                                    selected?.type === 'member' && selected.id === m.id
                                      ? 'text-indigo-700 dark:text-indigo-300 underline'
                                      : ''
                                  }`}
                                  title={`${m.name} (${m.role})`}
                                >
                                  {m.name.split(' ')[0]}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredKpis.map((kpi, idx) => (
                            <tr key={kpi.id} className="border-b border-slate-200/60 dark:border-slate-800/60">
                              <td className="py-1.5 pr-2 font-medium text-slate-700 dark:text-slate-200 truncate max-w-[125px]">
                                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 mr-1">
                                  K{idx + 1}
                                </span>
                                {kpi.title}
                              </td>
                              {members.map((m) => {
                                const isPrimary = kpi.ownerId === m.id;
                                const isSupport = kpi.supportOwnerIds?.includes(m.id);
                                return (
                                  <td key={m.id} className="text-center py-1 px-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOwnerToggle(kpi, m.id)}
                                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition cursor-pointer ${
                                        isPrimary
                                          ? 'bg-indigo-600 text-white font-bold'
                                          : isSupport
                                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold'
                                          : 'text-slate-300 dark:text-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                                      }`}
                                      title={
                                        isPrimary
                                          ? `${m.name}: Huvudansvarig`
                                          : isSupport
                                          ? `${m.name}: Stödansvarig`
                                          : `Tilldela ${m.name}`
                                      }
                                    >
                                      {isPrimary ? '●' : isSupport ? '○' : '·'}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <th className="text-left py-1 pr-2 font-semibold">KPI</th>
                            <th className="text-left py-1 px-1 font-semibold">Perspektiv</th>
                            <th className="text-right py-1 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredKpis.map((kpi, idx) => (
                            <tr key={kpi.id} className="border-b border-slate-200/60 dark:border-slate-800/60">
                              <td className="py-1.5 pr-2 font-medium text-slate-700 dark:text-slate-200 truncate max-w-[130px]">
                                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 mr-1">
                                  K{idx + 1}
                                </span>
                                {kpi.title}
                              </td>
                              <td className="py-1.5 px-1 text-slate-500 dark:text-slate-400">
                                {kpi.category ? CATEGORY_LABELS[kpi.category] : 'Generell'}
                              </td>
                              <td className="py-1.5 text-right font-mono font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                                {kpi.progress}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. INSPECTOR PANEL */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            {!inspectorContent ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>
                    Välj valfritt mål, delmål, projekt, KPI eller en prick i matrisen ovan för att inspektera hela orsak–verkan-kedjan och redigera samband.
                  </span>
                </div>
                {gaps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setViewTab('gaps')}
                    className="text-amber-700 dark:text-amber-400 font-semibold hover:underline whitespace-nowrap cursor-pointer"
                  >
                    Granska {gaps.length} upptäckta strategiska gap →
                  </button>
                )}
              </div>
            ) : inspectorContent.kind === 'cell' ? (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                      {inspectorContent.quadrant === 'nw' ? 'Koppling: Delmål ↔ Projekt/Initiativ' : 'Koppling: Projekt/Initiativ ↔ KPI'}
                      {inspectorContent.rel.isInherited && ' · Ärvd koppling från hierarkin'}
                    </div>
                    <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white mt-0.5">
                      {inspectorContent.fromNode?.title} <span className="text-slate-400 mx-1">↔</span> {inspectorContent.toNode?.title}
                    </h3>
                  </div>

                  {/* Direct Strength Selector */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {([2, 1, 0.5, 0] as MatrixStrength[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (inspectorContent.fromNode && inspectorContent.toNode) {
                            onUpsertRelation(inspectorContent.fromNode.id, inspectorContent.toNode.id, s, noteDraft);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          inspectorContent.rel.strength === s
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 text-teal-800 dark:text-teal-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <StrengthDot strength={s} />
                        <span>{getStrengthLabel(s)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rationale Note Editor */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Motivering (t.ex. varför driver detta projekt just denna KPI?)..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (inspectorContent.fromNode && inspectorContent.toNode) {
                        onUpsertRelation(
                          inspectorContent.fromNode.id,
                          inspectorContent.toNode.id,
                          inspectorContent.rel.strength,
                          noteDraft
                        );
                      }
                    }}
                    className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                  >
                    Spara motivering
                  </button>
                </div>
              </div>
            ) : inspectorContent.kind === 'goal' ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                    Långsiktigt Mål · {CATEGORY_LABELS[inspectorContent.goal.category]} · {inspectorContent.goal.progress}%
                  </div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    {inspectorContent.goal.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{inspectorContent.goal.description}</p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    Nedbrutna delmål: <strong>{inspectorContent.childObjs.length} st</strong> · Kopplade Kano/CTQ-krav:{' '}
                    <strong>{inspectorContent.linkedKano.length} st</strong>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('goals')}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Öppna i Mål
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onStartKataFromGap({
                        title: `Accelerera mål: ${inspectorContent.goal.title}`,
                        goal: `Lyft "${inspectorContent.goal.title}" från ${inspectorContent.goal.progress}% till 100%`,
                        current: `Nuvarande framsteg är ${inspectorContent.goal.progress}% (${inspectorContent.childObjs.length} delmål).`,
                        obstacles: 'Säkerställ att kopplade projekt driver avsedd KPI-effekt.'
                      })
                    }
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Starta Kata
                  </button>
                </div>
              </div>
            ) : inspectorContent.kind === 'objective' ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    Delmål · Mål: {inspectorContent.parentGoal?.title || 'Ej kopplad'} · {inspectorContent.objective.progress}%
                  </div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    {inspectorContent.objective.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{inspectorContent.objective.description}</p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    Stöttande {northMode === 'projects' ? 'projekt' : 'initiativ'}:{' '}
                    <strong>{inspectorContent.linkedNorth.map((n) => n.title).join(', ') || 'Inga kopplade ännu'}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToView('hierarchy-editor')}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Redigera i Hierarki
                </button>
              </div>
            ) : inspectorContent.kind === 'north' ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-violet-700 dark:text-violet-400">
                    {northMode === 'projects' ? 'Operativt Projekt' : 'Initiativ'} · {inspectorContent.item.progress}% klart
                  </div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    {inspectorContent.item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{inspectorContent.item.description}</p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    Stöttar delmål: <strong>{inspectorContent.linkedObjs.length} st</strong> · Påverkar KPI:er:{' '}
                    <strong>{inspectorContent.linkedKpis.map((k) => k.title).join(', ') || 'Inga kopplade ännu'}</strong>
                    {inspectorContent.linkedKano.length > 0 && (
                      <> · Kano-krav: <strong>{inspectorContent.linkedKano.length} st</strong></>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('projects')}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Öppna i Projekt
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onStartKataFromGap({
                        title: `Experiment för ${inspectorContent.item.title}`,
                        goal: `Öka genomslag och framdrift för "${inspectorContent.item.title}"`,
                        current: `Aktuell framdrift: ${inspectorContent.item.progress}%`,
                        obstacles: 'Identifiera och eliminera det största hindret i nästa sprint.'
                      })
                    }
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Starta Kata
                  </button>
                </div>
              </div>
            ) : inspectorContent.kind === 'kpi' ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    KPI · Nuläge: {inspectorContent.kpi.value} / Mål: {inspectorContent.kpi.target} ({inspectorContent.kpi.progress}%)
                  </div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    {inspectorContent.kpi.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Huvudägare: <strong>{inspectorContent.owner?.name || 'Ej tilldelad'}</strong> · Drivande{' '}
                    {northMode === 'projects' ? 'projekt' : 'initiativ'}:{' '}
                    <strong>{inspectorContent.drivingNorth.map((n) => n.title).join(', ') || 'Saknas'}</strong>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('kpis')}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Öppna i KPI:er
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onStartKataFromGap({
                        title: `Lyft KPI: ${inspectorContent.kpi.title}`,
                        goal: `Nå målvärdet ${inspectorContent.kpi.target} för "${inspectorContent.kpi.title}"`,
                        current: `Nuläge: ${inspectorContent.kpi.value} (${inspectorContent.kpi.progress}%)`,
                        obstacles: 'Saknar tillräckligt starka åtgärder i X-matrisen.'
                      })
                    }
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Starta Kata
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                  Ansvarig Teammedlem · {inspectorContent.member.role}
                </div>
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                  {inspectorContent.member.name}
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Huvudansvar för <strong>{inspectorContent.primaryKpis.length} KPI:er</strong> · Stödansvar för{' '}
                  <strong>{inspectorContent.supportKpis.length} KPI:er</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPACT RELATION TABLE FALLBACK */}
      {viewTab === 'table' && (
        <div className="space-y-6">
          {/* Table A: Objectives <-> North Items */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-x-auto">
            <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white mb-3">
              Delmål ↔ {northMode === 'projects' ? 'Projekt' : 'Initiativ'} (Nordväst)
            </h3>
            <table className="w-full text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="text-left py-2 pr-4 font-semibold">Delmål</th>
                  <th className="text-left py-2 pr-4 font-semibold">{northMode === 'projects' ? 'Projekt' : 'Initiativ'}</th>
                  <th className="text-left py-2 pr-4 font-semibold">Kopplingsstyrka</th>
                  <th className="text-left py-2 font-semibold">Motivering</th>
                </tr>
              </thead>
              <tbody>
                {filteredObjectives.flatMap((obj) =>
                  northItems.map((nItem) => {
                    const res = getEffectiveRelation(
                      obj.id,
                      nItem.id,
                      matrixRelations,
                      projects,
                      initiatives,
                      objectives
                    );
                    return (
                      <tr key={`tbl-nw-${obj.id}-${nItem.id}`} className="border-b border-slate-100 dark:border-slate-800/70">
                        <td className="py-2.5 pr-4 font-medium text-slate-800 dark:text-slate-200">{obj.title}</td>
                        <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">{nItem.title}</td>
                        <td className="py-2.5 pr-4">
                          <select
                            value={res.strength}
                            onChange={(e) =>
                              onUpsertRelation(obj.id, nItem.id, Number(e.target.value) as MatrixStrength, res.note)
                            }
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                          >
                            <option value={0}>– Ingen</option>
                            <option value={0.5}>○ Svag</option>
                            <option value={1}>◐ Medel</option>
                            <option value={2}>● Stark</option>
                          </select>
                        </td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{res.note || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table B: North Items <-> KPIs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-x-auto">
            <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white mb-3">
              {northMode === 'projects' ? 'Projekt' : 'Initiativ'} ↔ KPI:er (Nordost)
            </h3>
            <table className="w-full text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="text-left py-2 pr-4 font-semibold">{northMode === 'projects' ? 'Projekt' : 'Initiativ'}</th>
                  <th className="text-left py-2 pr-4 font-semibold">KPI</th>
                  <th className="text-left py-2 pr-4 font-semibold">Påverkan</th>
                  <th className="text-left py-2 font-semibold">Motivering</th>
                </tr>
              </thead>
              <tbody>
                {northItems.flatMap((nItem) =>
                  filteredKpis.map((kpi) => {
                    const res = getEffectiveRelation(
                      nItem.id,
                      kpi.id,
                      matrixRelations,
                      projects,
                      initiatives,
                      objectives
                    );
                    return (
                      <tr key={`tbl-ne-${nItem.id}-${kpi.id}`} className="border-b border-slate-100 dark:border-slate-800/70">
                        <td className="py-2.5 pr-4 font-medium text-slate-800 dark:text-slate-200">{nItem.title}</td>
                        <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">{kpi.title}</td>
                        <td className="py-2.5 pr-4">
                          <select
                            value={res.strength}
                            onChange={(e) =>
                              onUpsertRelation(nItem.id, kpi.id, Number(e.target.value) as MatrixStrength, res.note)
                            }
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                          >
                            <option value={0}>– Ingen</option>
                            <option value={0.5}>○ Svag</option>
                            <option value={1}>◐ Medel</option>
                            <option value={2}>● Stark</option>
                          </select>
                        </td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{res.note || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIONABLE GAP ANALYSIS */}
      {viewTab === 'gaps' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Strategisk Gap-analys utifrån X-Matrisen
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Identifierar automatiskt mål utan projektstöd, projekt utan KPI-koppling och KPI:er utan ägare.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 tabular-nums">
              {gaps.length} upptäckta avvikelser
            </span>
          </div>

          {gaps.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-display font-bold text-slate-900 dark:text-white">
                Full strategisk täckning!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Alla mål har nedbrutna delmål och projekt, alla projekt påverkar minst en KPI, och samtliga KPI:er har tydliga ägare.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {gaps.map((gap) => (
                <div key={gap.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          gap.severity === 'critical'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {gap.severity === 'critical' ? 'Kritisk brist' : 'Varning'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{gap.entityTitle}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{gap.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {gap.entityType === 'kpi' && gap.id.includes('no-owner') && members.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => onNavigateToView('members')}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Bjud in teammedlem
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setViewTab('matrix')}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Visa i X-Matris
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onStartKataFromGap({
                          title: gap.suggestedKataTitle,
                          goal: gap.suggestedKataGoal,
                          current: gap.message,
                          obstacles: 'Saknad koppling eller ägarskap i Hoshin X-matrisen.'
                        })
                      }
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Starta Kata
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
