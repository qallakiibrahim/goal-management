/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { 
  Settings, 
  User, 
  Globe, 
  Bell, 
  RotateCcw, 
  Save, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileDown,
  Loader2,
  Table
} from 'lucide-react';
import { UserProfile } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetDatabase: () => void;
  onDownloadPdf?: () => void;
  onExportCsv?: () => void;
}

export default function SettingsView({
  userProfile,
  onUpdateProfile,
  onResetDatabase,
  onDownloadPdf,
  onExportCsv
}: SettingsViewProps) {
  // Local state for profile inputs
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [role, setRole] = useState(userProfile.role);
  const [language, setLanguage] = useState(userProfile.language);
  const [dateFormat, setDateFormat] = useState(userProfile.dateFormat);
  const [notificationFrequency, setNotificationFrequency] = useState(userProfile.notificationFrequency);
  
  const [savedStatus, setSavedStatus] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const handleDownloadPdf = () => {
    if (!onDownloadPdf) return;
    setIsDownloadingPdf(true);
    setTimeout(() => {
      try {
        onDownloadPdf();
        setPdfDownloaded(true);
        setTimeout(() => setPdfDownloaded(false), 3000);
      } catch (err) {
        console.error('Failed to generate PDF in settings:', err);
      } finally {
        setIsDownloadingPdf(false);
      }
    }, 150);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      role,
      language,
      dateFormat,
      notificationFrequency
    });
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
    }, 2000);
  };

  const handleReset = () => {
    onResetDatabase();
  };

  return (
    <div className="space-y-8 text-left max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
          Systeminställningar & Profil
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Anpassa användarkonton, språkkrav, notifieringsfrekvenser och återställ systemets data lokalt.
        </p>
      </div>

      {/* Settings System AI Analysis */}
      <AiAnalysisCard type="settings" />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Account profile */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-display font-semibold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <User className="w-4.5 h-4.5 text-indigo-900" /> Profilinställningar
          </h3>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Ditt Namn:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">E-postadress:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Din Roll på företaget:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-650"
              >
                <option value="Administratör">Administratör (Fullständig läs/skrivbehörighet)</option>
                <option value="Operativ ledare">Operativ ledare</option>
                <option value="Coachee">Kata Coachee</option>
                <option value="Skrivskyddad">Skrivskyddad / Observatör</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Card: System settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-display font-semibold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Globe className="w-4.5 h-4.5 text-indigo-900" /> Regionala & Notiser
          </h3>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Systemets Språk:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden"
              >
                <option value="Svenska">Svenska (Standard)</option>
                <option value="Engelska">Engelska (English)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Datumformat:</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-06-16)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (16/06/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (06/16/2026)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Notisfrekvens:</label>
              <select
                value={notificationFrequency}
                onChange={(e) => setNotificationFrequency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden"
              >
                <option value="Dagligen">Dagligen (Sammanställning i inkorgen)</option>
                <option value="Veckovis">Veckovis (Endast förändringsrapporter på fredagar)</option>
                <option value="Inga notiser">Inga notiser (Löpande manuell kontroll)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="col-span-1 md:col-span-2 flex justify-end gap-3.5 items-center">
          {savedStatus && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 px-3 rounded-lg border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" /> Sparat framgångsrikt!
            </div>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shadow-xs"
          >
            <Save className="w-4 h-4" /> Spara inställningar
          </button>
        </div>

      </form>

      {/* Strategic PDF Report Export Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileDown className="w-4.5 h-4.5 text-indigo-700 dark:text-indigo-400" />
              Strategisk Statusrapport (PDF)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Generera och ladda ner en komplett PDF-rapport av den aktuella strategiska statusen, inklusive övergripande mål, projektstatus, framsteg och alla KPI-värden. Lämplig för ledningsmöten och styrgrupper.
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
            {onExportCsv && (
              <button
                type="button"
                onClick={onExportCsv}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap shadow-xs cursor-pointer"
                title="Exportera data till CSV"
              >
                <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Exportera Excel / CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap shadow-xs cursor-pointer disabled:opacity-75"
              title="Generera och ladda ner PDF-rapport"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Genererar PDF...</span>
                </>
              ) : pdfDownloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Rapport nedladdad!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Ladda ner PDF-rapport</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Nollställ databasen */}
      <div className="bg-red-50/50 border border-red-200/60 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8">
        <div className="text-left space-y-1">
          <h4 className="font-display font-semibold text-xs text-red-800 uppercase tracking-wider flex items-center gap-1">
            <RotateCcw className="w-4.5 h-4.5" /> FARA: Återställ Databasen
          </h4>
          <p className="text-xs text-slate-500">
            Detta kommer att ta bort alla lokala moduler, nyligen tillagda KPI-mätare och Kata Experiment och återställa systemets startläge.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2.5 bg-red-650 hover:bg-red-700 text-white text-xs font-semibold rounded-xl tracking-tight transition whitespace-nowrap self-stretch md:self-auto text-center"
        >
          Återställ demodata
        </button>
      </div>

    </div>
  );
}
