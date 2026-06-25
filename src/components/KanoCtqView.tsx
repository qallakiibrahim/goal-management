/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  HelpCircle, 
  Info, 
  Sparkles, 
  Target, 
  Briefcase, 
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  ListFilter,
  Flame,
  Scale
} from 'lucide-react';
import { CtqKanoItem, KanoCategory, Goal, Project } from '../types';

interface KanoCtqViewProps {
  items: CtqKanoItem[];
  onAddItem: (item: CtqKanoItem) => void;
  onDeleteItem: (id: string) => void;
  goals: Goal[];
  projects: Project[];
}

export default function KanoCtqView({ 
  items, 
  onAddItem, 
  onDeleteItem, 
  goals, 
  projects 
}: KanoCtqViewProps) {
  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Modal / Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [voc, setVoc] = useState('');
  const [driver, setDriver] = useState('');
  const [specification, setSpecification] = useState('');
  const [functionalScore, setFunctionalScore] = useState<number>(4); // default "expect it"
  const [dysfunctionalScore, setDysfunctionalScore] = useState<number>(2); // default "live with"
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [associatedGoalId, setAssociatedGoalId] = useState('');
  const [associatedProjectId, setAssociatedProjectId] = useState('');

  // Auto-calculated Kano Category explanation
  // Standard Kano evaluation matrix mapping
  const getAutoKanoCategory = (func: number, dysfunc: number): { cat: KanoCategory; desc: string } => {
    // func/dysfunc scale: 1 (Ogillar), 2 (Kan leva med), 3 (Neutral), 4 (Förväntar), 5 (Gillar)
    
    // If dysfunction (absence) is strongly disliked (1), but function (presence) is expected (4) or liked (5) => Must-be or Performance
    if (dysfunc === 1) {
      if (func === 5) return { cat: 'One-dimensional', desc: 'Prestandafunktion: Nöjdheten ökar linjärt med prestandan.' };
      return { cat: 'Must-be', desc: 'Självklarhet (Must-be): Absolut grundläggande krav. Drar ner nöjdheten till noll om det saknas.' };
    }
    
    // If dysfunction (absence) is neutral (3) or liveable (2), but function (presence) is liked (5) => Attractive
    if (func === 5 && (dysfunc === 2 || dysfunc === 3 || dysfunc === 4)) {
      return { cat: 'Attractive', desc: 'Aktivator (Attractive): En positiv överraskning som skapar wow-känsla.' };
    }

    if (func === 4 && (dysfunc === 2 || dysfunc === 3)) {
      return { cat: 'Attractive', desc: 'Aktivator (Attractive): Skapar mervärde då kunden inte förväntar sig det.' };
    }

    // If presence is disliked (1) => Reverse
    if (func === 1) {
      return { cat: 'Reverse', desc: 'Inverterad: Användaren ogillar funktionen och vill hellre slippa den.' };
    }
    
    // Default is Indifferent (user doesn't care much)
    return { cat: 'Indifferent', desc: 'Likgiltig (Indifferent): Påverkar varken nöjdhet eller missnöje nämnvärt.' };
  };

  const currentCalc = getAutoKanoCategory(functionalScore, dysfunctionalScore);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!voc || !driver || !specification) {
      alert('Vänligen fyll i Voice of Customer, Drivkraft samt CTQ-Specifikation.');
      return;
    }

    const { cat } = getAutoKanoCategory(functionalScore, dysfunctionalScore);

    const newItem: CtqKanoItem = {
      id: `ck-${Date.now()}`,
      voc,
      driver,
      specification,
      kanoCategory: cat,
      functionalScore,
      dysfunctionalScore,
      priority,
      associatedGoalId: associatedGoalId || undefined,
      associatedProjectId: associatedProjectId || undefined
    };

    onAddItem(newItem);
    
    // Reset form
    setVoc('');
    setDriver('');
    setSpecification('');
    setFunctionalScore(4);
    setDysfunctionalScore(2);
    setPriority('Medium');
    setAssociatedGoalId('');
    setAssociatedProjectId('');
    setShowAddForm(false);
  };

  const getCategoryColor = (cat: KanoCategory) => {
    switch (cat) {
      case 'Must-be': return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900';
      case 'One-dimensional': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900';
      case 'Attractive': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900';
      case 'Reverse': return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900';
      default: return 'bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    }
  };

  const filteredItems = items.filter(item => {
    const matchCat = filterCategory === 'all' || item.kanoCategory === filterCategory;
    const matchPri = filterPriority === 'all' || item.priority === filterPriority;
    return matchCat && matchPri;
  });

  return (
    <div className="space-y-6" id="kanoCtqView">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-900 dark:text-indigo-400 block mb-1">
              Fokus: Kundcentrerat Måluppsättande & Kravanalys
            </span>
            <h2 className="text-xl font-display font-bold text-slate-850 dark:text-white">
              Kano Model & Critical to Quality (CTQ)
            </h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            Ny CTQ/Kano-specifikation
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
          Genom att kombinera <strong>Voice of Customer (VOC)</strong> med <strong>Kano-modellen</strong> och 
          <strong> Critical to Quality (CTQ)</strong> mappar vi ostrukturerade kundönskemål till mätbara tekniska krav. 
          Detta hjälper oss att <strong>bygga rätt mål i vårt Goal Management-system</strong>: vi undviker godtyckliga mål och ser till att resurser läggs på 
          ska-krav (<em>Must-be</em>) och strategiska differentiatorer (<em>Attractive</em>), snarare än oviktiga funktioner (<em>Indifferent</em>).
        </p>

        {/* Dynamic Synergy Explainer Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-850">
          <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="text-[10px] font-bold text-indigo-905 dark:text-indigo-400 uppercase tracking-wider mb-2">Steg 1: VOC</div>
            <p className="font-display font-bold text-xs text-slate-800 dark:text-white mb-1">Voice of Customer</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Kundens informella och ibland otydliga önskemål eller klagomål.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="text-[10px] font-bold text-indigo-905 dark:text-indigo-400 uppercase tracking-wider mb-2">Steg 2: Driver</div>
            <p className="font-display font-bold text-xs text-slate-800 dark:text-white mb-1">CTQ Driver</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Det underliggande behovet eller drivkraften som kunden egentligen värdesätter.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="text-[10px] font-bold text-indigo-905 dark:text-indigo-400 uppercase tracking-wider mb-2">Steg 3: CTQ Spec</div>
            <p className="font-display font-bold text-xs text-slate-800 dark:text-white mb-1">Mätbar Specifikation</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Ett konkret, mätbart och tekniskt gränsvärde som måste uppnås för att tillfredsställa behovet.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 border-l-2 border-l-emerald-500 dark:border-l-emerald-600">
            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Resultat: Goal Alignment</div>
            <p className="font-display font-bold text-xs text-slate-800 dark:text-white mb-1">Målkalibrering</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Koppla mätvärdet direkt som en KPI på dina strategiska mål. Nu vet du <strong>varför</strong> målet finns!</p>
          </div>
        </div>
      </div>

      {/* Interactive Add Form (Animate in) */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md text-left space-y-5 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-display font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Ny Kravanalys: Från VOC till Mätbar KPI
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              Avbryt
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Voice of Customer */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">
                1. Voice of Customer (VOC) <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={voc}
                onChange={(e) => setVoc(e.target.value)}
                rows={3}
                placeholder="Ex. 'Jag blir så arg när mål vi har lagt in försvinner efter att vi laddat om sidan, eller när det inte synkas automatiskt!'"
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-indigo-600"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                Användarens ord eller direkt feedback från fältet.
              </span>
            </div>

            {/* Column 2: Driver */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">
                2. Identifierad Drivkraft (Driver) <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                rows={3}
                placeholder="Ex. 'Säker datalagring och realtidssynk.'"
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-indigo-600"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                Vad är den egentliga drivkraften kunden eftersträvar?
              </span>
            </div>

            {/* Column 3: Specification */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">
                3. CTQ Specifikation (Mätbar KPI) <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                rows={3}
                placeholder="Ex. '100% automatisk molnsynkning till Firestore eller lokal fallback vid nätverksproblem, synkstatus visas inom 0.5 sekunder.'"
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-indigo-600"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                Det konkreta kravet som går att mäta, testa och verifiera.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-100 dark:border-slate-850">
            {/* Kano Model Scorings */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-950/10 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                Kano-modellen: Likert-frågor
              </h4>
              <p className="text-[10px] text-slate-500 leading-tight">
                Svara på hur kunden reagerar på om specifikationen är uppfylld vs saknas, så räknar vi ut kategorin automatiskt.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Functional Question */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block text-left">
                    Om funktionen FINNS (Funktionell):
                  </label>
                  <select
                    value={functionalScore}
                    onChange={(e) => setFunctionalScore(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-850 dark:text-white"
                  >
                    <option value={5}>5 - Jag gillar det (Älskar det)</option>
                    <option value={4}>4 - Jag förväntar mig det</option>
                    <option value={3}>3 - Jag är neutral</option>
                    <option value={2}>2 - Jag kan leva med det</option>
                    <option value={1}>1 - Jag ogillar det</option>
                  </select>
                </div>

                {/* Dysfunctional Question */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block text-left">
                    Om funktionen SAKNAS (Dysfunktionell):
                  </label>
                  <select
                    value={dysfunctionalScore}
                    onChange={(e) => setDysfunctionalScore(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-850 dark:text-white"
                  >
                    <option value={5}>5 - Jag gillar det (Vill ha det så)</option>
                    <option value={4}>4 - Jag förväntar mig det</option>
                    <option value={3}>3 - Jag är neutral</option>
                    <option value={2}>2 - Jag kan leva med det</option>
                    <option value={1}>1 - Jag ogillar det (Oacceptabelt)</option>
                  </select>
                </div>
              </div>

              {/* Auto calculated Category Result banner */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-indigo-900 dark:text-indigo-400">AUTOMATISK KATEGORI:</span>
                  <span className="text-xs font-extrabold text-indigo-905 dark:text-indigo-300 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 rounded-sm">
                    {currentCalc.cat}
                  </span>
                </div>
                <p className="text-[10px] text-slate-550 dark:text-slate-400 italic">
                  {currentCalc.desc}
                </p>
              </div>
            </div>

            {/* Strategic Goal & Project Linkages */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                Mål- och Projektsynergi (Målkalibrering)
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Koppla till befintligt Strategiskt Mål:
                  </label>
                  <select
                    value={associatedGoalId}
                    onChange={(e) => setAssociatedGoalId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-850 dark:text-white"
                  >
                    <option value="">-- Välj ett strategiskt mål (Valfritt) --</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.title} ({g.category})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Koppla till befintligt Operativt Projekt:
                  </label>
                  <select
                    value={associatedProjectId}
                    onChange={(e) => setAssociatedProjectId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-850 dark:text-white"
                  >
                    <option value="">-- Välj ett projekt (Valfritt) --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Prioritet (Kravvikt):
                  </label>
                  <div className="flex gap-4">
                    {['High', 'Medium', 'Low'].map((pVal) => (
                      <label key={pVal} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={pVal}
                          checked={priority === pVal}
                          onChange={() => setPriority(pVal as any)}
                          className="text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0"
                        />
                        {pVal === 'High' ? 'Hög' : pVal === 'Medium' ? 'Mellan' : 'Låg'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
            >
              Stäng
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Lägg till kravspecifikation
            </button>
          </div>
        </form>
      )}

      {/* Grid: Matrix visualization and filtered list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Interactive list of requirements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-850">
              <h3 className="text-sm font-display font-bold text-slate-850 dark:text-white flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-slate-500" />
                Kravspecifikationer & Mappningar ({filteredItems.length})
              </h3>

              {/* Filtering layout */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                >
                  <option value="all">Alla Kano-kategorier</option>
                  <option value="Must-be">Must-be (Självklarheter)</option>
                  <option value="One-dimensional">One-dimensional (Prestanda)</option>
                  <option value="Attractive">Attractive (Aktivatorer)</option>
                  <option value="Indifferent">Indifferent (Likgiltiga)</option>
                  <option value="Reverse">Reverse (Inverterade)</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                >
                  <option value="all">Alla prioriteter</option>
                  <option value="High">Hög prioritet</option>
                  <option value="Medium">Mellan prioritet</option>
                  <option value="Low">Låg prioritet</option>
                </select>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-slate-400">Inga specifikationer matchar valda filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const linkedGoal = goals.find(g => g.id === item.associatedGoalId);
                  const linkedProject = projects.find(p => p.id === item.associatedProjectId);

                  return (
                    <div 
                      key={item.id}
                      className="border border-slate-150 dark:border-slate-850 rounded-2xl p-4 hover:shadow-xs transition bg-slate-50/30 dark:bg-slate-950/5 text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 font-mono block">ID: {item.id}</span>
                          <h4 className="font-display font-bold text-xs text-slate-800 dark:text-white leading-snug">
                            {item.driver}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(item.kanoCategory)}`}>
                            {item.kanoCategory}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.priority === 'High' 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400' 
                              : item.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {item.priority === 'High' ? 'Hög' : item.priority === 'Medium' ? 'Mellan' : 'Låg'} Priority
                          </span>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition"
                            title="Ta bort specifikation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* CTQ Transformation Pipeline */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch my-3">
                        {/* VOC Card */}
                        <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-xl">
                          <span className="text-[9px] font-bold text-indigo-905 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                            Voice of Customer (VOC)
                          </span>
                          <p className="text-[11px] text-slate-650 dark:text-slate-350 italic leading-relaxed">
                            "{item.voc}"
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex md:col-span-1 items-center justify-center text-slate-300">
                          <ArrowRight className="w-4 h-4" />
                        </div>

                        {/* Spec Card */}
                        <div className="md:col-span-6 bg-indigo-950/5 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/10 p-3 rounded-xl border-l-3 border-l-indigo-600">
                          <span className="text-[9px] font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                            CTQ Specification (Measurable Target)
                          </span>
                          <p className="text-[11px] text-slate-800 dark:text-white font-medium leading-relaxed">
                            {item.specification}
                          </p>
                        </div>
                      </div>

                      {/* Links Info Footer */}
                      <div className="flex flex-wrap items-center gap-3 pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-850 text-[10px]">
                        <span className="text-slate-400 font-medium">Synergier:</span>
                        
                        {linkedGoal ? (
                          <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-100/50 dark:border-indigo-900/20">
                            <Target className="w-3 h-3" />
                            <span>Kopplad till mål: <strong>{linkedGoal.title}</strong></span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Inget kopplat strategiskt mål</span>
                        )}

                        {linkedProject ? (
                          <div className="flex items-center gap-1 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-md border border-violet-100/50 dark:border-violet-900/20">
                            <Briefcase className="w-3 h-3" />
                            <span>Kopplad till projekt: <strong>{linkedProject.title}</strong></span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Explanations & Kano Matrix visualization */}
        <div className="space-y-6">
          {/* Kano Grid visualizer */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
            <h3 className="text-sm font-display font-bold text-slate-850 dark:text-white mb-4 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Kano-kategoriseringar
            </h3>

            {/* Matrix segments list */}
            <div className="space-y-3">
              <div className="border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-rose-50/10 dark:bg-rose-950/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                    ● Must-be (Ska-krav)
                  </span>
                  <span className="text-[10px] font-mono font-extrabold bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 px-1.5 py-0.5 rounded">
                    {items.filter(i => i.kanoCategory === 'Must-be').length} st
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Basala förväntningar. Om dessa buggar ur eller saknas blir användaren katastrofalt missnöjd. (Ex. Mål sparas inte, inloggning misslyckas).
                </p>
              </div>

              <div className="border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-amber-50/10 dark:bg-amber-950/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    ● One-dimensional (Prestanda)
                  </span>
                  <span className="text-[10px] font-mono font-extrabold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    {items.filter(i => i.kanoCategory === 'One-dimensional').length} st
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Ju bättre och snabbare detta fungerar, desto gladare blir användaren. (Ex. Gränssnittets svarstid, prestanda, detaljnivå).
                </p>
              </div>

              <div className="border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-emerald-50/10 dark:bg-emerald-950/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    ● Attractive (Wow-effekter)
                  </span>
                  <span className="text-[10px] font-mono font-extrabold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                    {items.filter(i => i.kanoCategory === 'Attractive').length} st
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Överraskningar som kunden inte vet att de vill ha, men som skapar fantastisk lojalitet och wow-känsla när de finns. (Ex. AI-analyser, Toyota Kata-coaching).
                </p>
              </div>

              <div className="border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-slate-50/10 dark:bg-slate-950/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    ● Indifferent (Likgiltiga)
                  </span>
                  <span className="text-[10px] font-mono font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded">
                    {items.filter(i => i.kanoCategory === 'Indifferent').length} st
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Användaren bryr sig inte nämnvärt. Att spendera mycket tid på dessa är ofta slöseri.
                </p>
              </div>
            </div>
          </div>

          {/* Goal Management Alignment / Debugging Explainer */}
          <div className="bg-slate-950 text-white p-5 rounded-3xl text-left border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              Varför hjälper detta till att "bugga" Goal Management?
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Inom strategi och verksamhetsutveckling lider många organisationer av att de sätter upp mål som är orealistiska, godtyckliga eller helt frånkopplade från kunden. Detta kallas för ett <strong>"strategiskt bugg"</strong>.
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Med Kano & CTQ integrerat:
            </p>
            <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                <strong className="text-white">Validerade Mål:</strong> Du kan spåra varje mål bakåt till en specifik drivkraft och ett faktiskt kunduttalande (VOC).
              </li>
              <li>
                <strong className="text-white">Rätt Prioritering:</strong> Du upptäcker snabbt om du lagt upp dyra projekt för "Likgiltiga" krav istället för att säkra "Ska-krav" (Must-be).
              </li>
              <li>
                <strong className="text-white">Mätbara KPI:er:</strong> Det blir glasklart vad målets framgångsmått (KPI) ska vara eftersom CTQ ger oss exakta, testbara gränsvärden.
              </li>
            </ul>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-[10px] text-indigo-300">
                Detta är den ultimata bryggan mellan sex sigma / Lean-verktyg och ditt Balanced Scorecard!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
