/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Target,
  Briefcase,
  TrendingUp,
  Scale,
  Layers,
  Globe,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LiveAudioPlayer, 
  floatTo16BitPCM, 
  uint8ArrayToBase64 
} from '../utils/audioStreamer';
import { Goal, Project, KPI, KataSession, CtqKanoItem } from '../types';

export type VoiceCoachTopic = 
  | 'all' 
  | 'goals' 
  | 'projects' 
  | 'kpis' 
  | 'vsm' 
  | 'kano' 
  | 'kata';

interface VoiceCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  projects: Project[];
  kpis: KPI[];
  kataSessions: KataSession[];
  ctqKanoItems: CtqKanoItem[];
  initialTopic?: VoiceCoachTopic;
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
  ctqKanoItems,
  initialTopic = 'all'
}: VoiceCoachModalProps) {
  // Topic Focus Selector
  const [selectedTopic, setSelectedTopic] = useState<VoiceCoachTopic>(initialTopic);

  // Connection and Session States
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'ready' | 'speaking' | 'listening' | 'error' | 'closed'
  >('connecting');
  const [statusMessage, setStatusMessage] = useState<string>('Initierar anslutning till gemini-3.8-live...');
  const [activeVoice, setActiveVoice] = useState<string>('Zephyr');
  
  // Microphone & Speaker controls
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [speechRecActive, setSpeechRecActive] = useState<boolean>(false);

  // Audio Visualizer Levels (0.0 to 1.0)
  const [userAudioLevel, setUserAudioLevel] = useState<number>(0);
  const [aiAudioLevel, setAiAudioLevel] = useState<number>(0);

  // Transcripts
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hej! Jag är din strategiska AI-partner för hela verksamheten. Prata med mig om allt från Mål, Projekt och KPI:er till VSM-flöden, Kano-kundkrav och Toyota Kata!',
      timestamp: new Date()
    }
  ]);
  const [textInput, setTextInput] = useState('');

  // Refs for audio hardware and streaming
  const eventSourceRef = useRef<EventSource | null>(null);
  const sessionIdRef = useRef<string>('');
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const audioChunkBufferRef = useRef<Float32Array[]>([]);
  const lastAudioSendTimeRef = useRef<number>(0);

  // Suggested conversational starter prompts depending on active topic
  const starterPromptsMap: Record<VoiceCoachTopic, string[]> = {
    all: [
      'Ge en övergripande nulägesanalys av vår verksamhet',
      'Hur hänger våra mål, projekt och KPI:er ihop?',
      'Vilka är våra största strategiska risker just nu?',
      'Hur kan vi förbättra samarbetet mellan metodikerna?'
    ],
    goals: [
      'Hjälp mig formulera ett nytt SMART strategiskt mål',
      'Vilka av våra mål har lägst framdrift och varför?',
      'Hur säkerställer vi att målen stöttas av rätt projekt?'
    ],
    projects: [
      'Vilka projekt löper störst risk för försening?',
      'Hur bryter vi ner projekt i mindre mätbara milstolpar?',
      'Hjälp mig prioritera bland våra pågående projekt'
    ],
    kpis: [
      'Hur balanserar våra 4 Balanced Scorecard-perspektiv?',
      'Har vi bra ledande indikatorer (Lead) eller bara släpande (Lag)?',
      'Föreslå KPI:er för perspektivet Lärande & Förnyelse'
    ],
    vsm: [
      'Hur analyserar vi våra flaskhalsar och kötider i VSM?',
      'Vad är ett realistiskt mål för vår processverkningsgrad (PCE)?',
      'Vilka förbättringar ger snabbast minskning av ledtiden?'
    ],
    kano: [
      'Hur översätter vi kundintervjuer till mätbara CTQ-krav?',
      'Vad skiljer Must-be hygienkrav från Delighter-faktorer?',
      'Hur kopplar vi CTQ-kraven direkt till våra KPI:er?'
    ],
    kata: [
      'Coacha mig genom Toyota Katas 5 standardfrågor',
      'Hur definierar jag ett tydligt måltillstånd?',
      'Hjälp mig formulera nästa snabba PDCA-experiment'
    ]
  };

  const starterPrompts = starterPromptsMap[selectedTopic] || starterPromptsMap.all;

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

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
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

    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch (e) {}
      eventSourceRef.current = null;
    }

    setUserAudioLevel(0);
    setAiAudioLevel(0);
    setSpeechRecActive(false);
  };

  const sendInputToLiveSession = (payload: any) => {
    if (!sessionIdRef.current) return;
    fetch('/api/live/input', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionIdRef.current,
        ...payload
      })
    }).catch((err) => {
      console.warn('[Live Voice Client] Failed to send input:', err);
    });
  };

  const handleTopicSwitch = (topic: VoiceCoachTopic) => {
    setSelectedTopic(topic);
    const labels: Record<VoiceCoachTopic, string> = {
      all: 'Hela Verksamheten',
      goals: 'Strategiska Mål (Goals)',
      projects: 'Operativa Projekt',
      kpis: 'KPI:er & Scorecard',
      vsm: 'Värdeflödesanalys (VSM)',
      kano: 'Kano & Kundkrav (CTQ)',
      kata: 'Toyota Kata Coaching'
    };
    sendInputToLiveSession({
      text: `[Fokusbyte]: Jag vill nu diskutera och fokusera på området "${labels[topic]}". Ge mig en kort introduktion och fråga vad vi ska börja med inom detta område.`
    });
  };

  const startSession = async () => {
    cleanupAudio();
    setConnectionStatus('connecting');
    setStatusMessage('Ansluter till gemini-3.8-live röstcoach...');

    // 1. Initialize Audio Player for 24kHz model output
    audioPlayerRef.current = new LiveAudioPlayer();
    audioPlayerRef.current.init();

    // 2. Open HTTP Server-Sent Events stream to backend
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    sessionIdRef.current = sessionId;

    const streamUrl = `/api/live/stream?sessionId=${sessionId}&voice=${encodeURIComponent(activeVoice)}`;
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log('[Live Voice Client] Live SSE stream connected to gemini-3.8-live');
    };

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'status') {
          if (msg.status === 'ready') {
            setConnectionStatus('ready');
            setStatusMessage('Klar! Mikrofonen lyssnar — prata fritt eller skriv.');
            // Initialize mic and speech recognition
            startMicrophoneAndSpeechRecognition();
            // Ground with current strategic context
            sendInputToLiveSession({
              context: {
                goalsCount: goals.length,
                goals: goals.map((g) => ({ title: g.title, category: g.category, progress: g.progress })),
                projectsCount: projects.length,
                projects: projects.map((p) => ({ title: p.title, progress: p.progress })),
                kpisCount: kpis.length,
                kpis: kpis.map((k) => ({ title: k.title, value: k.value, target: k.target, progress: k.progress })),
                kataCount: kataSessions.length,
                kataSessions: kataSessions.map((k) => ({ title: k.title, nextStep: k.nextStep, obstacles: k.obstacles })),
                kanoCount: ctqKanoItems.length
              }
            });
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

    es.onerror = () => {
      console.warn('[Live Voice Client] SSE Stream status update');
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

  const startMicrophoneAndSpeechRecognition = async () => {
    // A. Start Web Speech API Recognition for 100% reliable Swedish transcription
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'sv-SE';

        recognition.onstart = () => {
          setSpeechRecActive(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0]?.transcript?.trim();
          if (text) {
            console.log('[Live Voice Client] SpeechRecognition recognized:', text);
            // Append to transcripts
            setTranscripts((prev) => [
              ...prev,
              {
                id: `tr-user-${Date.now()}`,
                role: 'user',
                text,
                timestamp: new Date()
              }
            ]);
            // Send text directly to live session
            sendInputToLiveSession({ text });
            setConnectionStatus('listening');
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('[Live Voice Client] SpeechRecognition warning:', e?.error);
        };

        recognition.onend = () => {
          // Restart if still open and not muted
          if (!isMicMuted && isOpen) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (recErr) {
        console.warn('[Live Voice Client] Could not start SpeechRecognition:', recErr);
      }
    }

    // B. Start Hardware Microphone Audio Capture & 16kHz PCM streaming
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
        const level = Math.min(1, rms * 4.5);
        setUserAudioLevel(level);

        // Buffer audio chunks and send every ~250ms when voice activity is present
        const now = Date.now();
        audioChunkBufferRef.current.push(new Float32Array(inputBuffer));

        if (now - lastAudioSendTimeRef.current > 250) {
          lastAudioSendTimeRef.current = now;
          const chunks = audioChunkBufferRef.current;
          audioChunkBufferRef.current = [];

          if (chunks.length > 0) {
            const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
            const merged = new Float32Array(totalLen);
            let offset = 0;
            for (const c of chunks) {
              merged.set(c, offset);
              offset += c.length;
            }

            // Resample and convert to 16-bit PCM little-endian
            const pcmBytes = floatTo16BitPCM(merged, inputCtx.sampleRate, 16000);
            const base64 = uint8ArrayToBase64(pcmBytes);

            // Send to server (which passes it as media: { data, mimeType } to Gemini Live)
            sendInputToLiveSession({ audio: base64 });
          }
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);

    } catch (err: any) {
      console.warn('[Live Voice Client] Microphone permission failed:', err);
      setStatusMessage('Kunde inte få åtkomst till mikrofonen. Använd textrutan nedan.');
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
    if (speechRecognitionRef.current) {
      if (next) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      } else {
        try { speechRecognitionRef.current.start(); } catch (e) {}
      }
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
    cleanupAudio();
    setTimeout(() => {
      startSession();
    }, 100);
  };

  const handleSendPrompt = (text: string) => {
    if (!text.trim()) return;

    setTranscripts((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text,
        timestamp: new Date()
      }
    ]);

    sendInputToLiveSession({ text });
    setTextInput('');
  };

  if (!isOpen) return null;

  const topicsList: { id: VoiceCoachTopic; label: string; icon: any }[] = [
    { id: 'all', label: 'Hela Appen', icon: Globe },
    { id: 'goals', label: 'Mål & Visioner', icon: Target },
    { id: 'projects', label: 'Projekt', icon: Briefcase },
    { id: 'kpis', label: 'KPI & BSC', icon: TrendingUp },
    { id: 'vsm', label: 'VSM Flöde', icon: Activity },
    { id: 'kano', label: 'Kano & CTQ', icon: Scale },
    { id: 'kata', label: 'Toyota Kata', icon: RefreshCw }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl h-[90vh] max-h-[800px] shadow-2xl flex flex-col overflow-hidden text-left"
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
                    Strategisk AI-Röstpartner
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

          {/* Topic Focus Selector Bar (Across entire app) */}
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-indigo-400" />
              Fokusområde:
            </span>
            {topicsList.map((t) => {
              const Icon = t.icon;
              const isActive = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTopicSwitch(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Central Animated Visualizer Section */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-920 to-slate-950 p-5 flex flex-col items-center justify-center relative overflow-hidden border-b border-slate-800/80">
            {/* Background Glow effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

            {/* Pulsing Orb Visualizer */}
            <div className="relative w-28 h-28 flex items-center justify-center my-1">
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
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative z-10 ${
                  aiAudioLevel > 0.05
                    ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-rose-500/50 scale-105'
                    : userAudioLevel > 0.05
                    ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-indigo-500/50 scale-105'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 shadow-slate-900/50'
                }`}
              >
                {aiAudioLevel > 0.05 ? (
                  <Activity className="w-7 h-7 animate-pulse text-white" />
                ) : userAudioLevel > 0.05 ? (
                  <Mic className="w-7 h-7 animate-bounce text-white" />
                ) : (
                  <Bot className="w-7 h-7 text-indigo-400" />
                )}
              </div>
            </div>

            {/* Dynamic Real-time Status Badge */}
            <div className="mt-1 text-center z-10">
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
                    AI talar i högtalaren (24kHz)...
                  </>
                ) : userAudioLevel > 0.05 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    Hör din röst i realtid...
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Mikrofon aktiv & taligenkänning redo • Säg vad som helst!
                  </>
                )}
              </span>
            </div>

            {/* Equalizer Frequency Bars */}
            <div className="flex items-center gap-1 mt-3 h-5">
              {[0.4, 0.7, 1.0, 0.6, 0.8, 1.2, 0.5, 0.9, 0.3, 0.7, 1.1, 0.6].map((mult, idx) => {
                const combinedLevel = Math.max(userAudioLevel, aiAudioLevel);
                const height = Math.max(3, Math.min(20, combinedLevel * 24 * mult));
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
              Frågeförslag:
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
                placeholder="Skriv textfråga eller tala i mic..."
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
