/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Goal, Project, KPI, KataSession } from '../types';

export interface ExportCsvData {
  goals: Goal[];
  projects: Project[];
  kpis: KPI[];
  kataSessions: KataSession[];
}

const escapeCsv = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Generates and downloads a multi-section CSV file formatted with UTF-8 BOM for Microsoft Excel
 */
export function exportStrategicCsv({ goals, projects, kpis, kataSessions }: ExportCsvData): void {
  const lines: string[] = [];

  // UTF-8 BOM so Excel opens Swedish characters cleanly
  const BOM = '\uFEFF';

  // Section 1: Overview
  lines.push('=== MÅLRAMVERK STRATEGISK STATUSRAPPORT ===');
  lines.push(`Genererad;${escapeCsv(new Date().toLocaleString('sv-SE'))}`);
  lines.push('');

  // Section 2: Goals (Mål)
  lines.push('--- STRATEGISKA MÅL ---');
  lines.push('ID;Titel;Kategori;Framsteg (%);Nyckeltal (KPI);Deadline;Beskrivning');
  goals.forEach((g) => {
    lines.push(
      [
        escapeCsv(g.id),
        escapeCsv(g.title),
        escapeCsv(g.category),
        escapeCsv(g.progress),
        escapeCsv(g.kpi),
        escapeCsv(g.deadline),
        escapeCsv(g.description)
      ].join(';')
    );
  });
  lines.push('');

  // Section 3: Projects (Projekt)
  lines.push('--- PROJEKTPORTFÖLJ ---');
  lines.push('ID;Titel;Framsteg (%);Deadline;Beskrivning;Kopplat Mål ID');
  projects.forEach((p) => {
    lines.push(
      [
        escapeCsv(p.id),
        escapeCsv(p.title),
        escapeCsv(p.progress),
        escapeCsv(p.deadline),
        escapeCsv(p.description),
        escapeCsv(p.goalId || p.objectiveId || '')
      ].join(';')
    );
  });
  lines.push('');

  // Section 4: KPIs (Nyckeltal)
  lines.push('--- KPI / NYCKELTAL ---');
  lines.push('ID;Titel;Nuvarande Värde;Målvärde (Target);Uppfyllelse (%);Kategori;Deadline');
  kpis.forEach((k) => {
    lines.push(
      [
        escapeCsv(k.id),
        escapeCsv(k.title),
        escapeCsv(k.value),
        escapeCsv(k.target),
        escapeCsv(k.progress),
        escapeCsv(k.category || 'Generell'),
        escapeCsv(k.deadline)
      ].join(';')
    );
  });
  lines.push('');

  // Section 5: Kata Sessions
  if (kataSessions.length > 0) {
    lines.push('--- TOYOTA KATA EXPERIMENT ---');
    lines.push('ID;Titel;Datum;Måltillstånd;Nuläge;Hinder;Nästa Steg;Lärdomar;Framsteg (%)');
    kataSessions.forEach((s) => {
      lines.push(
        [
          escapeCsv(s.id),
          escapeCsv(s.title),
          escapeCsv(s.date),
          escapeCsv(s.goal),
          escapeCsv(s.current),
          escapeCsv(s.obstacles),
          escapeCsv(s.nextStep),
          escapeCsv(s.learnings),
          escapeCsv(s.progress)
        ].join(';')
      );
    });
  }

  const csvContent = BOM + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `strategisk-status-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
