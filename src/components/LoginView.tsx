/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  LogIn, 
  ShieldAlert, 
  ChevronRight, 
  Info,
  Laptop,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';

interface LoginViewProps {
  onGoogleSignIn: () => void;
  onContinueOffline: () => void;
  authState: {
    loading: boolean;
    error: string | null;
  };
  hasLocalBackup: boolean;
}

export default function LoginView({
  onGoogleSignIn,
  onContinueOffline,
  authState,
  hasLocalBackup
}: LoginViewProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden font-sans">
      
      {/* Absolute decorative bg elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full z-10 flex justify-between items-center opacity-90 py-2">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-indigo-650 rounded-xl text-white shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-white tracking-tight text-left">
              MålRamverk
            </h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold font-mono text-left">
              Alignment Engine
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full text-[10px] font-mono text-slate-350">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span>Säker OAuth v2 Miljö</span>
        </div>
      </header>

      {/* Middle content / Card */}
      <main className="flex-1 flex flex-col justify-center items-center py-10 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/80 border border-slate-700/60 p-8 sm:p-10 rounded-3xl max-w-lg w-full shadow-2xl backdrop-blur-md space-y-6 text-center"
        >
          {/* Tag / Vibe */}
          <div className="mx-auto inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase font-mono">
            <Sparkles className="w-3 h-3" /> Toyota Kata & Balanced Scorecard
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Auktoriserad Inloggning
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Koordinera dina strategiska KPI:er (BSC) och Toyota Kata coaching-experiment i realtid med kollegor via molnet.
            </p>
          </div>

          {/* Action buttons list */}
          <div className="space-y-3 pt-2">
            
            {/* 1. Google sign-in */}
            <button
              onClick={onGoogleSignIn}
              disabled={authState.loading}
              className="w-full relative flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 py-3.5 px-5 rounded-2xl text-xs font-bold font-display transition duration-150 shadow-md hover:shadow-lg hover:-translate-y-0.5 pointer-events-auto disabled:opacity-50 cursor-pointer text-center"
            >
              {authState.loading ? (
                <div className="w-4 h-4 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.102 1.025 5.047 1.926l3.227-3.107C18.28 1.445 15.42 0 12.24 0c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.923 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24Z" />
                </svg>
              )}
              <span className="text-center">{authState.loading ? 'Hämtar Google-konto...' : 'Logga in med Google'}</span>
            </button>

            {/* 2. Guest bypass / offline fallback */}
            <button
              onClick={onContinueOffline}
              disabled={authState.loading}
              className={`w-full flex items-center justify-between border transition duration-200 cursor-pointer py-3.5 px-5 rounded-2xl text-xs font-semibold ${
                authState.error && (typeof authState.error === 'string' && (authState.error === 'auth/unauthorized-domain' || authState.error.includes('unauthorized-domain')))
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-500 shadow-lg animate-pulse'
                  : 'bg-slate-700/40 hover:bg-slate-700/80 border-slate-650 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Laptop className={`w-4 h-4 ${
                  authState.error && (typeof authState.error === 'string' && (authState.error === 'auth/unauthorized-domain' || authState.error.includes('unauthorized-domain')))
                    ? 'text-white'
                    : 'text-slate-400'
                }`} />
                <span className="text-left font-display">
                  {authState.error && (typeof authState.error === 'string' && (authState.error === 'auth/unauthorized-domain' || authState.error.includes('unauthorized-domain')))
                    ? 'Börja genast! Starta i Demoläge / Gäst'
                    : 'Fortsätt lokalt (Offline-gäst)'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  authState.error && (typeof authState.error === 'string' && (authState.error === 'auth/unauthorized-domain' || authState.error.includes('unauthorized-domain')))
                    ? 'bg-emerald-800 text-emerald-200'
                    : 'bg-slate-800 text-slate-400'
                }`}>Fungerar direkt</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </button>
          </div>

          {authState.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-350 rounded-2xl text-left text-xs space-y-3">
              <span className="font-bold flex items-center gap-1.5 text-red-400 font-display text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 animate-pulse" /> Inloggningsfel
              </span>
              
              {authState.error && (typeof authState.error === 'string' && (authState.error === 'auth/unauthorized-domain' || authState.error.includes('unauthorized-domain'))) ? (
                <div className="space-y-2.5 text-[11px] leading-relaxed">
                  <p>
                    <strong>Google-domänen är inte godkänd i Firebase!</strong> Detta händer eftersom domänen som denna webbapp körs på (<code className="bg-slate-900 border border-slate-800 px-1 py-0.5 rounded font-semibold text-white">{typeof window !== 'undefined' ? window.location.hostname : 'goal-management-alpha.vercel.app'}</code>) inte har lagts till i listan över godkända omdirigeringsdomäner i ditt Firebase-projekt.
                  </p>
                  
                  <div className="bg-emerald-950/40 border border-emerald-500/25 rounded-xl p-3 text-emerald-300 space-y-1.5 text-[11px]">
                    <p className="font-semibold text-emerald-200">🚀 Snabb bypass tillgänglig:</p>
                    <p>
                      Klicka på den gröna blinkande knappen <strong>"Börja genast! Starta i Demoläge / Gäst"</strong> ovan för att komma in direkt i appen med fullständigt administratörskonto utan krångliga inställningar.
                    </p>
                  </div>

                  <p className="font-semibold text-white pt-1 border-t border-slate-750">Föredrar du att aktivera Google Logga In nu? Gör så här:</p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 font-sans text-[10.5px]">
                    <li>Gå till <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-400 font-bold underline hover:text-indigo-300 inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3 inline" /></a></li>
                    <li>Välj fliken <strong>Authentication</strong> &rarr; klicka på fliken <strong>Settings</strong></li>
                    <li>Klicka på sektionen <strong>Authorized domains</strong> (Godkända domäner)</li>
                    <li>Klicka på <strong>Add domain</strong> (Lägg till domän) och lägg till:</li>
                  </ol>
                  
                  <div className="bg-slate-950 border border-slate-750 rounded-xl p-3 font-mono text-[10px] space-y-2 shadow-inner">
                    <div className="text-slate-400 flex justify-between items-center text-[9px] uppercase tracking-wider font-semibold border-b border-slate-800 pb-1.5">
                      <span>Kopiera din aktuella domän:</span>
                      <span className="text-emerald-400">Aktiv</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-emerald-400">
                      <span className="break-all select-all font-semibold font-mono text-xs">{typeof window !== 'undefined' ? window.location.hostname : 'goal-management-alpha.vercel.app'}</span>
                      <button 
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(window.location.hostname);
                            alert('Domänen kopierades till urklipp!');
                          }
                        }}
                        className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold font-sans cursor-pointer transition-all shrink-0 active:scale-95"
                      >
                        Kopiera
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    💡 <strong>Tips:</strong> Om du vill starta direkt utan att ändra Firebase-inställningar nu, klicka bara på den grå knappen <strong>"Fortsätt lokalt (Offline-gäst)"</strong> ovanför så kommer du in direkt och surfar helt lokalt!
                  </p>
                </div>
              ) : (
                <p className="text-[11px] leading-normal font-mono opacity-90">{authState.error}</p>
              )}
            </div>
          )}

          {/* Quick instructions & security policy */}
          <div className="border-t border-slate-750 pt-5 text-left text-[11px] text-slate-400 space-y-1.5">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="text-indigo-400 font-semibold hover:underline flex items-center gap-1 font-sans cursor-pointer text-xs mb-1"
            >
              <Info className="w-3.5 h-3.5" /> Hur fungerar behörighetssystemet?
            </button>
            
            {showInfo && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-850 p-3 rounded-xl border border-slate-750 leading-relaxed space-y-1.5 text-slate-300 font-mono text-[10px]"
              >
                <p>1. När du loggar in med ditt Google-konto gör systemet en slagning mot inbjudningslistan (<code className="bg-slate-800 px-1 rounded">members</code>).</p>
                <p>2. Om din e-post finns registrerad tas du direkt in med önskad behörighet.</p>
                <p>3. <strong className="text-slate-100">Bootstrap skydd:</strong> Om databasen är helt ny blir den första användaren som loggar in automatiskt huvudadministratör, vilket hindrar utlåsning.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full z-10 text-center opacity-40 text-[10px] font-mono leading-none py-1 text-slate-400">
        MålRamverk Alignment Platform • Toyota Kata coaching engine • Port 3000 Container Proxy
      </footer>

    </div>
  );
}
