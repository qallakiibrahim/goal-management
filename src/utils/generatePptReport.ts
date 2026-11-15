/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import PptxGenJS from 'pptxgenjs';
import {
  Goal,
  Objective,
  Project,
  Initiative,
  Task,
  KPI,
  KataSession,
  UserProfile,
  MatrixRelation,
  Member
} from '../types';
import { computeXMatrixGaps } from './xMatrixHelpers';

export interface GeneratePptOptions {
  goals: Goal[];
  objectives?: Objective[];
  projects: Project[];
  initiatives?: Initiative[];
  tasks?: Task[];
  kpis: KPI[];
  kataSessions?: KataSession[];
  matrixRelations?: MatrixRelation[];
  members?: Member[];
  userProfile?: UserProfile;
}

const CATEGORY_LABELS: Record<string, string> = {
  financial: 'Finansiellt',
  customer: 'Kund & Marknad',
  process: 'Interna Processer',
  learning: 'Lärande & Förnyelse'
};

const CATEGORY_COLORS: Record<string, string> = {
  financial: '059669',
  customer: '2563EB',
  process: 'D97706',
  learning: 'DB2777'
};

const PALETTE = {
  navy: '1E1B4B',
  indigo: '4F46E5',
  indigoLight: 'EEF2FF',
  teal: '0F766E',
  emerald: '059669',
  violet: '7C3AED',
  rose: 'E11D48',
  amber: 'D97706',
  slate900: '0F172A',
  slate700: '334155',
  slate500: '64748B',
  slate200: 'E2E8F0',
  slate100: 'F1F5F9',
  canvas: 'F8FAFC',
  white: 'FFFFFF'
};

function addSlideHeader(slide: PptxGenJS.Slide, title: string, subtitle: string, pageNum: number, totalPages: number) {
  slide.background = { color: PALETTE.canvas };

  // Top accent strip
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 10,
    h: 0.08,
    fill: { color: PALETTE.indigo },
    line: { color: PALETTE.indigo, width: 0 }
  });

  // Header band
  slide.addShape('rect', {
    x: 0,
    y: 0.08,
    w: 10,
    h: 0.82,
    fill: { color: PALETTE.white },
    line: { color: PALETTE.slate200, width: 0.5 }
  });

  slide.addText(title, {
    x: 0.5,
    y: 0.16,
    w: 7.5,
    h: 0.36,
    fontFace: 'Calibri',
    fontSize: 18,
    bold: true,
    color: PALETTE.navy
  });

  slide.addText(subtitle, {
    x: 0.5,
    y: 0.52,
    w: 7.5,
    h: 0.28,
    fontFace: 'Calibri',
    fontSize: 10,
    color: PALETTE.slate500
  });

  // Brand badge top right
  slide.addText('MÅLRAMVERK', {
    x: 8.1,
    y: 0.24,
    w: 1.4,
    h: 0.24,
    fontFace: 'Calibri',
    fontSize: 9,
    bold: true,
    color: PALETTE.indigo,
    align: 'right'
  });

  // Footer
  const dateStr = new Date().toLocaleDateString('sv-SE');
  slide.addText(`Strategisk Statusrapport · ${dateStr}`, {
    x: 0.5,
    y: 5.3,
    w: 6,
    h: 0.24,
    fontFace: 'Calibri',
    fontSize: 8.5,
    color: PALETTE.slate500
  });

  slide.addText(`Sida ${pageNum} av ${totalPages}`, {
    x: 8.2,
    y: 5.3,
    w: 1.3,
    h: 0.24,
    fontFace: 'Calibri',
    fontSize: 8.5,
    bold: true,
    color: PALETTE.slate500,
    align: 'right'
  });
}

