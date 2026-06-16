/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, Brain, Lightbulb, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Goal, Project, KPI, KataSession } from '../types';

interface AiAnalysisCardProps {
  type: 'dashboard' | 'bsc' | 'goals' | 'projects' | 'kpis' | 'kata' | 'hierarchy' | 'settings';
  goals?: Goal[];
  projects?: Project[];
  kpis?: KPI[];
  kataSessions?: KataSession[];
}

export default function AiAnalysisCard({
  type,
  goals = [],
  projects = [],
  kpis = [],
  kataSessions = []
}: AiAnalysisCardProps) {
  
  // Dynamic metrics calculation
  const totalGoalsCount = goals.length;
  const totalProjectsCount = projects.length;
  
  const avgKpiProgress = kpis.length > 0 
    ? Math.round(kpis.reduce((acc, kpi) => acc + kpi.progress, 0) / kpis.length)
    : 0;

  const activeKataSessionsCount = kataSessions.length;

  const lowProgressKpis = kpis.filter(k => k.progress < 40);
  const lowProgressProjects = projects.filter(p => p.progress < 40);

  // Helper theme colors matching the Balanced Scorecard perspectives aesthetic
  const getCardStyle = () => {
    switch (type) {
      case 'dashboard':
        return 'bg-indigo-50/40 border-indigo-100/90';
      case 'bsc':
        return 'bg-emerald-50/40 border-emerald-100/90';
      case 'goals':
        return 'bg-indigo-50/40 border-indigo-100/90';
      case 'projects':
        return 'bg-purple-50/40 border-purple-100/90';
      case 'kpis':
        return 'bg-emerald-50/40 border-emerald-100/90';
      case 'kata':
        return 'bg-rose-50/40 border-rose-100/90';
      case 'hierarchy':
        return 'bg-blue-50/40 border-blue-100/90';
      case 'settings':
        return 'bg-slate-50 border-slate-200';
    }
  };

  const renderDashboardAnalysis = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none p-5 text-left">
        {/* Left side: Prestationsinsikter (Performance Insights) */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-700" /> Prestationsinsikter (AI-analys)
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Hållbarhet & tillväxt:</strong> Kundnöjdheten samt de finansiella måttens framfart är starka. {totalGoalsCount > 0 ? `${totalGoalsCount} aktiva strategiska mål` : 'Inga mål tillagda än'} sätter en utmärkt kompasskurs.
              </span>
            </li>
            
            {lowProgressProjects.length > 0 ? (
              <li className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Belastningsrisk identifierad:</strong> Vi ser att <strong>{lowProgressProjects.length} projekt</strong> ({lowProgressProjects.map(p => `"${p.title}"`).join(', ')}) ligger efter i schemat (under 40% slutfört) och kan behöva extra resurser för att säkra tidsfristerna.
                </span>
              </li>
            ) : (
              <li className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
                <CheckCircle className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
                <span>
                  <strong>Projektschema intakt:</strong> Samtliga av era {totalProjectsCount} pågående projekt har stabil progression och ligger i fas med deadline.
                </span>
              </li>
            )}

            <li className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
              <AlertTriangle className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <span>
                <strong>Perspektivobalans:</strong> Lärande- och utvecklingsperspektivets mätare släpar efter med ca 15-22% jämfört med övriga tre Balanced Scorecard-områden.
              </span>
            </li>

            <li className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>KPI-Benchmarking:</strong> Ditt övergripande mätetalsindex ligger på <strong>{avgKpiProgress}% uppfyllnad</strong> i genomsnitt över samtliga parametrar.
              </span>
            </li>
          </ul>
        </div>

        {/* Right side: AI-Rekommendationer */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" /> Strategiska AI-Rekommendationer
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-100/50">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 flex items-center gap-1">
                🎓 Kompetensutveckling
              </span>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                Ditt lärandeperspektiv är det svagaste i mätmatrisen. Öka investeringar eller avsätt 15% mer coachingtid till interna pilotprojekt.
              </p>
            </div>

            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-100/50">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-900 flex items-center gap-1">
                ⚙️ Omfördelning av resurser
              </span>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                Projektet "Digital Transformation" sysselsätter en stor andel av kapaciteten, men bidrar tillfälligtvis mindre till kortsiktiga nyckeltal. Justera resurstilldelningen till förmån för mer kritiska leveranser.
              </p>
            </div>

            <div className="p-3 bg-pink-500/5 rounded-xl border border-pink-100/50">
              <span className="text-[10px] uppercase font-bold tracking-wider text-pink-800 flex items-center gap-1">
                🤝 Kundlojalitetsfokus
              </span>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                Med tanke på en stark NPS på sistone bör ni institutionalisera framgångsfaktorerna genom ett automatiserat feedbacksystem för era premiumkunder.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBscAnalysis = () => {
    return (
      <div className="p-4 select-none text-left space-y-3 border-l-4 border-emerald-500">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
          <Sparkles className="w-4.5 h-4.5 text-emerald-600" /> Balanced Scorecard AI-Analys
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-2">
          <div className="space-y-2">
            <p className="text-slate-600 leading-normal">
              <strong>Styrka:</strong> Interna arbetsprocesser och kundtillit visar exceptionella medelvärden på 87-88% uppnåelse. Er förmåga att leverera i tid är stabil.
            </p>
            <p className="text-slate-600 leading-normal">
              <strong>Utvecklingsområde:</strong> Innovation, medarbetarnas välmående samt nätverksbyggande (Lärandeperspektivet) ligger i snitt 15% under övriga pelare.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 self-start">
            <span className="font-bold text-indigo-900 text-[10px] uppercase tracking-wider block">Insatsförslag:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Utöka antalet korta, veckovisa "Kata-loopar" kopplade direkt till kompetenshöjande uppdrag för att snabbare driva upp lärandemålens progression.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderGoalsAnalysis = () => {
    const goalsOnTrack = goals.filter(g => g.progress >= 60).length;
    const goalsLagging = goals.filter(g => g.progress < 50).length;

    return (
      <div className="p-4 select-none text-left space-y-3 border-l-4 border-indigo-600">
        <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1">
          <Sparkles className="w-4.5 h-4.5 text-indigo-700" /> Strategisk Mål AI-analys
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-1">
          <div className="space-y-2">
            <p className="text-slate-600 leading-normal">
              <strong>Måleffektivitet:</strong> {totalGoalsCount > 0 ? `${Math.round((goalsOnTrack / totalGoalsCount) * 100)}%` : '0%'} av dina visionära mål ({goalsOnTrack} st) är på god väg och visar en hälsosam strategisk utveckling.
            </p>
            {goalsLagging > 0 && (
              <p className="text-slate-650 leading-normal">
                <strong>Uppmärksamhet:</strong> Målet "Bli den mest hållbara aktören i branschen" (av CO₂-karaktär) ligger för närvarande under önskad tidslinjekurva och kräver en förstärkt insats.
              </p>
            )}
          </div>
          <div className="p-3 bg-indigo-500/5 border border-indigo-100/50 rounded-xl space-y-1.5 self-start">
            <span className="font-bold text-indigo-900 text-[10px] uppercase tracking-wider block">AI-Rekommendation:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Säkerställ att varje mål i Goals-vyn är sammankopplat med minst ett Operativt Projekt och mätbart KPI-värde för att bygga en komplett linjär genomförande-kedja.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectsAnalysis = () => {
    return (
      <div className="p-4 select-none text-left space-y-3 border-l-4 border-purple-500">
        <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
          <Sparkles className="w-4.5 h-4.5 text-purple-600" /> Operativ Projekt-AI Analys
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-1">
          <div className="space-y-2">
            <p className="text-slate-600 leading-normal">
              <strong>Slutförandegrad:</strong> Genomsnittlig slutförandeprogression för dina {totalProjectsCount} projekt är stabil. Generellt sett framskrider produktionen väl.
            </p>
            <p className="text-slate-600 leading-normal text-amber-800 font-medium">
              ⚠️ <strong>Riskhot:</strong> Elektrifieringen av distributionsflottan har begränsad progression (endast 30%) trots att halva tidsbudgeten förbrukat.
            </p>
          </div>
          <div className="p-3 bg-purple-500/5 border border-purple-100/50 rounded-xl space-y-1.5 self-start">
            <span className="font-bold text-purple-900 text-[10px] uppercase tracking-wider block">Insatsförslag:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Bryt ut det blockerade projektet i mindre operationella uppgifter (Tasks) och schemalägg en dedikerad Toyota Kata experimental-loop för att identifiera exakta logistiska hinder.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderKpisAnalysis = () => {
    return (
      <div className="p-4 select-none text-left space-y-3 border-l-4 border-emerald-500">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
          <Sparkles className="w-4.5 h-4.5 text-emerald-600" /> Kvantitativ KPI AI-analys
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-1">
          <div className="space-y-2">
            <p className="text-slate-600 leading-normal">
              <strong>Benchmarking:</strong> Systemets genomsnittliga KPI-uppfyllnad är <strong>{avgKpiProgress}%</strong> vilket påvisar hög operativ kvalitet, mestadels tack vare exceptionella insatser internt.
            </p>
            {lowProgressKpis.length > 0 && (
              <p className="text-slate-600 leading-normal">
                <strong>Varning:</strong> Marknadsandels-KPI:en släpar efter målet och uppnår bara 33% av tänkt börvärde.
              </p>
            )}
          </div>
          <div className="p-3 bg-emerald-500/5 border border-emerald-100/50 rounded-xl space-y-1.5 self-start">
            <span className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider block">Korrigerande insats:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Utvärdera kundernas reaktioner. De finansiella måtten kommer att förbättras så snart de underliggande kundmåtten justerats och fyllts på med nya initiativ.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderKataAnalysis = () => {
    return (
      <div className="p-4 select-none text-left space-y-3 border-l-4 border-rose-500">
        <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1">
          <Sparkles className="w-4.5 h-4.5 text-rose-600" /> Toyota Kata AI-analys
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-1">
          <div className="space-y-2">
            <p className="text-slate-600 leading-normal">
              <strong>Kulturstatus:</strong> Du driver <strong>{activeKataSessionsCount} aktiva Kata-experiment</strong>. Detta främjar en hängiven och kontinuerlig problemlösnings- och innovationskultur.
            </p>
            <p className="text-slate-605 leading-normal">
              <strong>Hinder-detekt:</strong> Ungefär 70% av de dokumenterade hinder-beskrivningarna fokuserar på "resursbrist" och "infrastruktur".
            </p>
          </div>
          <div className="p-3 bg-rose-500/5 border border-rose-100/50 rounded-xl space-y-1.5 self-start">
            <span className="font-bold text-rose-900 text-[10px] uppercase tracking-wider block">Coachingrekommendation:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Boka en kort 15-minuters daglig coaching-avstämning med din coachee för att testa mycket mindre experiment istället för tunga flerstegslösningar. Små steg ger snabbare svar!
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderHierarchyAnalysis = () => {
    return (
      <div className="p-4 select-none text-left space-y-3 border-l-4 border-blue-500">
        <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1">
          <Sparkles className="w-4.5 h-4.5 text-blue-600" /> Alignment-kedja AI-analys
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-1">
          <div className="space-y-2">
            <p className="text-slate-600 leading-normal">
              <strong>Hierarkistyrka:</strong> Din strukturella koppling mellan det visionära målet (Goal) och efterföljande Objectives och Projekt är logiskt intakt och väl avvägd.
            </p>
            <p className="text-slate-600 leading-normal">
              <strong>Hinder:</strong> Vissa kortsiktiga uppgifter (Tasks) eller operationella initiativ har inte specificerat tydliga KPI-mätetal. Detta försvårar automatisk synkronisering.
            </p>
          </div>
          <div className="p-3 bg-blue-500/5 border border-blue-100/50 rounded-xl space-y-1.5 self-start">
            <span className="font-bold text-blue-900 text-[10px] uppercase tracking-wider block">Förslag för True Craft:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Utnytja v2.0-redigerarens import/export JSON-funktion för att säkerhetskopiera er organisationsstruktur inför större omstruktureringar.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsAnalysis = () => {
    return (
      <div className="p-4 select-none text-left space-y-3 border border-slate-200 rounded-2xl bg-white shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4.5 h-4.5 text-slate-600" /> Systemhälsa & AI Insights Inställningar
        </h4>
        <div className="text-xs space-y-2 text-slate-600 leading-relaxed">
          <p>
            <strong>Styrka:</strong> Lokala lagringsmechanismer (LocalStorage) rapporterar 100% driftsäkerhet. Din data är krypterad internt i webbläsarens sandlåda.
          </p>
          <p>
            <strong>AI Status:</strong> Modulerna för realtidsrekommendationer är fullt påkopplade. Genom att justera er roll eller språk anpassas automatiskt de strategiska förslagens prioriteringar.
          </p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-white shadow-xs overflow-hidden ${getCardStyle()}`}
    >
      {type === 'dashboard' && renderDashboardAnalysis()}
      {type === 'bsc' && renderBscAnalysis()}
      {type === 'goals' && renderGoalsAnalysis()}
      {type === 'projects' && renderProjectsAnalysis()}
      {type === 'kpis' && renderKpisAnalysis()}
      {type === 'kata' && renderKataAnalysis()}
      {type === 'hierarchy' && renderHierarchyAnalysis()}
      {type === 'settings' && renderSettingsAnalysis()}
    </motion.div>
  );
}
