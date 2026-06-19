/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  RefreshCw, 
  Trash2, 
  Edit, 
  Plus, 
  Calendar, 
  Target, 
  Search, 
  ArrowRight, 
  HelpCircle,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
  Info,
  Lightbulb,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KataSession } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface KataViewProps {
  kataSessions: KataSession[];
  onOpenAddModal: () => void;
  onOpenEditModal: (session: KataSession) => void;
  onDeleteSession: (id: string) => void;
  onUpdateSessionProgress: (id: string, progress: number) => void;
  onQuickAddKata?: (session: KataSession) => void;
}

export default function KataView({
  kataSessions,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteSession,
  onUpdateSessionProgress,
  onQuickAddKata
}: KataViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // State variables for the Interactive Self-Coaching Wizard
  const [coachingTab, setCoachingTab] = useState<'guide' | 'wizard'>('guide');
  const [wizardStep, setWizardStep] = useState(0);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftGoal, setDraftGoal] = useState('');
  const [draftCurrent, setDraftCurrent] = useState('');
  const [draftObstacles, setDraftObstacles] = useState('');
  const [draftNextStep, setDraftNextStep] = useState('');
  const [draftLearnings, setDraftLearnings] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // High-fidelity prefilled template templates to show users how professional Kata is structured
  const templates = [
    {
      name: "⚙️ Ledtid & Logistik",
      title: "Optimering av packtider i Logistik-Hub B",
      goal: "Minska snittledtiden vid packstation till under 15 minuter per order.",
      current: "Order packas i snitt på 32 minuter p.g.a. röriga hyllor och manuell tejpning.",
      obstacles: "Packmaterial ligger utspritt och det saknas dedikerade tejp-stationer.",
      nextStep: "Genomför en 5S-städning på lördag morgon och fäst tejphållare på alla bord.",
      learnings: "Se om ledtiden minskar med minst 10 minuter under måndagsrusningen."
    },
    {
      name: "🌱 Hållbarhet & CO₂",
      title: "Minimera tomkörning på returbilar",
      goal: "Nå 100% ruttfyllnad för alla lastbilar under returtransporter.",
      current: "Nu går lastbilarna tomma i snitt 35% av retursträckorna.",
      obstacles: "Få lokala kunder känner till våra lediga kapacitetstider på sydgående rutter.",
      nextStep: "Ring upp 5 strategiska partners i Malmö på fredag och erbjud billig returfrakt.",
      learnings: "Mät om vi kan fylla minst 2 lastbilsflak nästa vecka genom detta."
    },
    {
      name: "📚 Kompetensutveckling",
      title: "Växla upp det agila flödet",
      goal: "Alla team-medlemmar självständiga i det gemensamma sprintplaneringsverktyget.",
      current: "Endast 2 av 6 medlemmar kan konfigurera sprintbackloggen utan support.",
      obstacles: "Verktyget upplevs komplext och vi har ingen gemensam standard.",
      nextStep: "Boka en 20-minuters demonstration och skapa ett lathunds-dokument på intranätet.",
      learnings: "Mät om teamet kan starta nästa sprint helt på egen hand."
    }
  ];

  const applyTemplate = (tpl: typeof templates[0]) => {
    setDraftTitle(tpl.title);
    setDraftGoal(tpl.goal);
    setDraftCurrent(tpl.current);
    setDraftObstacles(tpl.obstacles);
    setDraftNextStep(tpl.nextStep);
    setDraftLearnings(tpl.learnings);
    setWizardStep(0); // Go to start of step questions
  };

  const handleCreateFromWizard = () => {
    if (!draftTitle || !draftGoal || !draftCurrent || !draftObstacles || !draftNextStep) {
      alert("Vänligen fyll i de nödvändiga stegen för att kunna spara din Toyota Kata-session.");
      return;
    }

    const newSession: KataSession = {
      id: `kata-${Date.now()}`,
      title: draftTitle,
      date: new Date().toISOString().split('T')[0],
      goal: draftGoal,
      current: draftCurrent,
      obstacles: draftObstacles,
      nextStep: draftNextStep,
      learnings: draftLearnings || 'Inga lärdomar registrerade än.',
      progress: 0
    };

    if (onQuickAddKata) {
      onQuickAddKata(newSession);
    } else {
      // Direct callback logic
      kataSessions.push(newSession);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setDraftTitle('');
      setDraftGoal('');
      setDraftCurrent('');
      setDraftObstacles('');
      setDraftNextStep('');
      setDraftLearnings('');
      setCoachingTab('guide');
      setWizardStep(0);
    }, 2500);
  };

  const filteredSessions = kataSessions.filter(s => {
    return s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.goal.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
            Toyota Kata - Coaching & Experimentation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Genomför strukturerade experimentloops där vi ringar in hinder och testar små steg för att nå nästa önskade måltillstånd.
          </p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4 animate-spin-slow" /> Starta Kata Session
        </button>
      </div>

      {/* Kata AI Analysis */}
      <AiAnalysisCard type="kata" kataSessions={kataSessions} />

      {/* Filter and control */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sök efter experiment, hinder, eller sessionsnamn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Guided Coach Console with Tabs */}
      <div className="bg-white text-slate-800 rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => { setCoachingTab('guide'); }}
            className={`flex-1 md:flex-initial px-5 py-3.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer select-none ${
              coachingTab === 'guide'
                ? 'border-rose-500 text-rose-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-850 hover:bg-slate-100/30'
            }`}
          >
            <BookOpen className="w-4 h-4 text-rose-500" />
            <span>1. Toyota Kata Metodstöd</span>
          </button>
          <button
            onClick={() => { setCoachingTab('wizard'); }}
            className={`flex-1 md:flex-initial px-5 py-3.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer select-none ${
              coachingTab === 'wizard'
                ? 'border-rose-500 text-rose-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-850 hover:bg-slate-100/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>2. Interaktiv Självcoach-Studio</span>
          </button>
        </div>

        <div className="p-5">
          {coachingTab === 'guide' ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                  <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Lärande genom vetenskapligt tänkande</span>
                  </div>
                  <h3 className="text-sm font-bold font-display text-slate-800 mt-1">De 5 Coaching-frågorna (Toyota Kata-mallen)</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                    Förbättringskatan är ett strukturerat sätt för ledare att utveckla sina team genom ständigt experimenterande mot ett önskat måltillstånd.
                  </p>
                </div>
                <button
                  onClick={() => { setCoachingTab('wizard'); setWizardStep(0); }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  Gå till ritbordet <ArrowRight className="w-3" />
                </button>
              </div>

              {/* Sequential display of the questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
                <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 block mb-1">STAPEL 1</span>
                    <h5 className="font-bold text-slate-800 text-xs text-left mb-1">Mål/Önskat tillstånd?</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                      Var vill vi befinna oss på sikt? Vilket mätbart läge siktar vi på?
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono italic mt-4 block">Steg 1</span>
                </div>

                <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 block mb-1">STAPEL 2</span>
                    <h5 className="font-bold text-slate-800 text-xs text-left mb-1">Dagens Nu-läge?</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                      Vilket är vårt nuläge idag? Mät fakta, siffror och beskriv processen noga.
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono italic mt-4 block">Steg 2</span>
                </div>

                <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 block mb-1">STAPEL 3</span>
                    <h5 className="font-bold text-slate-800 text-xs text-left mb-1">Vilka är hindren?</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                      Vilka flaskhalsar hindrar oss från att nå målet? Vilket hinder väljer vi?
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono italic mt-4 block">Steg 3</span>
                </div>

                <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 block mb-1">STAPEL 4</span>
                    <h5 className="font-bold text-slate-800 text-xs text-left mb-1">Nästa experiment?</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                      Vilken liten aktivitet provar vi omedelbart för att utmana hindret?
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono italic mt-4 block">Steg 4</span>
                </div>

                <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 block mb-1">STAPEL 5</span>
                    <h5 className="font-bold text-slate-800 text-xs text-left mb-1">Vad lärde vi oss?</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                      Vad hände i experimentet? Vad blev resultatet i förhållande till förhoppningen?
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono italic mt-4 block">Steg 5</span>
                </div>
              </div>

              {/* Instant Template Quick Pick Section */}
              <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3.5 rounded-xl">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>KLICKA PÅ EN EXEMPELMALL FÖR ATT PRE-FILLA RITBORDET DIREKT:</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {templates.map((tpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyTemplate(tpl)}
                      className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs text-slate-700 font-medium transition cursor-pointer flex items-center justify-between gap-1.5 shadow-xs"
                    >
                      <span>{tpl.name}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stepper Wizard Indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {wizardStep + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {wizardStep === 0 && "Steg 1: Sätt Mål & Vision"}
                    {wizardStep === 1 && "Steg 2: Analysera Nuläget"}
                    {wizardStep === 2 && "Steg 3: Identifiera Hinder"}
                    {wizardStep === 3 && "Steg 4: Formulera Nästa Experiment"}
                    {wizardStep === 4 && "Steg 5: Definiera Lärdomar"}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-6 h-1 rounded-full transition ${
                        step <= wizardStep ? 'bg-rose-500' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Form step inputs */}
              <div className="py-2 space-y-4 text-left">
                {saveSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center mx-auto text-white">
                      <Check className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-emerald-950 text-sm">Kata-Session Registrerad!</h4>
                    <p className="text-xs text-emerald-700">
                      Din strukturerade experimentloop har sparats i det gemensamma registret.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {wizardStep === 0 && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Sessionstitel / Ämne:</label>
                          <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            placeholder="T.ex: Effektivare flöden i Logistik-Hub B..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-rose-500 focus:bg-white transition font-sans"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">1. Vad är ert önskade tillstånd på sikt (Målbild)?</label>
                          <textarea
                            value={draftGoal}
                            onChange={(e) => setDraftGoal(e.target.value)}
                            placeholder="Beskriv ert ideala mål och specifika mätetal ni siktar på..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-rose-500 focus:bg-white transition font-sans"
                          />
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 leading-normal flex gap-2">
                          <Info className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                          <span><strong>Tips:</strong> Toyota Kata siktar inte på omedelbar perfektion, utan på att utmana nästa delsteg på vägen mot visionen.</span>
                        </div>
                      </div>
                    )}

                    {wizardStep === 1 && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">2. Hur ser ert faktiska nuläge ut idag?</label>
                          <textarea
                            value={draftCurrent}
                            onChange={(e) => setDraftCurrent(e.target.value)}
                            placeholder="Var befinner vi oss idag? Mät fakta och presentera baseline-data..."
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-rose-500 focus:bg-white transition font-sans"
                          />
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 leading-normal flex gap-2">
                          <Info className="w-4 h-4 text-slate-455 shrink-0 mt-0.5" />
                          <span><strong>Tips:</strong> Beskriv nuläget med mätbara siffror (t.ex. ledtider, felprocent, nps) snarare än åsikter.</span>
                        </div>
                      </div>
                    )}

                    {wizardStep === 2 && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">3. Vilka hinder står på vägen och stoppar er?</label>
                          <textarea
                            value={draftObstacles}
                            onChange={(e) => setDraftObstacles(e.target.value)}
                            placeholder="Vilka utmaningar möter ni? Vad är det specifika hindret vi fokuserar på nu?"
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-rose-500 focus:bg-white transition font-sans"
                          />
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 leading-normal flex gap-2">
                          <Info className="w-4 h-4 text-slate-455 shrink-0 mt-0.5" />
                          <span><strong>Tips:</strong> Lista gällande flera hinder men bestäm er för att tackla <i>ett</i> specifikt hinder i det kommande experimentet.</span>
                        </div>
                      </div>
                    )}

                    {wizardStep === 3 && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">4. Vad är ert nästa experiment eller omedelbara steg?</label>
                          <textarea
                            value={draftNextStep}
                            onChange={(e) => setDraftNextStep(e.target.value)}
                            placeholder="Vad kan vi testa för lättrörligt mini-experiment direkt och utvärdera snabbt..."
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-rose-500 focus:bg-white transition font-sans"
                          />
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 leading-normal flex gap-2">
                          <Info className="w-4 h-4 text-slate-455 shrink-0 mt-0.5" />
                          <span><strong>Tips:</strong> Håll experimenten så pass små att ni kan få mätbara lärdomar redan inom några dagar.</span>
                        </div>
                      </div>
                    )}

                    {wizardStep === 4 && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">5. Vilka är era förutsedda lärdomar (eller lärdomar från förra steget)?</label>
                          <textarea
                            value={draftLearnings}
                            onChange={(e) => setDraftLearnings(e.target.value)}
                            placeholder="Vad förväntar ni er ska hända? Vilken hypotes vill ni utvärdera..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-rose-500 focus:bg-white transition font-sans"
                          />
                        </div>
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-left">
                          <span className="text-[10px] font-bold text-slate-700 block uppercase font-mono">UTKAST-SAMMANFATTNING</span>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                            <div>Titel: <span className="text-slate-800 font-semibold">{draftTitle || "Ej satt"}</span></div>
                            <div>Önskat tillstånd: <span className="text-slate-800 font-semibold">{draftGoal ? "Ifyllt" : "Ej ifyllt"}</span></div>
                            <div>Nuvarande läge: <span className="text-slate-800 font-semibold">{draftCurrent ? "Ifyllt" : "Ej ifyllt"}</span></div>
                            <div>Hinder på vägen: <span className="text-slate-800 font-semibold">{draftObstacles ? "Ifyllt" : "Ej ifyllt"}</span></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step Navigation Controls */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-150">
                      <button
                        onClick={() => setWizardStep(prev => Math.max(0, prev - 1))}
                        disabled={wizardStep === 0}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" /> Föregående
                      </button>

                      {wizardStep < 4 ? (
                        <button
                          onClick={() => setWizardStep(prev => prev + 1)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          Nästa steg <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleCreateFromWizard}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Spara & Registrera Session
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sessions list */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredSessions.map((session) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 p-5 flex flex-col justify-between transition group"
            >
              {/* Header inside the Session */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold font-display text-slate-800 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-rose-600 animate-spin-slow" /> {session.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Registrerat datum: {session.date}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100/50">
                    KATA-SESSION
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => onOpenEditModal(session)}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-900 transition"
                      title="Redigera session"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Är du säker på att du vill ta bort Kata-sessionen för "${session.title}"?`)) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 rounded text-slate-500 hover:text-red-650 transition"
                      title="Ta bort session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* The Toyota Kata steps displayed as sequential visual cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Step 1 */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide block mb-1">
                    🎯 ÖNSKAT TILLSTÅND
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                    {session.goal}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3 bg-teal-50/50 border border-teal-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wide block mb-1">
                    🔍 NU-TILLSTÅND
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {session.current}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3 bg-amber-50/50 border border-amber-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide block mb-1">
                    🚧 HINDER ATT LÖSA
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {session.obstacles}
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3 bg-rose-50/50 border border-rose-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wide block mb-1">
                    🧪 NÄSTA EXPERIMENT
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                    {session.nextStep}
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-100/40 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide block mb-1">
                    📊 LÄRDOMAR
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed italic">
                    {session.learnings}
                  </p>
                </div>
              </div>

              {/* Progress Slider on each Kata session */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 text-left">
                <div className="flex-grow max-w-md space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Milstolpsuppfyllelse i testet:</span>
                    <span className="font-mono text-indigo-950 font-bold">{session.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={session.progress}
                    onChange={(e) => onUpdateSessionProgress(session.id, parseInt(e.target.value))}
                    className="accent-rose-600 h-1 bg-slate-150 rounded-full cursor-pointer w-full"
                  />
                </div>

                <div className="text-[10px] text-slate-400 font-semibold font-mono self-end md:self-auto mt-2 md:mt-0">
                  SESSION-ID: {session.id}
                </div>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSessions.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 text-sm">Hittade inga Kata-sessioner</h4>
            <p className="text-xs text-slate-400 mt-1">Skapa en ny session för att påbörja coaching-loopen.</p>
          </div>
        )}
      </div>

    </div>
  );
}
