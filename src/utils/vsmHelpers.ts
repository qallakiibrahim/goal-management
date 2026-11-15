/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VsmStep {
  id: string;
  name: string;
  processTime: number; // hours
  leadTime: number;    // hours (total wall-clock time including wait time)
  caRate: number;      // Complete & Accurate % (0-100)
  role: string;
  wasteType: 'none' | 'overproduction' | 'waiting' | 'transportation' | 'inventory' | 'motion' | 'overprocessing' | 'defects' | 'talent';
  wasteDescription: string;
  changeoverTime?: number; // hours (C/O - Ställtid)
  uptime?: number;         // percentage 0-100 (Availability - Tillgänglighet)
  inventory?: number;      // quantity (Mellanlager - NVA förvaringslager före stegen)
}

export interface ValueStream {
  id: string;
  name: string;
  description: string;
  steps: VsmStep[];
}

export const DEFAULT_VSM_STREAMS: ValueStream[] = [
  {
    id: 'vs-1',
    name: 'Order till Leverans (Logistik)',
    description: 'Från det att kunden lägger en beställning till dess varan är levererad och mottagen.',
    steps: [
      {
        id: 'step-1-1',
        name: 'Orderregistrering & Verifiering',
        processTime: 0.5,
        leadTime: 4.0,
        caRate: 95,
        role: 'Kundtjänst',
        wasteType: 'overprocessing',
        wasteDescription: 'Dubbelinmatning av data p.g.a. saknad API-integration med CRM.',
        changeoverTime: 0.2,
        uptime: 98,
        inventory: 15
      },
      {
        id: 'step-1-2',
        name: 'Plockning på lager',
        processTime: 1.0,
        leadTime: 24.0,
        caRate: 98,
        role: 'Lagerpersonal',
        wasteType: 'waiting',
        wasteDescription: 'Väntar på manuella utskrifter av plocklistor en gång om dagen.',
        changeoverTime: 0.5,
        uptime: 95,
        inventory: 40
      },
      {
        id: 'step-1-3',
        name: 'Paketering & märkning',
        processTime: 0.3,
        leadTime: 2.0,
        caRate: 100,
        role: 'Lagerpersonal',
        wasteType: 'none',
        wasteDescription: '',
        changeoverTime: 0.1,
        uptime: 100,
        inventory: 5
      },
      {
        id: 'step-1-4',
        name: 'Tullbehandling & Utlastning',
        processTime: 2.0,
        leadTime: 48.0,
        caRate: 90,
        role: 'Speditörör',
        wasteType: 'waiting',
        wasteDescription: 'Tulldeklarationer fastnar ofta för manuell stickprovskontroll.',
        changeoverTime: 1.5,
        uptime: 90,
        inventory: 25
      },
      {
        id: 'step-1-5',
        name: 'Slutleverans till kund',
        processTime: 24.0,
        leadTime: 72.0,
        caRate: 92,
        role: 'Logistikpartner',
        wasteType: 'defects',
        wasteDescription: 'Felaktiga adresser eller bommat leveransförsök kräver omsortering.',
        changeoverTime: 0.0,
        uptime: 99,
        inventory: 0
      }
    ]
  },
  {
    id: 'vs-2',
    name: 'Systemutveckling & Release',
    description: 'Flödet för utveckling av kundunika anpassningar eller nya mjukvaruändringar.',
    steps: [
      {
        id: 'step-2-1',
        name: 'Kravanalys & specifikation',
        processTime: 8.0,
        leadTime: 80.0,
        caRate: 80,
        role: 'Produktägare',
        wasteType: 'talent',
        wasteDescription: 'Krav tas fram utan tillräcklig teknisk avstämning med utvecklingsteam.',
        changeoverTime: 2.0,
        uptime: 100,
        inventory: 3
      },
      {
        id: 'step-2-2',
        name: 'Kodning & Enhetstester',
        processTime: 16.0,
        leadTime: 32.0,
        caRate: 90,
        role: 'Utvecklare',
        wasteType: 'none',
        wasteDescription: '',
        changeoverTime: 0.5,
        uptime: 98,
        inventory: 6
      },
      {
        id: 'step-2-3',
        name: 'Kodgranskning & Integrering',
        processTime: 1.5,
        leadTime: 48.0,
        caRate: 85,
        role: 'Mjukvaruarkitekt',
        wasteType: 'waiting',
        wasteDescription: 'Pull requests ligger i kö p.g.a. tidsbrist hos seniora nyckelpersoner.',
        changeoverTime: 0.2,
        uptime: 100,
        inventory: 12
      },
      {
        id: 'step-2-4',
        name: 'Systemtest & QA verifiering',
        processTime: 4.0,
        leadTime: 40.0,
        caRate: 75,
        role: 'Testutvecklare',
        wasteType: 'defects',
        wasteDescription: 'Hittade regressionstestfel skickas tillbaka för omkodning, vilket skapar loopar.',
        changeoverTime: 1.0,
        uptime: 95,
        inventory: 8
      },
      {
        id: 'step-2-5',
        name: 'Produktionsdriftsättning',
        processTime: 0.5,
        leadTime: 24.0,
        caRate: 99,
        role: 'DevOps',
        wasteType: 'overprocessing',
        wasteDescription: 'Manuella konfigurationsändringar och validering under nattfönster.',
        changeoverTime: 4.0,
        uptime: 90,
        inventory: 1
      }
    ]
  }
];

export function loadVsmStreams(): ValueStream[] {
  if (typeof window === 'undefined') return DEFAULT_VSM_STREAMS;
  try {
    const local = localStorage.getItem('vsm_streams');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local VSM streams, using defaults', e);
  }
  return DEFAULT_VSM_STREAMS;
}

export function summarizeVsmStreamsForAi() {
  const streams = loadVsmStreams();
  return streams.map((stream) => {
    let totalPT = 0;
    let totalLT = 0;
    let rolledCA = 1;
    let bottleneckStep: VsmStep | null = null;
    let maxWait = -1;

    stream.steps.forEach((step) => {
      const pt = Number(step.processTime) || 0;
      const lt = Math.max(Number(step.leadTime) || 0, pt);
      totalPT += pt;
      totalLT += lt;
      rolledCA *= ((Number(step.caRate) || 100) / 100);
      const wait = lt - pt;
      if (wait > maxWait) {
        maxWait = wait;
        bottleneckStep = step;
      }
    });

    const pcePercent = totalLT > 0 ? Number(((totalPT / totalLT) * 100).toFixed(1)) : 0;
    return {
      id: stream.id,
      name: stream.name,
      description: stream.description,
      stepCount: stream.steps.length,
      totalProcessTimeHours: Number(totalPT.toFixed(1)),
      totalLeadTimeHours: Number(totalLT.toFixed(1)),
      pcePercent,
      rolledFirstPassYieldPercent: Number((rolledCA * 100).toFixed(1)),
      bottleneckStep: bottleneckStep
        ? {
            name: (bottleneckStep as VsmStep).name,
            waitHours: Number(Math.max(0, maxWait).toFixed(1)),
            wasteType: (bottleneckStep as VsmStep).wasteType,
            wasteDescription: (bottleneckStep as VsmStep).wasteDescription
          }
        : null,
      steps: stream.steps.map((s) => ({
        name: s.name,
        role: s.role,
        processTime: s.processTime,
        leadTime: s.leadTime,
        caRate: s.caRate,
        wasteType: s.wasteType,
        wasteDescription: s.wasteDescription
      }))
    };
  });
}
