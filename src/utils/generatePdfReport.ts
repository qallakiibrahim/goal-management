/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { Goal, Objective, Project, Initiative, Task, KPI, KataSession, UserProfile } from '../types';

export interface GeneratePdfOptions {
  goals: Goal[];
  objectives?: Objective[];
  projects: Project[];
  initiatives?: Initiative[];
  tasks?: Task[];
  kpis: KPI[];
  kataSessions?: KataSession[];
  userProfile?: UserProfile;
}

const CATEGORY_NAMES: Record<string, string> = {
  financial: 'Finansiellt',
  customer: 'Kund & Marknad',
  process: 'Interna Processer',
  learning: 'Lärande & Förnyelse'
};

/**
 * Generates and triggers download of a high-quality strategic status report as PDF
 */
export function generateStrategicPdfReport({
  goals,
  objectives = [],
  projects,
  initiatives = [],
  tasks = [],
  kpis,
  kataSessions = [],
  userProfile
}: GeneratePdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  const bottomMargin = 20;

  let currentY = 0;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = 16;
      drawSubHeader();
    }
  };

  const drawSubHeader = () => {
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('MÅLRAMVERK — STRATEGISK STATUSRAPPORT', marginX + 3, currentY + 4.8);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toISOString().split('T')[0];
    doc.text(dateStr, marginX + contentWidth - 3, currentY + 4.8, { align: 'right' });
    currentY += 11;
  };

  // ==========================================
  // 1. COVER / EXECUTIVE HEADER BANNER
  // ==========================================
  // Deep navy header background
  doc.setFillColor(30, 27, 75); // #1e1b4b
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Decorative top accent strip
  doc.setFillColor(79, 70, 229); // #4f46e5
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(255, 255, 255);
  doc.text('MÅLRAMVERK', marginX, 16);

  // Subtitle & Purpose
  doc.setFontSize(10.5);
  doc.setTextColor(224, 231, 255);
  doc.text('Strategisk Statusrapport & Operativ Uppföljning', marginX, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(199, 210, 254);
  doc.text('Strukturering av Mål, Projektportfölj, KPI-mätetal & Kata Förbättringsexperiment', marginX, 29);

  // Metadata block (Right side)
  const todayDate = new Date().toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const nowTime = new Date().toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const authorName = userProfile?.name || 'Administratör';
  const authorRole = userProfile?.role || 'Verksamhetsledare';

  doc.setFontSize(7.5);
  doc.setTextColor(224, 231, 255);
  doc.text(`Datum: ${todayDate} kl ${nowTime}`, pageWidth - marginX, 16, { align: 'right' });
  doc.text(`Rapportör: ${authorName} (${authorRole})`, pageWidth - marginX, 22, { align: 'right' });
  doc.text('Status: Aktiv Strategisk Cykel 2026', pageWidth - marginX, 28, { align: 'right' });

  currentY = 48;

  // ==========================================
  // 2. EXECUTIVE SUMMARY CARDS (4-UP METRICS)
  // ==========================================
  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) 
    : 0;
  const avgKpiProgress = kpis.length > 0 
    ? Math.round(kpis.reduce((acc, k) => acc + k.progress, 0) / kpis.length) 
    : 0;
  const avgProjectProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) 
    : 0;

  const summaryCards = [
    {
      title: 'AKTIVA STRATEGISKA MÅL',
      mainValue: `${goals.length} st`,
      subText: `Genomsnittlig måluppfyllelse: ${avgGoalProgress}%`,
      accentR: 79, accentG: 70, accentB: 229 // Indigo
    },
    {
      title: 'PÅGÅENDE PROJEKT',
      mainValue: `${projects.length} st`,
      subText: `Portföljframsteg: ${avgProjectProgress}%`,
      accentR: 124, accentG: 58, accentB: 237 // Violet
    },
    {
      title: 'GENOMSNITTLIG KPI-NIVÅ',
      mainValue: `${avgKpiProgress}%`,
      subText: `${kpis.length} nyckeltal övervakade`,
      accentR: 16, accentG: 185, accentB: 129 // Emerald
    },
    {
      title: 'KATA EXPERIMENT',
      mainValue: `${kataSessions.length} st`,
      subText: 'Kontinuerliga förbättringssteg',
      accentR: 244, accentG: 63, accentB: 94 // Rose
    }
  ];

  const cardWidth = (contentWidth - 3 * 4) / 4; // 4 cards with 4mm gap
  const cardHeight = 22;

  summaryCards.forEach((card, idx) => {
    const cardX = marginX + idx * (cardWidth + 4);
    
    // Card Background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    // Colored left accent bar
    doc.setFillColor(card.accentR, card.accentG, card.accentB);
    doc.rect(cardX, currentY, 2, cardHeight, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.title, cardX + 4.5, currentY + 5.5);

    // Value
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text(card.mainValue, cardX + 4.5, currentY + 12.5);

    // Subtext
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(card.subText, cardX + 4.5, currentY + 17.5);
  });

  currentY += cardHeight + 8;

  // Helper function to render a section heading
  const drawSectionHeader = (title: string, count: number, iconLabel: string) => {
    checkPageBreak(14);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, currentY, contentWidth, 7, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${iconLabel}  ${title.toUpperCase()}`, marginX + 3.5, currentY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(79, 70, 229);
    doc.text(`Totalt: ${count}`, marginX + contentWidth - 4, currentY + 4.8, { align: 'right' });

    currentY += 10;
  };

  // Helper for progress bar
  const drawProgressBar = (x: number, y: number, width: number, height: number, progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    // Track
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x, y, width, height, height / 2, height / 2, 'F');
    // Fill
    if (clampedProgress > 0) {
      if (clampedProgress >= 70) doc.setFillColor(16, 185, 129); // Green
      else if (clampedProgress >= 40) doc.setFillColor(245, 158, 11); // Amber
      else doc.setFillColor(239, 68, 68); // Red
      const fillWidth = (width * clampedProgress) / 100;
      doc.roundedRect(x, y, fillWidth, height, height / 2, height / 2, 'F');
    }
  };

  // ==========================================
  // 3. SECTION 1: STRATEGISKA MÅL (GOALS)
  // ==========================================
  drawSectionHeader('Strategiska Mål & Prioriteringar', goals.length, '1.');

  if (goals.length === 0) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Inga strategiska mål har registrerats ännu.', marginX + 3, currentY + 4);
    currentY += 8;
  } else {
    goals.forEach((goal) => {
      checkPageBreak(19);

      // Goal item container
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginX, currentY, contentWidth, 16.5, 1.5, 1.5, 'FD');

      // Category badge
      const catLabel = CATEGORY_NAMES[goal.category] || goal.category;
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(marginX + 3, currentY + 3, 28, 4.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(67, 56, 202);
      doc.text(catLabel.toUpperCase(), marginX + 4.5, currentY + 6.2);

      // Goal title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const titleTruncated = doc.splitTextToSize(goal.title, 82);
      doc.text(titleTruncated[0] || goal.title, marginX + 34, currentY + 6.3);

      // Description or KPI link
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      const descText = goal.kpi ? `Nyckeltal: ${goal.kpi} | Tidsfrist: ${goal.deadline || '2026-12-31'}` : (goal.description || 'Ingen beskrivning angiven');
      const descTruncated = doc.splitTextToSize(descText, 110);
      doc.text(descTruncated[0], marginX + 3.5, currentY + 12.5);

      // Right-aligned Progress indicator
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`${goal.progress}%`, marginX + contentWidth - 4, currentY + 6.3, { align: 'right' });

      // Progress bar (35mm wide)
      drawProgressBar(marginX + contentWidth - 39, currentY + 9, 35, 2.5, goal.progress);

      currentY += 19;
    });
  }

  currentY += 4;

  // ==========================================
  // 4. SECTION 2: PROJEKTSTATUS (PROJECTS)
  // ==========================================
  drawSectionHeader('Projektportfölj & Status', projects.length, '2.');

  if (projects.length === 0) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Inga projekt har registrerats ännu.', marginX + 3, currentY + 4);
    currentY += 8;
  } else {
    projects.forEach((project) => {
      checkPageBreak(19);

      // Associated goal name
      const associatedGoal = goals.find(g => g.id === project.goalId);
      const associatedObjective = objectives.find(o => o.id === project.objectiveId);
      const linkedContext = associatedGoal ? `Mål: ${associatedGoal.title}` : (associatedObjective ? `Objektiv: ${associatedObjective.title}` : 'Fristående projekt');

      // Connected tasks count
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const completedTasks = projectTasks.filter(t => t.completed).length;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginX, currentY, contentWidth, 16.5, 1.5, 1.5, 'FD');

      // Status Indicator tag (Status badge)
      let statusText = 'PÅGÅENDE';
      let statusBg = [241, 245, 249];
      let statusColor = [71, 85, 105];

      if (project.progress >= 100) {
        statusText = 'KLART';
        statusBg = [236, 253, 245];
        statusColor = [5, 150, 105];
      } else if (project.progress === 0) {
        statusText = 'EJ PÅBÖRJAT';
        statusBg = [254, 242, 242];
        statusColor = [220, 38, 38];
      } else if (project.progress >= 75) {
        statusText = 'NÄRA MÅL';
        statusBg = [240, 253, 244];
        statusColor = [22, 101, 52];
      }

      doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
      doc.roundedRect(marginX + 3, currentY + 3, 22, 4.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(statusText, marginX + 4.5, currentY + 6.2);

      // Project title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(project.title, 85);
      doc.text(titleLines[0] || project.title, marginX + 28, currentY + 6.3);

      // Subtitle / context + tasks
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      const tasksInfo = projectTasks.length > 0 ? ` | Uppgifter: ${completedTasks}/${projectTasks.length} klara` : '';
      const deadlineInfo = project.deadline ? ` | Tidsfrist: ${project.deadline}` : '';
      const subInfo = `${linkedContext}${tasksInfo}${deadlineInfo}`;
      const subLines = doc.splitTextToSize(subInfo, 112);
      doc.text(subLines[0], marginX + 3.5, currentY + 12.5);

      // Right-aligned Progress percentage
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`${project.progress}%`, marginX + contentWidth - 4, currentY + 6.3, { align: 'right' });

      // Progress bar
      drawProgressBar(marginX + contentWidth - 39, currentY + 9, 35, 2.5, project.progress);

      currentY += 19;
    });
  }

  currentY += 4;

  // ==========================================
  // 5. SECTION 3: KPI-VÄRDEN (KEY PERFORMANCE INDICATORS)
  // ==========================================
  drawSectionHeader('KPI-Värden & Måluppfyllelse', kpis.length, '3.');

  if (kpis.length === 0) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Inga KPI:er har definierats ännu.', marginX + 3, currentY + 4);
    currentY += 8;
  } else {
    // Table Header
    checkPageBreak(9);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, currentY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);

    doc.text('NYCKELTAL (KPI)', marginX + 3, currentY + 4.2);
    doc.text('PERSPEKTIV', marginX + 68, currentY + 4.2);
    doc.text('NUVARANDE', marginX + 104, currentY + 4.2);
    doc.text('MÅLVÄRDE (TARGET)', marginX + 125, currentY + 4.2);
    doc.text('UPPFYLLNAD', marginX + contentWidth - 4, currentY + 4.2, { align: 'right' });

    currentY += 7.5;

    // Table rows
    kpis.forEach((kpi, idx) => {
      checkPageBreak(11);

      // Alternating row background
      if (idx % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(250, 250, 250);
      }
      doc.setDrawColor(241, 245, 249);
      doc.rect(marginX, currentY, contentWidth, 9.5, 'FD');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(kpi.title, 62);
      doc.text(titleLines[0] || kpi.title, marginX + 3, currentY + 4.5);

      // Deadline below title if present
      if (kpi.deadline) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Tidsfrist: ${kpi.deadline}`, marginX + 3, currentY + 7.8);
      }

      // Perspective / Category
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      const kpiCat = kpi.category ? (CATEGORY_NAMES[kpi.category] || kpi.category) : 'Generell';
      doc.text(kpiCat, marginX + 68, currentY + 5.5);

      // Current Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(kpi.value || '-', marginX + 104, currentY + 5.5);

      // Target Value
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(kpi.target || '-', marginX + 125, currentY + 5.5);

      // Progress % badge
      let progressR = 239, progressG = 68, progressB = 68; // Red
      if (kpi.progress >= 75) { progressR = 16; progressG = 185; progressB = 129; } // Green
      else if (kpi.progress >= 40) { progressR = 245; progressG = 158; progressB = 11; } // Amber

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(progressR, progressG, progressB);
      doc.text(`${kpi.progress}%`, marginX + contentWidth - 4, currentY + 5.5, { align: 'right' });

      // Mini bar below progress
      drawProgressBar(marginX + contentWidth - 28, currentY + 7, 24, 1.5, kpi.progress);

      currentY += 10.5;
    });
  }

  currentY += 4;

  // ==========================================
  // 6. SECTION 4: KATA EXPERIMENT (OPTIONAL / IF PRESENT)
  // ==========================================
  if (kataSessions.length > 0) {
    drawSectionHeader('Toyota Kata Förbättringsexperiment', kataSessions.length, '4.');

    kataSessions.slice(0, 5).forEach((session) => {
      checkPageBreak(17);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginX, currentY, contentWidth, 14.5, 1.5, 1.5, 'FD');

      // Date / badge
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(marginX + 3, currentY + 2.5, 22, 4, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(225, 29, 72);
      doc.text(session.date || 'LÖPANDE', marginX + 4.5, currentY + 5.3);

      // Session title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(session.title, marginX + 28, currentY + 5.5);

      // Next step & obstacle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      const detail = `Måltillstånd: ${session.goal || '-'} | Nästa steg: ${session.nextStep || '-'}`;
      const detailLines = doc.splitTextToSize(detail, 125);
      doc.text(detailLines[0], marginX + 3.5, currentY + 11);

      // Progress
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${session.progress}%`, marginX + contentWidth - 4, currentY + 5.5, { align: 'right' });
      drawProgressBar(marginX + contentWidth - 34, currentY + 8, 30, 2, session.progress);

      currentY += 16.5;
    });
  }

  // ==========================================
  // 7. FOOTERS (RUNNING PAGE NUMBER & SIGN-OFF)
  // ==========================================
  // Cast internal to retrieve total pages
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer dividing line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 13, marginX + contentWidth, pageHeight - 13);

    // Footer text left
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'MålRamverk Alignment Engine • Strategisk ledningsrapport • Strikt konfidentiellt internt underlag',
      marginX,
      pageHeight - 9
    );

    // Footer text right
    doc.text(
      `Sida ${i} av ${totalPages}`,
      marginX + contentWidth,
      pageHeight - 9,
      { align: 'right' }
    );
  }

  // Generate file name with ISO date
  const isoDate = new Date().toISOString().split('T')[0];
  const filename = `strategisk-statusrapport-${isoDate}.pdf`;

  // Trigger browser download
  doc.save(filename);
}
