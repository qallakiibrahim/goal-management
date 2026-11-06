/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Radio, 
  Sparkles, 
  Square, 
  RefreshCw, 
  ChevronDown,
  Activity,
  Bot,
  User,
  Send,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LiveAudioPlayer, 
  floatTo16BitPCM, 
  uint8ArrayToBase64 
} from '../utils/audioStreamer';
import { Goal, Project, KPI, KataSession, CtqKanoItem } from '../types';

interface VoiceCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  projects: Project[];
  kpis: KPI[];
  kataSessions: KataSession[];
  ctqKanoItems: CtqKanoItem[];
}

interface TranscriptItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function VoiceCoachModal({
  isOpen,
  onClose,
  goals,
  projects,
  kpis,
  kataSessions,
  ctqKanoItems
}: VoiceCoachModalProps) {
  // Connection and Session States
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'ready' | 'speaking' | 'listening' | 'error' | 'closed'
  >('connecting');
  const [statusMessage, setStatusMessage] = useState<string>('Initierar anslutning till gemini-3.8-live...');
  const [activeVoice, setActiveVoice] = useState<string>('Zephyr');
  
  // Microphone & Speaker controls
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);

  // Audio Visualizer Levels (0.0 to 1.0)
  const [userAudioLevel, setUserAudioLevel] = useState<number>(0);
  const [aiAudioLevel, setAiAudioLevel] = useState<number>(0);

  // Transcripts
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hej! Jag är din strategiska röstcoach (gemini-3.8-live). Prata med mig om dina mål, Toyota Kata-experiment eller KPI-utveckling!',
      timestamp: new Date()
    }
  ]);
  const [textInput, setTextInput] = useState('');

  // Refs for audio hardware and streaming
  const socketRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested conversational starter prompts
  const starterPrompts = [
    'Coacha mig genom Toyota Katas 5 frågor',
    'Hur balanserar våra 4 Balanced Scorecard-perspektiv?',
    'Vilka projekt löper störst risk för försening?',
    'Hur hänger Kano-kraven ihop med våra strategiska KPIer?'
  ];

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Handle active session lifecycle
  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

    startSession();

    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.close();
      audioPlayerRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (e) {}
      socketRef.current = null;
    }

    setUserAudioLevel(0);
    setAiAudioLevel(0);
  };

  const startSession = async () => {
    cleanupAudio();
    setConnectionStatus('connecting');
    setStatusMessage('Ansluter till Gemini Live WebSocket-brygga...');

    // 1. Initialize Audio Player for 24kHz model output
    audioPlayerRef.current = new LiveAudioPlayer();
    audioPlayerRef.current.init();

    // 2. Open WebSocket to backend
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('[Live Voice Client] WebSocket connected to server');
      // Send current strategic context to ground the conversation
      ws.send(
        JSON.stringify({
          type: 'contextUpdate',
          context: {
            goalsCount: goals.length,
            goals: goals.map((g) => ({ title: g.title, category: g.category, progress: g.progress })),
            projectsCount: projects.length,
            projects: projects.map((p) => ({ title: p.title, progress: p.progress })),
            kpisCount: kpis.length,
            kpis: kpis.map((k) => ({ title: k.title, value: k.value, target: k.target, progress: k.progress })),
            kataCount: kataSessions.length,
            kataSessions: kataSessions.map((k) => ({ title: k.title, nextStep: k.nextStep, obstacles: k.obstacles }))
          }
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'status') {
          if (msg.status === 'ready') {
            setConnectionStatus('ready');
            setStatusMessage('Klar! Mikrofonen är aktiv — ställ din fråga.');
            // Initialize mic capture after server is ready
            startMicrophone();
          } else {
            setStatusMessage(msg.message || 'Uppdaterar status...');
          }
        } else if (msg.type === 'audio' && msg.audio) {
          setConnectionStatus('speaking');
          audioPlayerRef.current?.playChunkBase64(msg.audio);
        } else if (msg.type === 'interrupted') {
          audioPlayerRef.current?.interrupt();
          setConnectionStatus('listening');
        } else if (msg.type === 'transcript') {
          setTranscripts((prev) => {
            // Check if last transcript is from the same role to append or add new
            const last = prev[prev.length - 1];
            if (last && last.role === msg.role && Date.now() - last.timestamp.getTime() < 3000) {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...last,
                text: `${last.text} ${msg.text}`.trim()
              };
              return updated;
            } else {
              return [
                ...prev,
                {
                  id: `tr-${Date.now()}-${Math.random()}`,
                  role: msg.role,
                  text: msg.text,
                  timestamp: new Date()
                }
              ];
            }
          });
        } else if (msg.type === 'error') {
          setConnectionStatus('error');
          setStatusMessage(msg.message || 'Ett fel inträffade.');
        }
      } catch (err) {
        console.error('[Live Voice Client] Error handling message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[Live Voice Client] WebSocket error:', err);
      setConnectionStatus('error');
      setStatusMessage('Kunde inte nå röstservern. Kontrollera nätverket.');
    };

    ws.onclose = () => {
      console.log('[Live Voice Client] WebSocket closed');
      if (connectionStatus !== 'error') {
        setConnectionStatus('closed');
        setStatusMessage('Sessionen har avslutats.');
      }
    };

    // 3. Start Visualizer Level Polling
    const pollLevels = () => {
      if (audioPlayerRef.current) {
        const aiVol = audioPlayerRef.current.getVolumeRMS();
        setAiAudioLevel(Math.min(1, aiVol * 3.5));
        if (aiVol > 0.04) {
          setConnectionStatus('speaking');
        }
      }
      animFrameRef.current = requestAnimationFrame(pollLevels);
    };
    pollLevels();
  };

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx();
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      // ScriptProcessorNode for wide cross-browser audio buffer processing
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMicMuted) {
          setUserAudioLevel(0);
          return;
        }

        const inputBuffer = e.inputBuffer.getChannelData(0);

        // Compute RMS for visualizer
        let sum = 0;
        for (let i = 0; i < inputBuffer.length; i++) {
          sum += inputBuffer[i] * inputBuffer[i];
        }
        const rms = Math.sqrt(sum / inputBuffer.length);
        setUserAudioLevel(Math.min(1, rms * 4.5));

        // Resample and convert to 16-bit PCM little-endian
        const pcmBytes = floatTo16BitPCM(inputBuffer, inputCtx.sampleRate, 16000);
        const base64 = uint8ArrayToBase64(pcmBytes);

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              type: 'audio',
              audio: base64
            })
          );
        }
      };

      source.connect(processor);
      // Connect to destination to keep processing alive in WebKit/Safari
      processor.connect(inputCtx.destination);

    } catch (err: any) {
      console.warn('[Live Voice Client] Microphone permission failed:', err);
      setStatusMessage('Kunde inte få åtkomst till mikrofonen. Kontrollera behörigheter.');
    }
  };

  const toggleMic = () => {
    const next = !isMicMuted;
    setIsMicMuted(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
    }
    if (next) setUserAudioLevel(0);
  };

  const toggleSpeaker = () => {
    const next = !isSpeakerMuted;
    setIsSpeakerMuted(next);
    audioPlayerRef.current?.setMute(next);
  };

  const handleInterrupt = () => {
    audioPlayerRef.current?.interrupt();
    setConnectionStatus('listening');
  };

  const handleVoiceChange = (newVoice: string) => {
    setActiveVoice(newVoice);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'reconfigure',
          voice: newVoice,
          context: {
            goalsCount: goals.length,
            projectsCount: projects.length,
            kpisCount: kpis.length,
            kataCount: kataSessions.length
          }
        })
      );
    }
  };

  const handleSendPrompt = (text: string) => {
    if (!text.trim()) return;

    // Add to transcripts immediately
    setTranscripts((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text,
        timestamp: new Date()
      }
    ]);

    // Send over WebSocket as text input to gemini-3.8-live
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'text',
          text
        })
      );
    }

    setTextInput('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl h-[88vh] max-h-[750px] shadow-2xl flex flex-col overflow-hidden text-left"
        >
          {/* Header Bar */}
          <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-sm text-white">
                    Strategisk Röstcoach
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    gemini-3.8-live
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'ready' || connectionStatus === 'speaking' || connectionStatus === 'listening'
                        ? 'bg-emerald-400 animate-ping'
                        : connectionStatus === 'connecting'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-rose-500'
                    }`}
                  />
                  <p className="text-[11px] text-slate-300 font-mono">
                    {statusMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-2">
              {/* Voice Selector */}
              <div className="relative hidden sm:block">
                <select
                  value={activeVoice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl px-3 py-1.5 pr-8 appearance-none border border-slate-700 focus:outline-hidden font-medium cursor-pointer"
                  title="Välj röst"
                >
                  <option value="Zephyr">Röst: Zephyr (Lugn, balanserad)</option>
                  <option value="Puck">Röst: Puck (Entusiastisk, rapp)</option>
                  <option value="Charon">Röst: Charon (Djup, auktoritär)</option>
                  <option value="Kore">Röst: Kore (Mjuk, fokuserad)</option>
                  <option value="Fenrir">Röst: Fenrir (Kraftfull, skarp)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                title="Stäng röstsamtal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Animated Visualizer Section */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-920 to-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden border-b border-slate-800/80">
            {/* Background Glow effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

            {/* Pulsing Orb Visualizer */}
            <div className="relative w-36 h-36 flex items-center justify-center my-2">
              {/* Outermost reactive wave rings */}
              <motion.div
                animate={{
                  scale: 1 + Math.max(userAudioLevel, aiAudioLevel) * 0.9,
                  opacity: Math.max(0.15, Math.max(userAudioLevel, aiAudioLevel) * 0.8)
                }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-rose-500/20 to-amber-500/20 blur-md"
              />

              {/* Intermediate audio ring */}
              <motion.div
                animate={{
                  scale: 1 + Math.max(userAudioLevel, aiAudioLevel) * 0.5,
                  borderColor: aiAudioLevel > 0.05 ? '#f43f5e' : userAudioLevel > 0.05 ? '#6366f1' : '#475569'
                }}
                transition={{ duration: 0.08 }}
                className="absolute inset-2 rounded-full border-2 border-indigo-500/40 opacity-70"
              />

              {/* Central Core Orb */}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative z-10 ${
                  aiAudioLevel > 0.05
                    ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-rose-500/50 scale-105'
                    : userAudioLevel > 0.05
                    ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-indigo-500/50 scale-105'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 shadow-slate-900/50'
                }`}
              >
                {aiAudioLevel > 0.05 ? (
                  <Activity className="w-8 h-8 animate-pulse text-white" />
                ) : userAudioLevel > 0.05 ? (
                  <Mic className="w-8 h-8 animate-bounce text-white" />
                ) : (
                  <Bot className="w-8 h-8 text-indigo-400" />
                )}
              </div>
            </div>

            {/* Dynamic Real-time Status Badge */}
            <div className="mt-2 text-center z-10">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                  aiAudioLevel > 0.05
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : userAudioLevel > 0.05
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {aiAudioLevel > 0.05 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    Gemini talar (24kHz PCM)...
                  </>
                ) : userAudioLevel > 0.05 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    Lyssnar på dig (16kHz PCM)...
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Mikrofon redo • Ställ din fråga
                  </>
                )}
              </span>
            </div>

            {/* Equalizer Frequency Bars */}
            <div className="flex items-center gap-1.5 mt-4 h-6">
              {[0.4, 0.7, 1.0, 0.6, 0.8, 1.2, 0.5, 0.9, 0.3, 0.7, 1.1, 0.6].map((mult, idx) => {
                const combinedLevel = Math.max(userAudioLevel, aiAudioLevel);
                const height = Math.max(4, Math.min(24, combinedLevel * 28 * mult));
                return (
                  <motion.div
                    key={idx}
                    animate={{ height }}
                    transition={{ duration: 0.06 }}
                    className={`w-1 rounded-full ${
                      aiAudioLevel > 0.05
                        ? 'bg-rose-400'
                        : userAudioLevel > 0.05
                        ? 'bg-indigo-400'
                        : 'bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 space-y-3.5 text-left">
            {transcripts.map((item) => (
              <div
                key={item.id}
                className={`flex gap-3 max-w-[88%] ${
                  item.role === 'user' ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                    item.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  {item.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-rose-400" />}
                </div>

                <div>
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                      item.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm font-medium'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {item.text}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block px-1">
                    {item.timestamp.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          {/* Starter Chips Bar */}
          <div className="p-2.5 px-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Snabbtips:
            </span>
            {starterPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendPrompt(prompt)}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition shrink-0 cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Interactive Footer Action Controls */}
          <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Primary Voice Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              {/* Mic Toggle Button */}
              <button
                onClick={toggleMic}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer select-none ${
                  isMicMuted
                    ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                title={isMicMuted ? 'Slå på mikrofon' : 'Muta mikrofon'}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-pulse" />}
                <span>{isMicMuted ? 'Mikrofon avstängd' : 'Mikrofon aktiv'}</span>
              </button>

              {/* Interrupt / Stop talking button */}
              <button
                onClick={handleInterrupt}
                disabled={aiAudioLevel <= 0.05}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-semibold transition cursor-pointer select-none border border-slate-200 dark:border-slate-700"
                title="Avbryt tal"
              >
                <Square className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span className="hidden sm:inline">Avbryt tal</span>
              </button>

              {/* Speaker Mute button */}
              <button
                onClick={toggleSpeaker}
                className={`p-2.5 rounded-2xl text-xs transition cursor-pointer select-none border ${
                  isSpeakerMuted
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
                title={isSpeakerMuted ? 'Ljud avstängt' : 'Ljud på'}
              >
                {isSpeakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Reconnect button */}
              <button
                onClick={startSession}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs transition cursor-pointer select-none border border-slate-200 dark:border-slate-700"
                title="Starta om röstsession"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Text Input Fallback Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(textInput);
              }}
              className="flex items-center gap-2 w-full sm:w-80"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Eller skriv textfråga till röstcoachen..."
                className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-600 dark:text-white placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-2 bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
