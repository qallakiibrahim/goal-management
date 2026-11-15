/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Goal,
  Objective,
  Project,
  Initiative,
  KPI,
  Member,
  MatrixRelation,
  MatrixStrength,
  GoalCategory
} from '../types';

export type NorthWingMode = 'projects' | 'initiatives';

export interface XMatrixGap {
  id: string;
  severity: 'critical' | 'warning';
  entityType: 'goal' | 'objective' | 'project' | 'kpi';
  entityId: string;
  entityTitle: string;
  message: string;
  actionLabel: string;
  suggestedKataTitle: string;
  suggestedKataGoal: string;
}

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  financial: 'Finansiellt',
  customer: 'Kund & Marknad',
  process: 'Interna Processer',
  learning: 'Lärande & Förnyelse'
};

export function makeRelationId(fromId: string, toId: string): string {
  return `mr_${fromId}__${toId}`;
}

/**
 * Resolves the effective correlation strength between two entities.
 * Checks explicit MatrixRelation first, then falls back to structural hierarchy links.
 */
export function getEffectiveRelation(
  fromId: string,
  toId: string,
  relations: MatrixRelation[],
  projects: Project[],
  initiatives: Initiative[],
  objectives: Objective[]
): { strength: MatrixStrength; isInherited: boolean; note?: string } {
  const explicit = relations.find(
    (r) => (r.fromId === fromId && r.toId === toId) || (r.fromId === toId && r.toId === fromId)
  );
  if (explicit) {
    return { strength: explicit.strength, isInherited: false, note: explicit.note };
  }

  // Structural fallback: Objective <-> Project
  const project = projects.find((p) => p.id === toId || p.id === fromId);
  const objective = objectives.find((o) => o.id === fromId || o.id === toId);
  if (project && objective) {
    if (project.objectiveId === objective.id) {
      return { strength: 2, isInherited: true, note: 'Direktkoppling via projekthierarkin' };
    }
    if (project.goalId && project.goalId === objective.goalId) {
      return { strength: 0.5, isInherited: true, note: 'Delar överordnat strategiskt mål' };
    }
  }

  // Structural fallback: Objective <-> Initiative (via Project)
  const initiative = initiatives.find((i) => i.id === toId || i.id === fromId);
  if (initiative && objective) {
    const parentProj = projects.find((p) => p.id === initiative.projectId);
    if (parentProj?.objectiveId === objective.id) {
      return { strength: 1, isInherited: true, note: 'Ärvd via överordnat projekt' };
    }
  }

  return { strength: 0, isInherited: false };
}

/**
 * Resolves Goal <-> Objective link in South-West quadrant.
 */
export function getGoalObjectiveLink(goal: Goal, objective: Objective): MatrixStrength {
  return objective.goalId === goal.id ? 2 : 0;
}

/**
 * Computes real Hoshin Kanri strategic alignment gaps across the entire app state.
 */
