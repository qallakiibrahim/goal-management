/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Layers, 
  Trash2, 
  Plus, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Check, 
  Briefcase, 
  AlertCircle, 
  HelpCircle,
  GitPullRequest,
  CheckCircle2,
  ListTodo,
  ChevronRight,
  User,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, Objective, Project } from '../types';

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
  inventory?: number;      // quantity (Mellanlager ∆ - NVA förvaringslager före stegen)
}

export interface ValueStream {
  id: string;
  name: string;
  description: string;
  steps: VsmStep[];
}

const DEFAULT_STREAMS: ValueStream[] = [
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

interface VsmViewProps {
  goals: Goal[];
  objectives: Objective[];
  projects: Project[];
  onAddProject: (project: Project) => void;
}

export default function VsmView({ goals, objectives, projects, onAddProject }: VsmViewProps) {
  // Loading value streams
  const [streams, setStreams] = useState<ValueStream[]>(() => {
    const local = localStorage.getItem('vsm_streams');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.warn("Failed to parse local VSM streams, reloading defaults", e);
      }
    }
    return DEFAULT_STREAMS;
  });

  // Selected stream
  const [selectedStreamId, setSelectedStreamId] = useState<string>(streams[0]?.id || 'vs-1');
  const activeStream = streams.find(s => s.id === selectedStreamId) || streams[0];

  // Selected step for detailed analysis and editing
  const [selectedStepId, setSelectedStepId] = useState<string | null>(activeStream?.steps[0]?.id || null);
  const activeStep = activeStream?.steps.find(st => st.id === selectedStepId) || activeStream?.steps[0];

  // Forms state for values
  const [isEditingStep, setIsEditingStep] = useState(false);
  const [stepForm, setStepForm] = useState<any | null>(null);

  // New Stream creation form
  const [showNewStreamModal, setShowNewStreamModal] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamDescription, setNewStreamDescription] = useState('');

  // Project Initiation Modal
  const [showInitiateProjectModal, setShowInitiateProjectModal] = useState(false);
  const [initiateProjectTitle, setInitiateProjectTitle] = useState('');
  const [initiateProjectDesc, setInitiateProjectDesc] = useState('');
  const [linkedObjectiveId, setLinkedObjectiveId] = useState<string>('');
  const [projectCreatedStatus, setProjectCreatedStatus] = useState<boolean>(false);

  // Save streams locally
  useEffect(() => {
    localStorage.setItem('vsm_streams', JSON.stringify(streams));
  }, [streams]);

  // Set default form values when active step changes
  useEffect(() => {
    if (activeStep) {
      setStepForm({ 
        ...activeStep,
        processTime: activeStep.processTime.toString(),
        leadTime: activeStep.leadTime.toString(),
        caRate: activeStep.caRate.toString(),
        changeoverTime: (activeStep.changeoverTime ?? 0).toString(),
        uptime: (activeStep.uptime ?? 100).toString(),
        inventory: (activeStep.inventory ?? 0).toString()
      });
    } else {
      setStepForm(null);
    }
  }, [activeStep]);

  // Calculations for Lean Metrics
  const calculateMetrics = (stream: ValueStream) => {
    if (!stream || !stream.steps.length) {
      return { totalPt: 0, totalLt: 0, efficiency: 0, rolledYield: 0 };
    }
    let totalPt = 0;
    let totalLt = 0;
    let rolledYieldProduct = 1.0;

    stream.steps.forEach(s => {
      totalPt += s.processTime;
      // Lead time cannot mathematically be shorter than Process Time.
      // We ensure LT >= PT for realistic lean modeling
      totalLt += Math.max(s.leadTime, s.processTime);
      rolledYieldProduct *= (s.caRate / 100);
    });

    const efficiency = totalLt > 0 ? (totalPt / totalLt) * 100 : 0;
    const rolledYield = rolledYieldProduct * 100;

    return {
      totalPt: parseFloat(totalPt.toFixed(1)),
      totalLt: parseFloat(totalLt.toFixed(1)),
      efficiency: parseFloat(efficiency.toFixed(1)),
      rolledYield: parseFloat(rolledYield.toFixed(1))
    };
  };

  const metrics = calculateMetrics(activeStream);

  // Handle saving the step edits
  const handleSaveStepEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepForm) return;

    const parsedStep: VsmStep = {
      id: stepForm.id,
      name: stepForm.name,
      processTime: Math.max(0.01, parseFloat(stepForm.processTime) || 0.1),
      leadTime: Math.max(0.01, parseFloat(stepForm.leadTime) || 1.0),
      caRate: Math.min(100, Math.max(0, parseInt(stepForm.caRate) || 0)),
      role: stepForm.role,
      wasteType: stepForm.wasteType,
      wasteDescription: stepForm.wasteDescription,
      changeoverTime: Math.max(0, parseFloat(stepForm.changeoverTime) || 0),
      uptime: Math.min(100, Math.max(0, parseInt(stepForm.uptime) || 0)),
      inventory: Math.max(0, parseInt(stepForm.inventory) || 0)
    };

    const updatedStreams = streams.map(s => {
      if (s.id === selectedStreamId) {
        return {
          ...s,
          steps: s.steps.map(st => st.id === stepForm.id ? parsedStep : st)
        };
      }
      return s;
    });

    setStreams(updatedStreams);
    setIsEditingStep(false);
  };

  // Add a new step to the active stream
  const handleAddNewStep = () => {
    const newStep: VsmStep = {
      id: `step-${Date.now()}`,
      name: 'Ny processteg',
      processTime: 1.0,
      leadTime: 8.0,
      caRate: 90,
      role: 'Ej tilldelad',
      wasteType: 'none',
      wasteDescription: '',
      changeoverTime: 0.0,
      uptime: 100,
      inventory: 0
    };

    const updatedStreams = streams.map(s => {
      if (s.id === selectedStreamId) {
        return {
          ...s,
          steps: [...s.steps, newStep]
        };
      }
      return s;
    });

    setStreams(updatedStreams);
    setSelectedStepId(newStep.id);
  };

  // Delete current step
  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = activeStream.steps.filter(st => st.id !== stepId);
    if (updatedSteps.length === 0) {
      alert("En värdeflödeskedja måste innehålla minst ett steg!");
      return;
    }

    const updatedStreams = streams.map(s => {
      if (s.id === selectedStreamId) {
        return { ...s, steps: updatedSteps };
      }
      return s;
    });

    setStreams(updatedStreams);
    setSelectedStepId(updatedSteps[0].id);
  };

  // Create custom Value Stream
  const handleCreateNewStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamName.trim()) return;

    const newStream: ValueStream = {
      id: `vs-${Date.now()}`,
      name: newStreamName,
      description: newStreamDescription || 'Kundanpassat värdeflöde',
      steps: [
        {
          id: `step-${Date.now()}-1`,
          name: '1. Kundbehov identifierat',
          processTime: 1.0,
          leadTime: 4.0,
          caRate: 95,
          role: 'Affärsutvecklare',
          wasteType: 'none',
          wasteDescription: '',
          changeoverTime: 0.0,
          uptime: 100,
          inventory: 0
        },
        {
          id: `step-${Date.now()}-2`,
          name: '2. Värdeskapande arbete',
          processTime: 2.0,
          leadTime: 24.0,
          caRate: 90,
          role: 'Team',
          wasteType: 'waiting',
          wasteDescription: 'Väntar på interna godkännanden',
          changeoverTime: 0.5,
          uptime: 95,
          inventory: 5
        }
      ]
    };

    setStreams([...streams, newStream]);
    setSelectedStreamId(newStream.id);
    setSelectedStepId(newStream.steps[0].id);
    setShowNewStreamModal(false);
    setNewStreamName('');
    setNewStreamDescription('');
  };

  // Delete entire stream
  const handleDeleteStream = (streamId: string) => {
    if (streams.length <= 1) {
      alert("Du måste ha minst ett värdeflöde registrerat i systemet!");
      return;
    }
    if (confirm("Är du säker på att du vill ta bort detta värdeflöde och alla dess steg?")) {
      const remaining = streams.filter(s => s.id !== streamId);
      setStreams(remaining);
      setSelectedStreamId(remaining[0].id);
      setSelectedStepId(remaining[0].steps[0]?.id || null);
    }
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    if (confirm("Vill du återställa alla värdeflöden och tidsavsättningar till branschmallarna?")) {
      setStreams(DEFAULT_STREAMS);
      setSelectedStreamId(DEFAULT_STREAMS[0].id);
      setSelectedStepId(DEFAULT_STREAMS[0].steps[0].id);
    }
  };

  // Open Initiate Project Modal
  const openInitiateProject = () => {
    if (!activeStep) return;
    setInitiateProjectTitle(`Eliminera flaskhals i "${activeStep.name}"`);
    setInitiateProjectDesc(`Projekt initierat från VSM-analysen av "${activeStream.name}". Fokus är att eliminera slöseritypen "${getWasteLabel(activeStep.wasteType)}" och reducera ledtiden från nuvarande ${activeStep.leadTime}h.`);
    setLinkedObjectiveId(objectives[0]?.id || '');
    setProjectCreatedStatus(false);
    setShowInitiateProjectModal(true);
  };

  // Confirm project creation
  const handleInitiateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initiateProjectTitle.trim() || !activeStep) return;

    // Create a real new Project object!
    const newProject: Project = {
      id: `p-vsm-${Date.now()}`,
      title: initiateProjectTitle,
      description: initiateProjectDesc,
      progress: 0,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      objectiveId: linkedObjectiveId || undefined,
      // Find parent goal for the selected objective
      goalId: objectives.find(o => o.id === linkedObjectiveId)?.goalId || undefined
    };

    // Callback to pass the newly created operational project to state!
    onAddProject(newProject);

    // Update VSM step description to indicate that a strategic project is launched!
    const updatedStreams = streams.map(s => {
      if (s.id === selectedStreamId) {
        return {
          ...s,
          steps: s.steps.map(st => {
            if (st.id === activeStep.id) {
              return {
                ...st,
                wasteDescription: st.wasteDescription 
                  ? `${st.wasteDescription} (Strategiskt förbättringsprojekt lancerat: ${newProject.title})`
                  : `Kopplat förbättringsprojekt lancerat: ${newProject.title}`
              };
            }
            return st;
          })
        };
      }
      return s;
    });

    setStreams(updatedStreams);
    setProjectCreatedStatus(true);
    setTimeout(() => {
      setShowInitiateProjectModal(false);
    }, 1800);
  };

  // Helpers
  const getWasteLabel = (type: string) => {
    switch(type) {
      case 'overproduction': return 'Överproduktion';
      case 'waiting': return 'Väntan & Köer';
      case 'transportation': return 'Onödiga Transporter';
      case 'inventory': return 'Överflödigt Lager';
      case 'motion': return 'Onödiga Rörelser';
      case 'overprocessing': return 'Överarbete';
      case 'defects': return 'Kvalitetsbrister (Kassation/Rättningar)';
      case 'talent': return 'Outnyttjad kompetens';
      default: return 'Inget upptäckt slöseri (Rent värde)';
    }
  };

  const getWasteBadgeStyle = (type: string) => {
    if (type === 'none') return 'bg-emerald-50 dark:bg-emerald-950/35 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30';
    return 'bg-rose-50 dark:bg-rose-950/35 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40';
  };

  return (
    <div className="space-y-6 text-left" id="vsmView">
      {/* Title & Explainer Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 px-2.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-lg text-[10px] font-bold tracking-wider uppercase">
              Lean & Six Sigma Engine
            </div>
            <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900/20">
              <Activity className="w-3 h-3 animate-pulse" /> VSM-Verktyg
            </span>
          </div>
          <h2 className="font-display font-black text-2xl text-slate-800 dark:text-slate-100 tracking-tight">
            Värdeflödesanalys (Value Stream Mapping)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Identifiera flaskhalsar, räkna ut ledtidseffektivitet (VMS) och initiera direkt strategiska förändringsprojekt kopplade till flödessteg för att förbättra verksamhetens värdeflöde och samordna alla team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition font-semibold cursor-pointer"
          >
            Återställ Mallar
          </button>
          <button
            onClick={() => setShowNewStreamModal(true)}
            className="text-xs px-3.5 py-2 bg-indigo-900 dark:bg-indigo-600 hover:bg-indigo-950 dark:hover:bg-indigo-550 text-white rounded-xl transition font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nytt Värdeflöde
          </button>
        </div>
      </div>

      {/* Stream Selector & Overview */}
      <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1 md:max-w-xl">
          <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Aktivt Värdeflöde</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {streams.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStreamId(s.id);
                  setSelectedStepId(s.steps[0]?.id || null);
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition border text-left ${
                  selectedStreamId === s.id
                    ? 'bg-indigo-900 border-indigo-900 text-white dark:bg-indigo-600 dark:border-indigo-600'
                    : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-850 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
            "{activeStream?.description}"
          </p>
        </div>

        <div className="flex md:self-end">
          <button
            onClick={() => handleDeleteStream(selectedStreamId)}
            className="text-xs px-3 py-1.5 border border-red-200 text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition font-medium flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Radera Flöde
          </button>
        </div>
      </div>

      {/* Lean VSM Bento Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bearbetningstid (PT)</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-slate-800 dark:text-slate-100">
            {metrics.totalPt} h
          </p>
          <span className="text-[10px] text-slate-400 block leading-tight">
            Den faktiska tiden då ett värdeskapande arbete utförs på produkten.
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Ledtid (LT)</span>
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-indigo-900 dark:text-indigo-400">
            {metrics.totalLt} h
          </p>
          <span className="text-[10px] text-slate-400 block leading-tight">
            Den totala kalendertiden från flödesstart till slutlevererad kundnytta.
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Process-Effektivitet (PCE)</span>
            <div className="p-1.5 bg-indigo-900 text-white rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black font-display text-slate-800 dark:text-slate-100">
              {metrics.efficiency}%
            </p>
            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
              {metrics.efficiency < 5 ? '(Hög potential!)' : metrics.efficiency < 15 ? '(Normalt)' : '(Bra flöde)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block leading-tight">
            Värde-adderande tidskvot: <code className="bg-slate-50 dark:bg-slate-800 px-1 py-0.2 rounded font-mono">PT / LT</code>. Mål inom industrin är ofta &gt;20%.
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First-Time-Right (RFT)</span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/35 text-amber-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-amber-500">
            {metrics.rolledYield}%
          </p>
          <span className="text-[10px] text-slate-400 block leading-tight">
            Det sammanlagda flödesutbytet utan att omarbetningar behövs på vägen.
          </span>
        </div>
      </div>

      {/* Horizontal Value Stream Walkthrough Chart */}
      <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            <GitPullRequest className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
            <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">
              Värdeflödesvisualisering
            </h3>
          </div>
          <button
            onClick={handleAddNewStep}
            className="text-xs px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-850 rounded-xl transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Lägg till Processteg
          </button>
        </div>

        {/* The horizontal track */}
        <div className="relative overflow-x-auto pb-6 pt-2">
          {/* Timeline rail beneath */}
          <div className="absolute left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 top-1/2 transform -translate-y-1/2 z-0"></div>
          
          <div className="flex items-center gap-4 min-w-[900px] relative z-10 px-4">
            {activeStream.steps.map((step, idx) => {
              const isSelected = selectedStepId === step.id;
              const hasWaste = step.wasteType !== 'none';
              return (
                <React.Fragment key={step.id}>
                  {/* Step block */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      setSelectedStepId(step.id);
                      setIsEditingStep(false);
                    }}
                    className={`flex-1 p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 select-none ${
                      isSelected
                        ? 'bg-indigo-900 text-white border-indigo-900 shadow-md ring-4 ring-indigo-900/10 dark:bg-indigo-650'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isSelected 
                          ? 'bg-white/20 text-indigo-100' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        Steg {idx + 1}
                      </span>
                      
                      {hasWaste && (
                        <span className="text-[10px] text-rose-500 font-extrabold flex items-center gap-0.5" title={getWasteLabel(step.wasteType)}>
                          ⚠️ Slöseri
                        </span>
                      )}
                    </div>

                    <h4 className={`text-xs font-bold font-display mt-2 line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-slate-850 dark:text-slate-100'
                    }`}>
                      {step.name}
                    </h4>

                    <p className={`text-[10px] mt-1 line-clamp-1 ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}>
                      Rolle: <span className="font-semibold">{step.role}</span>
                    </p>

                    {/* PT, LT, C/O, Uptime box */}
                    <div className={`grid grid-cols-2 gap-y-1.5 gap-x-3 mt-3 pt-2.5 border-t ${
                      isSelected ? 'border-white/10 text-indigo-100' : 'border-slate-100 dark:border-slate-800 text-slate-500'
                    } text-[10px] font-mono`}>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">C/T (Cykeltid)</span>
                        <strong className={isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-300'}>{step.processTime}h</strong>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">C/O (Ställtid)</span>
                        <strong className={isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-300'}>{step.changeoverTime ?? 0}h</strong>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">Uptime</span>
                        <strong className={isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-300'}>{step.uptime ?? 100}%</strong>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">Ledtid (LT)</span>
                        <strong className={isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-300'}>{step.leadTime}h</strong>
                      </div>
                    </div>

                    {/* Inventory/Mellanlager bubble if > 0 */}
                    {(step.inventory !== undefined && step.inventory > 0) && (
                      <div className="mt-2 text-right">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono ${
                          isSelected ? 'bg-indigo-950/30 text-indigo-200' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-650 dark:text-rose-400'
                        }`}>
                          <span>∆ Mellanlager:</span>
                          <strong>{step.inventory} st</strong>
                        </span>
                      </div>
                    )}

                    {/* Quality Rate Bar */}
                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between text-[8px] font-mono uppercase tracking-wider text-slate-400">
                        <span>Rätt-Från-Mig (C&A)</span>
                        <strong className={isSelected ? 'text-emerald-300' : 'text-emerald-600'}>{step.caRate}%</strong>
                      </div>
                      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} 
                          style={{ width: `${step.caRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Arrow connector */}
                  {idx < activeStream.steps.length - 1 && (
                    <div className="flex flex-col items-center shrink-0">
                      <ChevronRight className="w-5 h-5 text-slate-350 dark:text-slate-650" />
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-850 dark:border dark:border-slate-800 px-1.5 py-0.5 rounded shadow-2xs mt-0.5">
                        {parseFloat((activeStream.steps[idx+1].leadTime - step.processTime).toFixed(1))}h väntetid
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Beautiful Timeline Level Chart beneath the stream representation */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Verksamhetsmätning: Ledtidstrappa</span>
          <div className="min-w-[800px] flow-root pt-2">
            <div className="flex items-end h-16 text-center text-[10px] font-mono">
              {activeStream.steps.map((st, sidx) => {
                const totalLt = Math.max(st.leadTime, st.processTime);
                const wt = totalLt - st.processTime;
                return (
                  <React.Fragment key={st.id}>
                    {/* Process time block */}
                    <div className="flex-1 flex flex-col justify-end items-center h-full group px-1">
                      <div 
                        className="w-full bg-emerald-500/20 dark:bg-emerald-500/10 border-b-2 border-emerald-500 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold"
                        style={{ height: `${Math.max(15, Math.min(100, (st.processTime / metrics.totalLt) * 150))}%` }}
                      >
                        {st.processTime}h
                      </div>
                      <span className="text-[8px] text-slate-400 uppercase mt-1 leading-none">PT</span>
                    </div>

                    {/* Wait time block */}
                    {sidx < activeStream.steps.length - 1 && (
                      <div className="w-16 flex flex-col justify-end items-center h-full px-1">
                        <div 
                          className="w-full bg-rose-500/20 dark:bg-rose-500/15 border-t-2 border-rose-500 flex items-center justify-center text-rose-700 dark:text-rose-450 font-semibold"
                          style={{ height: `${Math.max(15, Math.min(100, (wt / metrics.totalLt) * 150))}%` }}
                        >
                          {parseFloat(wt.toFixed(1))}h
                        </div>
                        <span className="text-[8px] text-slate-400 uppercase mt-1 leading-none">Väntan</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Dynamic Step Analyst & Improvement Center */}
      {activeStep && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* View Details panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {!isEditingStep ? (
                <motion.div
                  key="detail-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valt processteg</span>
                      <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-100">
                        {activeStep.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setStepForm({ ...activeStep });
                          setIsEditingStep(true);
                        }}
                        className="text-xs px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-350 transition cursor-pointer"
                      >
                        Redigera tider & data
                      </button>
                      <button
                        onClick={() => handleDeleteStep(activeStep.id)}
                        className="p-2 border border-red-100 hover:bg-red-50 text-red-550 rounded-xl transition cursor-pointer"
                        title="Radera detta steg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Flow KPIs Detail cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Cykeltid (C/T)</span>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5">{activeStep.processTime} h</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Ledtid (LT)</span>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5">{activeStep.leadTime} h</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Kvalitetsgrad (C&A)</span>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{activeStep.caRate}%</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Ställtid (C/O)</span>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5">{activeStep.changeoverTime ?? 0} h</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Tillgänglighet (Uptime)</span>
                      <p className="text-sm font-black text-indigo-650 dark:text-indigo-400 font-mono mt-0.5">{activeStep.uptime ?? 100}%</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Mellanlager (∆ Kö)</span>
                      <p className="text-sm font-black text-rose-600 dark:text-rose-450 font-mono mt-0.5">{activeStep.inventory ?? 0} st</p>
                    </div>
                  </div>

                  {/* Waste detection analysis */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verksamhetsanalys: Slöseridetektering (Muda/Waste)</span>
                    <div className={`p-4.5 rounded-xl border flex gap-3 ${getWasteBadgeStyle(activeStep.wasteType)}`}>
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider">
                          Slöserityp: {getWasteLabel(activeStep.wasteType)}
                        </h4>
                        <p className="text-xs opacity-90 leading-relaxed font-sans">
                          {activeStep.wasteType === 'none' 
                            ? 'Detta steg presterar för närvarande med fullt fokus på ren kundvärdeskapande bearbetning. Inga kritiska flaskhalsar har loggats.'
                            : activeStep.wasteDescription || 'Inget beskrivande underlag tillgängligt. Lägg till en kommentar via Redigera.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Strategic Action Plan Connector (Launch Improve Project!) */}
                  <div className="p-4 bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 md:max-w-lg">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-bold text-indigo-950 dark:text-indigo-305 uppercase tracking-wider">Flödesoptimering / VSM-Initiativ</span>
                      </div>
                      <p className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed">
                        Har ni upptäckt ett högt slöseri eller långa köer? Koppla eller lansera ett helt nytt **strategiskt operativt projekt** som direkt adresserar detta steg som en del av verksamhetens taktförbättring!
                      </p>
                    </div>
                    
                    <button
                      onClick={openInitiateProject}
                      className="whitespace-nowrap text-xs px-4 py-2.5 bg-indigo-900 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Briefcase className="w-4 h-4" /> Starta Förbättringsprojekt
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="edit-view"
                  onSubmit={handleSaveStepEdits}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                    <h3 className="font-display font-bold text-sm text-indigo-900 dark:text-indigo-400">
                      Redigera processteg: {activeStep.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingStep(false)}
                      className="text-xs px-2.5 py-1 text-slate-500 border border-slate-200 dark:border-slate-800 dark:text-slate-400 rounded-lg hover:bg-slate-50"
                    >
                      Avbryt
                    </button>
                  </div>

                  {stepForm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Stegnamn:</label>
                        <input
                          type="text"
                          required
                          value={stepForm.name ?? ''}
                          onChange={e => setStepForm({ ...stepForm, name: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Cykeltid (C/T) i timmar:</label>
                        <input
                          type="number"
                          step="any"
                          required
                          min="0.01"
                          value={stepForm.processTime ?? ''}
                          onChange={e => setStepForm({ ...stepForm, processTime: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Ställtid (C/O) i timmar:</label>
                        <input
                          type="number"
                          step="any"
                          required
                          min="0"
                          value={stepForm.changeoverTime ?? ''}
                          onChange={e => setStepForm({ ...stepForm, changeoverTime: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Tillgänglighet (Uptime %) 0-100:</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={stepForm.uptime ?? ''}
                          onChange={e => setStepForm({ ...stepForm, uptime: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Mellanlager i kö (∆) i st:</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={stepForm.inventory ?? ''}
                          onChange={e => setStepForm({ ...stepForm, inventory: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Total Ledtid (LT) i timmar:</label>
                        <input
                          type="number"
                          step="any"
                          required
                          min="0.05"
                          value={stepForm.leadTime ?? ''}
                          onChange={e => setStepForm({ ...stepForm, leadTime: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Kvalitetsgrad (C&A %) 0-100:</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={stepForm.caRate ?? ''}
                          onChange={e => setStepForm({ ...stepForm, caRate: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Ansvarig roll/aktör:</label>
                        <input
                          type="text"
                          required
                          value={stepForm.role ?? ''}
                          onChange={e => setStepForm({ ...stepForm, role: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Huvudsaklig slöserityp (Muda/Waste):</label>
                        <select
                          value={stepForm.wasteType ?? 'none'}
                          onChange={e => setStepForm({ ...stepForm, wasteType: e.target.value as any })}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900 font-semibold"
                        >
                          <option value="none">Inget slöseri (Maximalt värdeskapande)</option>
                          <option value="overproduction">Överproduktion (Skapa mer än vad efterfrågas)</option>
                          <option value="waiting">Väntan & Köer (Flaskhalsar, ledtider)</option>
                          <option value="transportation">Transport (Onödiga förflyttningar av material/filer)</option>
                          <option value="inventory">Lager (Överflödigt arbete/dokument som väntar på hög)</option>
                          <option value="motion">Rörelse (Onödiga sökningar efter info/verktyg)</option>
                          <option value="overprocessing">Överarbete (Mer komplicerat än kunden kräver)</option>
                          <option value="defects">Defekter & omarbete (Felaktig inmatning, regressionstest, krascher)</option>
                          <option value="talent">Outnyttjad talang (Engagerar inte personalen fullt ut)</option>
                        </select>
                      </div>

                      {(stepForm.wasteType ?? 'none') !== 'none' && (
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Beskrivning av flaskhals / slöseri:</label>
                          <textarea
                            required
                            rows={2}
                            value={stepForm.wasteDescription ?? ''}
                            onChange={e => setStepForm({ ...stepForm, wasteDescription: e.target.value })}
                            placeholder="Hur tar sig detta slöseri uttryck i vardagen?"
                            className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-900 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Spara Processteg
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Value Stream Coach recommendation panel */}
          <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">
                Flödescoachning (Lean AI Tips)
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl space-y-1.5 text-[11px]">
                <span className="font-extrabold text-amber-605 block uppercase tracking-wider text-[9px]">Gällande strategi:</span>
                <p className="text-slate-650 dark:text-slate-350 leading-relaxed">
                  Detta värdeflödes ledtidseffektivitet är <strong className="text-indigo-900 dark:text-indigo-400 font-black">{metrics.efficiency}%</strong>. Det betyder att för varje arbetad timme vilar flödet i snitt i <strong className="text-rose-600 font-bold">{parseFloat((100 / (metrics.efficiency || 1) - 1).toFixed(1))} timmar</strong>.
                </p>
              </div>

              <div className="space-y-3 font-sans leading-relaxed text-slate-650 dark:text-slate-350">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Identifierat fokusprojekt:</span>
                
                {metrics.efficiency < 10 ? (
                  <p>
                    ⚠️ <strong>Låg flödeseffektivitet:</strong> Värdeflödet domineras av väntetider. Förbättringspotentialen ligger i att synkronisera överlämningar. Lansera ett <em>Toyota Kata-experiment</em> för att sätta dagliga takter.
                  </p>
                ) : (
                  <p>
                    👍 <strong>God flödeseffektivitet:</strong> Fokusera nu på kvalitetsgraden First-Time-Right (RFT: {metrics.rolledYield}%). Eliminera omarbetningar i stegen med lägst mätetal.
                  </p>
                )}

                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-[11px] leading-normal italic text-slate-505">
                  "Regeln inom Lean är enkel: det handlar inte om att springa snabbare, utan om att eliminera den tid då ingen produkt eller information rör sig framåt i värdekedjan."
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Guide Segment based on user guidelines */}
      <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 my-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">
            Metodstöd: Hur du tolkar Värdeflödesanalysen (VSM) & Lean-mätetalen
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-650 dark:text-slate-400">
          <div className="space-y-2 text-left">
            <h4 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <span className="p-1 px-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-455 rounded font-mono">VSM</span> 
              Vad är VSM?
            </h4>
            <p>
              Värdeflödesanalys (<em>Value Stream Mapping</em>) ritar upp hela resan för en produkt eller tjänst och mäter exakt hur mycket tid som skapar värde för kunden (arbetad cykeltid) jämfört med ledtiden som går åt till väntan i köer, ställtid (C/O) och onödiga mellanlager.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <h4 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <span className="p-1 px-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-455 rounded font-mono">KPI</span> 
              Begrepp i flödet
            </h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>C/T (Cycle Time / Cykeltid):</strong> Den tid maskin eller aktör faktiskt arbetar med en enskild detalj (arbetstid PT).</li>
              <li><strong>C/O (Changeover / Ställtid):</strong> Tiden det tar att ställa om processen från att köra en typ till en annan.</li>
              <li><strong>Uptime (Tillgänglighet):</strong> Hur pålitlig utrustningen eller aktören är i procent. 100% innebär helt störningsfri gång.</li>
              <li><strong>Mellanlager (∆ Kö):</strong> Produkter/ärenden i kö. Kallas Non-Value Added (NVA) eftersom de binder kapital utan värde.</li>
            </ul>
          </div>

          <div className="space-y-2 text-left">
            <h4 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <span className="p-1 px-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-455 rounded font-mono">PCE</span> 
              Flödeseffektivitet (PCE)
            </h4>
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-mono font-bold rounded">&lt; 5%</span>
                <span>Mycket slöseri (ledtiden styrs av lager).</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono font-bold rounded">5 - 15%</span>
                <span>Standard industriellt utflöde.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 font-mono font-bold rounded">&gt; 15%</span>
                <span>Lean i världsklass (minimal väntetid i köer).</span>
              </div>
              <p className="text-[10px] italic text-slate-500 mt-1 block">
                💡 Sänk ledtiden radikalt genom att angripa lager och köer mellan stegen, snarare än att tvinga operatörer att springa snabbare!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Launching new custom stream */}
      <AnimatePresence>
        {showNewStreamModal && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-3xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-display font-bold text-sm text-indigo-900 dark:text-indigo-400">
                  Lägg till kundanpassat Värdeflöde
                </h3>
                <button
                  onClick={() => setShowNewStreamModal(false)}
                  className="p-1 px-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg text-xs hover:bg-slate-100"
                >
                  Avbryt
                </button>
              </div>

              <form onSubmit={handleCreateNewStream} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-350">Namn på värdeflödet / processen:</label>
                  <input
                    type="text"
                    required
                    placeholder="t.ex. Rekryteringsprocess eller Onboarding"
                    value={newStreamName}
                    onChange={e => setNewStreamName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-350">Beskrivning av syfte och räckvidd:</label>
                  <textarea
                    rows={3}
                    placeholder="Beskriv kort flödestrigger och slutleverabel..."
                    value={newStreamDescription}
                    onChange={e => setNewStreamDescription(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-900 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition"
                >
                  Skapa Flödesmall & Generera Steg
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Launching a real strategic Project from a VSM bottleneck step */}
      <AnimatePresence>
        {showInitiateProjectModal && activeStep && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-3xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-700" />
                  <h3 className="font-display font-bold text-sm text-indigo-900 dark:text-indigo-400">
                    Lansera Strategiskt Projekt från VSM
                  </h3>
                </div>
                <button
                  onClick={() => setShowInitiateProjectModal(false)}
                  className="p-1 px-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg text-xs hover:bg-slate-100"
                >
                  Stäng
                </button>
              </div>

              {projectCreatedStatus ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 bg-emerald-100 rounded-full text-emerald-700 shadow-sm animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">Projekt lanserats framgångsrikt!</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Detta projekt har lagts till i din målorganisation och kan nu spåras och styras!
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInitiateProjectSubmit} className="space-y-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-xs space-y-1 block border border-indigo-100/50 dark:border-indigo-900/30">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest text-[9px] block">Detekterad koppling:</span>
                    Värdeflödesteg: <strong>{activeStep.name}</strong> • Slöserityp: <strong>{getWasteLabel(activeStep.wasteType)}</strong>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-350">Projektnamn:</label>
                    <input
                      type="text"
                      required
                      value={initiateProjectTitle}
                      onChange={e => setInitiateProjectTitle(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-350">Beskrivning av åtgärder / räckvidd:</label>
                    <textarea
                      required
                      rows={4}
                      value={initiateProjectDesc}
                      onChange={e => setInitiateProjectDesc(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-350">Koppla till strategisk målsättning (Objective):</label>
                    <select
                      value={linkedObjectiveId}
                      onChange={e => setLinkedObjectiveId(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-indigo-900"
                    >
                      <option value="">-- Ingen koppling (Skapa fristående projekt) --</option>
                      {objectives.map(obj => (
                        <option key={obj.id} value={obj.id}>
                          {obj.title} (KPI: {obj.kpi})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Genom att välja en målsättning kommer projektet automatiskt positionera sig i din **Interaktiva Målkedja** på dashboards!
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Bekräfta och lanserar förbättringsprojekt 🚀
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