function truncate(str: string | undefined, max = 56): string {
  if (!str) return '—';
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

export async function generateStrategicPptReport({
  goals,
  objectives = [],
  projects,
  initiatives = [],
  kpis,
  kataSessions = [],
  matrixRelations = [],
  members = [],
  userProfile
}: GeneratePptOptions): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 in
  pptx.author = userProfile?.name || 'MålRamverk';
  pptx.company = 'MålRamverk Alignment Engine';
  pptx.title = 'Strategisk Statusrapport';
  pptx.subject = 'Hoshin Kanri, Balanced Scorecard, Projektportfölj & Toyota Kata';

  const totalSlides = 5;
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
    : 0;
  const avgProjectProgress = projects.length > 0
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
    : 0;
  const avgKpiProgress = kpis.length > 0
    ? Math.round(kpis.reduce((s, k) => s + k.progress, 0) / kpis.length)
    : 0;
  const activeLinks = matrixRelations.filter((r) => r.strength > 0);
  const gaps = computeXMatrixGaps({
    goals,
    objectives,
    projects,
    initiatives,
    kpis,
    relations: matrixRelations,
    members
  });

  const todayFormatted = new Date().toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // =========================================================
  // SLIDE 1: EXECUTIVE COVER
  // =========================================================
  const cover = pptx.addSlide();
  cover.background = { color: PALETTE.navy };

  // Left vertical accent bar
  cover.addShape('rect', {
    x: 0,
    y: 0,
    w: 0.22,
    h: 5.625,
    fill: { color: PALETTE.indigo },
    line: { color: PALETTE.indigo, width: 0 }
  });

  // Right decorative accent block
  cover.addShape('rect', {
    x: 7.4,
    y: 0,
    w: 2.6,
    h: 5.625,
    fill: { color: '272262' },
    line: { color: '272262', width: 0 }
  });

  cover.addText('MÅLRAMVERK · ALIGNMENT ENGINE', {
    x: 0.8,
    y: 1.05,
    w: 6.2,
    h: 0.3,
    fontFace: 'Calibri',
    fontSize: 11,
    bold: true,
    color: 'A5B4FC',
    charSpacing: 2
  });

  cover.addText('Strategisk\nStatusrapport', {
    x: 0.8,
    y: 1.45,
    w: 6.3,
    h: 1.5,
    fontFace: 'Calibri',
    fontSize: 40,
    bold: true,
    color: PALETTE.white,
    lineSpacingMultiple: 1.05
  });

  cover.addText('Hoshin Kanri · Balanced Scorecard · Projektportfölj · KPI & Toyota Kata', {
    x: 0.8,
    y: 3.1,
    w: 6.3,
    h: 0.4,
    fontFace: 'Calibri',
    fontSize: 13,
    color: 'C7D2FE'
  });

  // Cover metadata footer box
  cover.addShape('roundRect', {
    x: 0.8,
    y: 4.15,
    w: 6.1,
    h: 0.9,
    rectRadius: 0.08,
    fill: { color: '2E296E' },
    line: { color: '4338CA', width: 0.75 }
  });

  cover.addText(
    `Datum: ${todayFormatted}\nRapportör: ${userProfile?.name || 'Administratör'} (${userProfile?.role || 'Verksamhetsledare'})`,
    {
      x: 1.0,
      y: 4.25,
      w: 5.7,
      h: 0.7,
      fontFace: 'Calibri',
      fontSize: 11,
      color: 'E0E7FF',
      valign: 'middle'
    }
  );

  // Right column snapshot metrics on cover
  const coverMetrics = [
    { label: 'STRATEGISKA MÅL', val: `${goals.length} st`, sub: `Snitt ${avgGoalProgress}%` },
    { label: 'PÅGÅENDE PROJEKT', val: `${projects.length} st`, sub: `Snitt ${avgProjectProgress}%` },
    { label: 'KPI-UPPFYLLNAD', val: `${avgKpiProgress}%`, sub: `${kpis.length} mätetal` },
    { label: 'X-MATRIS SAMBAND', val: `${activeLinks.length} st`, sub: `${gaps.length} gap` }
  ];

  coverMetrics.forEach((m, i) => {
    const yPos = 1.05 + i * 1.05;
    cover.addShape('roundRect', {
      x: 7.7,
      y: yPos,
      w: 1.95,
      h: 0.86,
      rectRadius: 0.06,
      fill: { color: '312B7A' },
      line: { color: '4F46E5', width: 0.5 }
    });
    cover.addText(m.label, {
      x: 7.82,
      y: yPos + 0.08,
      w: 1.7,
      h: 0.2,
      fontFace: 'Calibri',
      fontSize: 7.5,
      bold: true,
      color: 'A5B4FC'
    });
    cover.addText(m.val, {
      x: 7.82,
      y: yPos + 0.28,
      w: 1.7,
      h: 0.3,
      fontFace: 'Calibri',
      fontSize: 18,
      bold: true,
      color: PALETTE.white
    });
    cover.addText(m.sub, {
      x: 7.82,
      y: yPos + 0.6,
      w: 1.7,
      h: 0.18,
      fontFace: 'Calibri',
      fontSize: 8.5,
      color: 'C7D2FE'
    });
  });

  // =========================================================
  // SLIDE 2: EXECUTIVE SUMMARY & BALANCED SCORECARD
  // =========================================================
  const slide2 = pptx.addSlide();
  addSlideHeader(
    slide2,
    'Översikt & Balanced Scorecard (BSC)',
    'Samlad lägesbild över organisationens fyra strategiska perspektiv',
    2,
    totalSlides
  );

  const summaryKpis = [
    { title: 'AKTIVA MÅL', value: `${goals.length}`, note: `${avgGoalProgress}% snittuppfyllnad`, accent: PALETTE.indigo },
    { title: 'PROJEKTPORTFÖLJ', value: `${projects.length}`, note: `${avgProjectProgress}% leveransgrad`, accent: PALETTE.violet },
    { title: 'KPI-UPPFYLLNAD', value: `${avgKpiProgress}%`, note: `${kpis.length} aktiva nyckeltal`, accent: PALETTE.emerald },
    { title: 'KATA-CYKLER', value: `${kataSessions.length}`, note: 'PDCA-experiment loggade', accent: PALETTE.rose }
  ];

  summaryKpis.forEach((card, idx) => {
    const xPos = 0.5 + idx * 2.28;
    slide2.addShape('roundRect', {
      x: xPos,
      y: 1.12,
      w: 2.12,
      h: 1.05,
      rectRadius: 0.06,
      fill: { color: PALETTE.white },
      line: { color: PALETTE.slate200, width: 0.75 }
    });
    slide2.addShape('rect', {
      x: xPos,
      y: 1.12,
      w: 2.12,
      h: 0.06,
      fill: { color: card.accent },
      line: { color: card.accent, width: 0 }
    });
    slide2.addText(card.title, {
      x: xPos + 0.14,
      y: 1.24,
      w: 1.84,
      h: 0.22,
      fontFace: 'Calibri',
      fontSize: 8.5,
      bold: true,
      color: PALETTE.slate500
    });
    slide2.addText(card.value, {
      x: xPos + 0.14,
      y: 1.48,
      w: 1.84,
      h: 0.36,
      fontFace: 'Calibri',
      fontSize: 22,
      bold: true,
      color: PALETTE.slate900
    });
    slide2.addText(card.note, {
      x: xPos + 0.14,
      y: 1.88,
      w: 1.84,
      h: 0.2,
      fontFace: 'Calibri',
      fontSize: 9,
      color: PALETTE.slate500
    });
  });

  // 4 BSC Perspective cards
  slide2.addText('BALANCED SCORECARD — PERSPEKTIVBALANS', {
    x: 0.5,
    y: 2.38,
    w: 9,
    h: 0.26,
    fontFace: 'Calibri',
    fontSize: 10,
    bold: true,
    color: PALETTE.slate700
  });

  const categories: Array<'financial' | 'customer' | 'process' | 'learning'> = [
    'financial',
    'customer',
    'process',
    'learning'
  ];

  categories.forEach((cat, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = 0.5 + col * 4.6;
    const yPos = 2.72 + row * 1.22;
    const catGoals = goals.filter((g) => g.category === cat);
    const catKpis = kpis.filter((k) => k.category === cat);
    const pct = catKpis.length > 0
      ? Math.round(catKpis.reduce((s, k) => s + k.progress, 0) / catKpis.length)
      : catGoals.length > 0
        ? Math.round(catGoals.reduce((s, g) => s + g.progress, 0) / catGoals.length)
        : 0;
    const accent = CATEGORY_COLORS[cat];

    slide2.addShape('roundRect', {
      x: xPos,
      y: yPos,
      w: 4.4,
      h: 1.08,
      rectRadius: 0.06,
      fill: { color: PALETTE.white },
      line: { color: PALETTE.slate200, width: 0.75 }
    });
    slide2.addShape('rect', {
      x: xPos,
      y: yPos,
      w: 0.08,
      h: 1.08,
      fill: { color: accent },
      line: { color: accent, width: 0 }
    });
    slide2.addText(CATEGORY_LABELS[cat], {
      x: xPos + 0.2,
      y: yPos + 0.14,
      w: 2.8,
      h: 0.28,
      fontFace: 'Calibri',
      fontSize: 12.5,
      bold: true,
      color: PALETTE.slate900
    });
    slide2.addText(`${pct}%`, {
      x: xPos + 3.2,
      y: yPos + 0.12,
      w: 1.0,
      h: 0.3,
      fontFace: 'Calibri',
      fontSize: 15,
      bold: true,
      color: accent,
      align: 'right'
    });
    slide2.addText(`${catGoals.length} mål · ${catKpis.length} KPI:er`, {
      x: xPos + 0.2,
      y: yPos + 0.44,
      w: 3.9,
      h: 0.22,
      fontFace: 'Calibri',
      fontSize: 9.5,
      color: PALETTE.slate500
    });

    // Progress bar track + fill
    slide2.addShape('roundRect', {
      x: xPos + 0.2,
      y: yPos + 0.76,
      w: 4.0,
      h: 0.12,
      rectRadius: 0.04,
      fill: { color: PALETTE.slate100 },
      line: { color: PALETTE.slate100, width: 0 }
    });
    if (pct > 0) {
      slide2.addShape('roundRect', {
        x: xPos + 0.2,
        y: yPos + 0.76,
        w: Math.max(0.14, (4.0 * Math.min(pct, 100)) / 100),
        h: 0.12,
        rectRadius: 0.04,
        fill: { color: accent },
        line: { color: accent, width: 0 }
      });
    }
  });

  // =========================================================
  // SLIDE 3: STRATEGISKA MÅL & HOSHIN KANRI X-MATRIS
  // =========================================================
  const slide3 = pptx.addSlide();
  addSlideHeader(
    slide3,
    'Strategiska Mål & Hoshin Kanri X-Matris',
    'Koppling mellan långsiktiga målvisioner, korskopplingar och strategiska glapp',
    3,
    totalSlides
  );

  slide3.addText('STRATEGISKA MÅLVISIONER', {
    x: 0.5,
    y: 1.08,
    w: 5.5,
    h: 0.26,
    fontFace: 'Calibri',
    fontSize: 10,
    bold: true,
    color: PALETTE.slate700
  });

  const goalRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Målvision', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.navy } } },
      { text: 'Perspektiv', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.navy } } },
      { text: 'Mål-KPI', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.navy } } },
      { text: 'Status', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.navy }, align: 'right' } }
    ],
    ...goals.slice(0, 6).map((g, i): PptxGenJS.TableRow => [
      { text: truncate(g.title, 34), options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: PALETTE.slate900, bold: true } },
      { text: CATEGORY_LABELS[g.category] || g.category, options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: PALETTE.slate700 } },
      { text: truncate(g.kpi, 24), options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: PALETTE.slate700 } },
      { text: `${g.progress}%`, options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: PALETTE.indigo, bold: true, align: 'right' as const } }
    ])
  ];

  slide3.addTable(goalRows, {
    x: 0.5,
    y: 1.38,
    w: 5.6,
    colW: [2.2, 1.3, 1.35, 0.75],
    fontFace: 'Calibri',
    fontSize: 9.5,
    border: { type: 'solid', color: PALETTE.slate200, pt: 0.5 },
    margin: [5, 6, 5, 6]
  });

  // Right side: X-Matrix Summary & Gap Analysis card
  slide3.addText('X-MATRIS SAMBAND & GAP-ANALYS', {
    x: 6.35,
    y: 1.08,
    w: 3.15,
    h: 0.26,
    fontFace: 'Calibri',
    fontSize: 10,
    bold: true,
    color: PALETTE.teal
  });

  slide3.addShape('roundRect', {
    x: 6.35,
    y: 1.38,
    w: 3.15,
    h: 3.72,
    rectRadius: 0.08,
    fill: { color: PALETTE.white },
    line: { color: PALETTE.slate200, width: 0.75 }
  });

  const strongCount = activeLinks.filter((r) => r.strength === 2).length;
  const mediumCount = activeLinks.filter((r) => r.strength === 1).length;
  const weakCount = activeLinks.filter((r) => r.strength === 0.5).length;

  slide3.addText(`${activeLinks.length}`, {
    x: 6.55,
    y: 1.54,
    w: 1.2,
    h: 0.42,
    fontFace: 'Calibri',
    fontSize: 26,
    bold: true,
    color: PALETTE.teal
  });
  slide3.addText('Aktiva\nkorskopplingar', {
    x: 7.45,
    y: 1.56,
    w: 1.9,
    h: 0.4,
    fontFace: 'Calibri',
    fontSize: 10,
    color: PALETTE.slate700
  });

  slide3.addText(
    `• Starka samband (●): ${strongCount} st\n• Medelstarka (◐): ${mediumCount} st\n• Svaga samband (○): ${weakCount} st`,
    {
      x: 6.55,
      y: 2.12,
      w: 2.75,
      h: 0.72,
      fontFace: 'Calibri',
      fontSize: 10,
      color: PALETTE.slate700,
      lineSpacingMultiple: 1.25
    }
  );

  slide3.addShape('line', {
    x: 6.55,
    y: 2.95,
    w: 2.75,
    h: 0,
    line: { color: PALETTE.slate200, width: 0.75 }
  });

  slide3.addText(
    gaps.length === 0 ? 'INGA STRATEGISKA GLAPP' : `UPPTÄCKTA GLAPP (${gaps.length} ST)`,
    {
      x: 6.55,
      y: 3.08,
      w: 2.75,
      h: 0.24,
      fontFace: 'Calibri',
      fontSize: 9,
      bold: true,
      color: gaps.length === 0 ? PALETTE.emerald : PALETTE.amber
    }
  );

  const gapText = gaps.length === 0
    ? 'Samtliga mål, delmål, projekt och KPI:er är sammanlänkade utan strategiska glapp.'
    : gaps.slice(0, 4).map((g) => `• ${truncate(`${g.entityTitle}: ${g.message}`, 46)}`).join('\n');

  slide3.addText(gapText, {
    x: 6.55,
    y: 3.36,
    w: 2.75,
    h: 1.55,
    fontFace: 'Calibri',
    fontSize: 9.5,
    color: PALETTE.slate700,
    lineSpacingMultiple: 1.25,
    valign: 'top'
  });

  // =========================================================
  // SLIDE 4: PROJEKTPORTFÖLJ & KPI-UPPFÖLJNING
  // =========================================================
  const slide4 = pptx.addSlide();
  addSlideHeader(
    slide4,
    'Projektportfölj & KPI-uppföljning',
    'Operativ leveransstatus och nyckeltalens utveckling mot uppsatta mål',
    4,
    totalSlides
  );

  slide4.addText('OPERATIV PROJEKTPORTFÖLJ', {
    x: 0.5,
    y: 1.08,
    w: 4.3,
    h: 0.26,
    fontFace: 'Calibri',
    fontSize: 10,
    bold: true,
    color: PALETTE.slate700
  });

  const projectRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Projekt', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.violet } } },
      { text: 'Deadline', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.violet } } },
      { text: 'Framsteg', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.violet }, align: 'right' } }
    ],
    ...projects.slice(0, 7).map((p, i): PptxGenJS.TableRow => [
      { text: truncate(p.title, 30), options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: PALETTE.slate900, bold: true } },
      { text: truncate(p.deadline, 14), options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: PALETTE.slate700 } },
      { text: `${p.progress}%`, options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: p.progress >= 70 ? PALETTE.emerald : PALETTE.violet, bold: true, align: 'right' as const } }
    ])
  ];

  slide4.addTable(projectRows, {
    x: 0.5,
    y: 1.38,
    w: 4.35,
    colW: [2.45, 1.1, 0.8],
    fontFace: 'Calibri',
    fontSize: 9.5,
    border: { type: 'solid', color: PALETTE.slate200, pt: 0.5 },
    margin: [5, 6, 5, 6]
  });

  slide4.addText('NYCKELTAL (KPI:ER)', {
    x: 5.15,
    y: 1.08,
    w: 4.35,
    h: 0.26,
    fontFace: 'Calibri',
    fontSize: 10,
    bold: true,
    color: PALETTE.slate700
  });

  const kpiRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Nyckeltal', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.emerald } } },
      { text: 'Nuläge', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.emerald } } },
      { text: 'Mål', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.emerald } } },
      { text: 'Nivå', options: { bold: true, color: PALETTE.white, fill: { color: PALETTE.emerald }, align: 'right' } }
    ],
    ...kpis.slice(0, 7).map((k, i): PptxGenJS.TableRow => [
      { text: truncate(k.title, 26), options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: PALETTE.slate900, bold: true } },
      { text: truncate(k.value, 10), options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: PALETTE.slate700 } },
      { text: truncate(k.target, 10), options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: PALETTE.slate700 } },
      { text: `${k.progress}%`, options: { fill: { color: i % 2 === 0 ? PALETTE.white : PALETTE.slate100 }, color: k.progress >= 75 ? PALETTE.emerald : PALETTE.amber, bold: true, align: 'right' as const } }
    ])
  ];

  slide4.addTable(kpiRows, {
    x: 5.15,
    y: 1.38,
    w: 4.35,
    colW: [2.0, 0.8, 0.8, 0.75],
    fontFace: 'Calibri',
    fontSize: 9.5,
    border: { type: 'solid', color: PALETTE.slate200, pt: 0.5 },
    margin: [5, 6, 5, 6]
  });

  // =========================================================
  // SLIDE 5: TOYOTA KATA & NÄSTA STEG
  // =========================================================
  const slide5 = pptx.addSlide();
  addSlideHeader(
    slide5,
    'Toyota Kata · Pågående Förbättringsexperiment',
    'Strukturerade PDCA-cykler för att undanröja hinder och driva måluppfyllnad',
    5,
    totalSlides
  );

  if (kataSessions.length === 0) {
    slide5.addShape('roundRect', {
      x: 0.5,
      y: 1.35,
      w: 9.0,
      h: 2.2,
      rectRadius: 0.08,
      fill: { color: PALETTE.white },
      line: { color: PALETTE.slate200, width: 0.75 }
    });
    slide5.addText('Inga Kata-sessioner registrerade ännu', {
      x: 0.8,
      y: 1.85,
      w: 8.4,
      h: 0.4,
      fontFace: 'Calibri',
      fontSize: 16,
      bold: true,
      color: PALETTE.slate900,
      align: 'center'
    });
    slide5.addText(
      'Skapa er första Toyota Kata-session i appen för att dokumentera måltillstånd, hinder och experimentella lärdomar.',
      {
        x: 1.2,
        y: 2.35,
        w: 7.6,
        h: 0.5,
        fontFace: 'Calibri',
        fontSize: 11,
        color: PALETTE.slate500,
        align: 'center'
      }
    );
  } else {
    kataSessions.slice(0, 3).forEach((session, idx) => {
      const xPos = 0.5 + idx * 3.08;
      slide5.addShape('roundRect', {
        x: xPos,
        y: 1.18,
        w: 2.88,
        h: 3.9,
        rectRadius: 0.08,
        fill: { color: PALETTE.white },
        line: { color: PALETTE.slate200, width: 0.75 }
      });
      slide5.addShape('rect', {
        x: xPos,
        y: 1.18,
        w: 2.88,
        h: 0.07,
        fill: { color: PALETTE.rose },
        line: { color: PALETTE.rose, width: 0 }
      });

      slide5.addText(truncate(session.title, 34), {
        x: xPos + 0.16,
        y: 1.35,
        w: 2.56,
        h: 0.42,
        fontFace: 'Calibri',
        fontSize: 12,
        bold: true,
        color: PALETTE.slate900,
        valign: 'top'
      });

      slide5.addText(`${session.date}  ·  ${session.progress}% klart`, {
        x: xPos + 0.16,
        y: 1.8,
        w: 2.56,
        h: 0.22,
        fontFace: 'Calibri',
        fontSize: 8.5,
        bold: true,
        color: PALETTE.rose
      });

      const fields = [
        { label: 'MÅLTILLSTÅND', text: session.goal },
        { label: 'HINDER', text: session.obstacles },
        { label: 'NÄSTA EXPERIMENT', text: session.nextStep }
      ];

      fields.forEach((f, fIdx) => {
        const fy = 2.15 + fIdx * 0.94;
        slide5.addText(f.label, {
          x: xPos + 0.16,
          y: fy,
          w: 2.56,
          h: 0.2,
          fontFace: 'Calibri',
          fontSize: 8,
          bold: true,
          color: PALETTE.slate500
        });
        slide5.addText(truncate(f.text, 85), {
          x: xPos + 0.16,
          y: fy + 0.2,
          w: 2.56,
          h: 0.64,
          fontFace: 'Calibri',
          fontSize: 9.5,
          color: PALETTE.slate700,
          valign: 'top'
        });
      });
    });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  await pptx.writeFile({ fileName: `Strategisk_Statusrapport_${dateStr}.pptx` });
}