export function computeXMatrixGaps(params: {
  goals: Goal[];
  objectives: Objective[];
  projects: Project[];
  initiatives: Initiative[];
  kpis: KPI[];
  relations: MatrixRelation[];
  members: Member[];
}): XMatrixGap[] {
  const { goals, objectives, projects, initiatives, kpis, relations } = params;
  const gaps: XMatrixGap[] = [];

  // 1. Goals without any linked Objective
  goals.forEach((goal) => {
    const childObjectives = objectives.filter((o) => o.goalId === goal.id);
    if (childObjectives.length === 0) {
      gaps.push({
        id: `gap-goal-no-obj-${goal.id}`,
        severity: 'critical',
        entityType: 'goal',
        entityId: goal.id,
        entityTitle: goal.title,
        message: `Målet "${goal.title}" saknar nedbrutna delmål (Objectives) i X-matrisen.`,
        actionLabel: 'Bryt ner mål',
        suggestedKataTitle: `Nedbrytning av ${goal.title}`,
        suggestedKataGoal: `Skapa minst ett mätbart delmål som realiserar "${goal.title}".`
      });
    } else {
      // Check if at least one objective has a strong or medium project link
      const hasProjectSupport = childObjectives.some((obj) =>
        projects.some(
          (proj) => getEffectiveRelation(obj.id, proj.id, relations, projects, initiatives, objectives).strength >= 1
        )
      );
      if (!hasProjectSupport) {
        gaps.push({
          id: `gap-goal-no-proj-${goal.id}`,
          severity: 'critical',
          entityType: 'goal',
          entityId: goal.id,
          entityTitle: goal.title,
          message: `Målet "${goal.title}" saknar starka eller medelstarka projekt i norra vingen.`,
          actionLabel: 'Skapa Kata för gapet',
          suggestedKataTitle: `Säkra projektstöd för ${goal.title}`,
          suggestedKataGoal: `Etablera minst ett operativt projekt med stark koppling till "${goal.title}".`
        });
      }
    }
  });

  // 2. Projects with zero KPI correlations
  projects.forEach((proj) => {
    const linkedKpis = kpis.filter(
      (k) => getEffectiveRelation(proj.id, k.id, relations, projects, initiatives, objectives).strength > 0
    );
    if (linkedKpis.length === 0) {
      gaps.push({
        id: `gap-proj-no-kpi-${proj.id}`,
        severity: 'warning',
        entityType: 'project',
        entityId: proj.id,
        entityTitle: proj.title,
        message: `Projektet "${proj.title}" är inte kopplat till någon KPI — effekten kan inte mätas.`,
        actionLabel: 'Koppla KPI',
        suggestedKataTitle: `Mätbar effekt för ${proj.title}`,
        suggestedKataGoal: `Koppla "${proj.title}" till minst en ledande eller släpande KPI.`
      });
    }
  });

  // 3. KPIs with zero driving projects or without owner
  kpis.forEach((kpi) => {
    const drivingProjects = projects.filter(
      (p) => getEffectiveRelation(p.id, kpi.id, relations, projects, initiatives, objectives).strength >= 1
    );
    if (drivingProjects.length === 0) {
      gaps.push({
        id: `gap-kpi-no-proj-${kpi.id}`,
        severity: 'critical',
        entityType: 'kpi',
        entityId: kpi.id,
        entityTitle: kpi.title,
        message: `KPI:n "${kpi.title}" (${kpi.progress}%) saknar drivande projekt i X-matrisen.`,
        actionLabel: 'Starta Kata',
        suggestedKataTitle: `Lyfta KPI: ${kpi.title}`,
        suggestedKataGoal: `Nå målvärdet ${kpi.target} för "${kpi.title}" genom ett riktat förbättringsprojekt.`
      });
    }
    if (!kpi.ownerId) {
      gaps.push({
        id: `gap-kpi-no-owner-${kpi.id}`,
        severity: 'warning',
        entityType: 'kpi',
        entityId: kpi.id,
        entityTitle: kpi.title,
        message: `KPI:n "${kpi.title}" saknar utpekad huvudägare i ansvarsmatrisen.`,
        actionLabel: 'Tilldela ägare',
        suggestedKataTitle: `Ägarskap för ${kpi.title}`,
        suggestedKataGoal: `Utse en tydlig huvudansvarig för uppföljning av "${kpi.title}".`
      });
    }
  });

  return gaps;
}

export function cycleStrength(current: MatrixStrength): MatrixStrength {
  if (current === 0) return 2;
  if (current === 2) return 1;
  if (current === 1) return 0.5;
  return 0;
}

export function getStrengthLabel(strength: MatrixStrength): string {
  switch (strength) {
    case 2:
      return 'Stark drivkraft';
    case 1:
      return 'Medel / Stödjande';
    case 0.5:
      return 'Svag / Indirekt';
    default:
      return 'Ingen koppling';
  }
}
