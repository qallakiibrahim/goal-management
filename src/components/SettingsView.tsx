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
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';
import AiAnalysisCard from './AiAnalysisCard';

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetDatabase: () => void;
}

export default function SettingsView({
  userProfile,
  onUpdateProfile,
  onResetDatabase
}: SettingsViewProps) {
  // Local state for profile inputs
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [role, setRole] = useState(userProfile.role);
  const [language, setLanguage] = useState(userProfile.language);
  const [dateFormat, setDateFormat] = useState(userProfile.dateFormat);
  const [notificationFrequency, setNotificationFrequency] = useState(userProfile.notificationFrequency);
  
  const [savedStatus, setSavedStatus] = useState(false);

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
    if (confirm('Är du helt säker på att du vill nollställa systemet? Alla dina egna ändringar, mål, KPI:er, projekt och Kata-sessioner kommer att raderas och ersättas med ursprungliga demodata.')) {
      onResetDatabase();
      alert('Systemet har nollställts till standardinställningar.');
      window.location.reload();
    }
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
