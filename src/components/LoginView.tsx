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
  Laptop
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
              className="w-full flex items-center justify-between bg-slate-700/40 hover:bg-slate-700/80 border border-slate-650 text-slate-300 py-3.5 px-5 rounded-2xl text-xs font-semibold transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-slate-400" />
                <span className="text-left font-display">Fortsätt lokalt (Offline-gäst)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono font-medium">Backup</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          </div>

          {authState.error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-left text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 animate-pulse" /> Inloggningsfel
              </span>
              <p className="text-[11px] leading-normal font-mono opacity-90">{authState.error}</p>
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
