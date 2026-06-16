/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Plus, 
  Target, 
  Flag, 
  Briefcase, 
  Zap, 
  CheckCircle, 
  Sparkles, 
  Copy, 
  Check, 
  Upload, 
  Download,
  Terminal,
  Grid
} from 'lucide-react';
import { Goal, Objective, Project, Initiative, Task } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface HierarchyEditorViewProps {
  goals: Goal[];
  objectives: Objective[];
  projects: Project[];
  onAddNewNode: (type: string, data: any) => void;
  onImportData: (data: string) => boolean;
  onExportData: () => string;
}

export default function HierarchyEditorView({
  goals,
  objectives,
  projects,
  onAddNewNode,
  onImportData,
  onExportData
}: HierarchyEditorViewProps) {
  // Input fields state
  const [levelType, setLevelType] = useState<'goal' | 'objective' | 'project' | 'initiative' | 'task'>('goal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kpi, setKpi] = useState('');
  const [category, setCategory] = useState<'financial' | 'customer' | 'process' | 'learning'>('financial');
  
  // Link selectors
  const [selectedGoalId, setSelectedGoalId] = useState(goals.length > 0 ? goals[0].id : '');
  const [selectedObjectiveId, setSelectedObjectiveId] = useState(objectives.length > 0 ? objectives[0].id : '');
  const [selectedProjectId, setSelectedProjectId] = useState(projects.length > 0 ? projects[0].id : '');

  // JSON import/export states
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle addition
  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      alert('Vänligen fyll i både Titel och Beskrivning för din nya nod.');
      return;
    }

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      kpi: kpi.trim(),
      progress: 0,
      deadline: '2026-12-31'
    };

    if (levelType === 'goal') {
      payload.category = category;
    } else if (levelType === 'objective') {
      payload.goalId = selectedGoalId;
    } else if (levelType === 'project') {
      payload.objectiveId = selectedObjectiveId;
      payload.goalId = objectives.find(o => o.id === selectedObjectiveId)?.goalId || selectedGoalId;
    } else if (levelType === 'initiative') {
      payload.projectId = selectedProjectId;
    } else if (levelType === 'task') {
      payload.projectId = selectedProjectId;
      payload.completed = false;
    }

    onAddNewNode(levelType, payload);

    // Reset fields & congratulate
    setTitle('');
    setDescription('');
    setKpi('');
    alert(`Ny ${levelType.toUpperCase()} sparades! Du hittar den under sin respektive flik.`);
  };

  const handleExport = () => {
    const raw = onExportData();
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportSubmit = () => {
    if (!importJson.trim()) {
      setImportStatus({ type: 'error', msg: 'JSON-fältet kan inte vara tomt.' });
      return;
    }
    const success = onImportData(importJson);
    if (success) {
      setImportStatus({ type: 'success', msg: 'Databasen har lästs in och sparats lokalt!' });
      setImportJson('');
    } else {
      setImportStatus({ type: 'error', msg: 'Ogiltigt JSON-format. Kontrollera strukturen.' });
    }
  };

  const getPreviewIcon = () => {
    switch (levelType) {
      case 'goal': return <Target className="w-5 h-5 text-indigo-900" />;
      case 'objective': return <Flag className="w-5 h-5 text-indigo-900" />;
      case 'project': return <Briefcase className="w-5 h-5 text-indigo-900" />;
      case 'initiative': return <Zap className="w-5 h-5 text-indigo-900" />;
      case 'task': return <CheckCircle className="w-5 h-5 text-indigo-900" />;
    }
  };

  const getPreviewHeader = () => {
    switch (levelType) {
      case 'goal': return 'Goal (Målvision) - ' + category.toUpperCase();
      case 'objective': return 'Objective (Målsättning)';
      case 'project': return 'Project (Projekt)';
      case 'initiative': return 'Initiative (Initiativ)';
      case 'task': return 'Task (Uppdrag)';
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
          Visual Hierarchy Editor
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Bygg och synkronisera noder i företagets måltrappa. Varje projekt och uppgift spåras i en obruten kedja.
        </p>
      </div>

      {/* Hierarchy AI Analysis */}
      <AiAnalysisCard type="hierarchy" goals={goals} projects={projects} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Form panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-display font-semibold text-sm text-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-900" /> Lägg till en ny nod
          </h3>

          <div className="space-y-4">
            {/* Step Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Nivåtyp i målkedjan:</label>
              <select
                value={levelType}
                onChange={(e: any) => setLevelType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-600 font-semibold"
              >
                <option value="goal">Goal (Steg 1: Långsiktigt Strategiskt Mål)</option>
                <option value="objective">Objective (Steg 2: Taktisk Målsättning)</option>
                <option value="project">Project (Steg 3: Operativt Projekt)</option>
                <option value="initiative">Initiative (Steg 4: Underordnat Initiativ)</option>
                <option value="task">Task (Steg 5: Dagligt Uppdrag / Aktivitet)</option>
              </select>
            </div>

            {/* Link Selector - Dynamic depending on level selected */}
            {levelType === 'goal' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Balanced Scorecard Kategori:</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-650"
                >
                  <option value="financial">💰 Finansiella mätetal (Lönsamhet, CO2-kostnad)</option>
                  <option value="customer">🤝 Kundmätetal (NPS, Varumärkesvärde)</option>
                  <option value="process">⚙️ Processer (Effektivitet, Logistik, Leverans)</option>
                  <option value="learning">📚 Lärande & Utveckling (Medarbetarnöjdhet, Utbildning)</option>
                </select>
              </div>
            )}

            {levelType === 'objective' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Koppla till överordnat Mål (Goal):</label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-650"
                >
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title} ({g.id})</option>
                  ))}
                  {goals.length === 0 && <option>Skapa först ett Mål!</option>}
                </select>
              </div>
            )}

            {levelType === 'project' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Koppla till överordnad Målsättning (Objective):</label>
                <select
                  value={selectedObjectiveId}
                  onChange={(e) => setSelectedObjectiveId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-650"
                >
                  {objectives.map(o => (
                    <option key={o.id} value={o.id}>{o.title} ({o.id})</option>
                  ))}
                  {objectives.length === 0 && <option>Skapa först en Målsättning!</option>}
                </select>
              </div>
            )}

            {(levelType === 'initiative' || levelType === 'task') && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Koppla till underordnat Projekt:</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-650"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.id})</option>
                  ))}
                  {projects.length === 0 && <option>Skapa först ett Projekt!</option>}
                </select>
              </div>
            )}

            {/* Node Title input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Titel på noden:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="T.ex. Installera laddstolpar / Skicka enkät"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            {/* Description area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Beskrivning av insatsen:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detaljera arbetets omfattning, roller och långsiktiga värde..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            {/* KPI metric */}
            {levelType !== 'task' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Mätetal / KPI som mäter framstegen:</label>
                <input
                  type="text"
                  value={kpi}
                  onChange={(e) => setKpi(e.target.value)}
                  placeholder="T.ex. Procentandel installerat / Kundbetyg 4.5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-650"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Spara Nod till Mållistan
          </button>
        </div>

        {/* Preview and database panel */}
        <div className="space-y-6">
          {/* Card Preview */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4 text-indigo-950" />
              <span>Realtid Förhandsvisning</span>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs text-left min-h-48 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
                    {getPreviewIcon()}
                    {getPreviewHeader()}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                    PREVIEW
                  </span>
                </div>
                
                <h4 className="text-sm font-bold text-slate-800 tracking-tight font-display">
                  {title || 'Titel på din nya strategi...' }
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {description || 'Beskrivningen du anger kommer dyka upp här för att ge dina kollegor, coacher och medarbetare tydliga instruktioner.'}
                </p>
              </div>

              {levelType !== 'task' && (
                <div className="mt-4 pt-3 border-t border-slate-100/80 text-xs">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Kopplat mätetal:</span>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg block mt-1">
                    {kpi || 'Ingen KPI mätare definierad'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Import/Export Panel */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-2">
              <h4 className="font-display font-semibold text-xs text-slate-800 uppercase tracking-wider">
                Exportera & Importera Data (JSON)
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-lg text-xs font-semibold text-slate-600 transition flex items-center gap-1"
                  title="Kopiera text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopierad' : 'Kopiera allt'}</span>
                </button>
              </div>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed">
              Kopiera den fullständiga databas-JSON-strängen nedan för backuper, eller klistra in en sparad konfiguration för att skriva över nuvarande målyta.
            </p>

            <div className="space-y-3">
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='Klistra in JSON-sträng här för att importera...'
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:outline-hidden"
              />

              {importStatus && (
                <div className={`p-2.5 rounded-lg text-xs font-semibold ${importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                  {importStatus.msg}
                </div>
              )}

              <button
                onClick={handleImportSubmit}
                className="w-full py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" /> Läs in och skriv över lokalt lager
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
