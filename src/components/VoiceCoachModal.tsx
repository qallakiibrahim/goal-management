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
  Globe,
  Compass,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LiveAudioPlayer, 
  floatTo16BitPCM, 
  uint8ArrayToBase64 
} from '../utils/audioStreamer';
import {
  Goal,
  Objective,
  Project,
  Initiative,
  Task,
  KPI,
  KataSession,
  CtqKanoItem,
  MatrixRelation,
  Member
} from '../types';
import { summarizeVsmStreamsForAi } from '../utils/vsmHelpers';
import { computeXMatrixGaps } from '../utils/xMatrixHelpers';

export type VoiceCoachTopic = 
  | 'all' 
  | 'goals' 
  | 'projects' 
  | 'kpis' 
  | 'x-matrix'
  | 'vsm' 
  | 'kano' 
  | 'kata';

interface VoiceCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  objectives?: Objective[];
  projects: Project[];
  initiatives?: Initiative[];
  tasks?: Task[];
  kpis: KPI[];
  kataSessions: KataSession[];
  ctqKanoItems: CtqKanoItem[];
  matrixRelations?: MatrixRelation[];
  members?: Member[];
  activeProfile?: { name: string; email?: string; role: string };
  currentView?: string;
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
  objectives = [],
  projects,
  initiatives = [],
  tasks = [],
  kpis,
  kataSessions,
  ctqKanoItems,
  matrixRelations = [],
  members = [],
  activeProfile,
  currentView,
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
  const [micStatus, setMicStatus] = useState<'pending' | 'active' | 'denied' | 'unavailable'>('pending');
  const [micError, setMicError] = useState<string | null>(null);

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

  // Refs for audio hardware, streaming, and avoiding stale closures
  const eventSourceRef = useRef<EventSource | null>(null);
  const sessionIdRef = useRef<string>('');
  const sessionReadyRef = useRef<boolean>(false);
  const isMicMutedRef = useRef<boolean>(false);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const audioChunkBufferRef = useRef<Float32Array[]>([]);
  const lastAudioSendTimeRef = useRef<number>(0);

  // Keep ref in sync with state
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

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
    'x-matrix': [
      'Vilka strategiska glapp finns i vår Hoshin X-Matris just nu?',
      'Vilka KPI:er saknar drivande projekt eller utpekad ägare?',
      'Hur stärker vi kopplingen från Mål till Projekt?'
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

  const cleanupMicrophone = () => {
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    if (silentGainRef.current) {
      try {
        silentGainRef.current.disconnect();
      } catch (e) {}
      silentGainRef.current = null;
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

    audioChunkBufferRef.current = [];
    setUserAudioLevel(0);
  };

  const cleanupAudio = () => {
    sessionReadyRef.current = false;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    cleanupMicrophone();

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

    setAiAudioLevel(0);
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
      goals: 'Strategiska Mål & Delmål',
      projects: 'Operativa Projekt, Initiativ & Uppgifter',
      kpis: 'KPI:er & Balanced Scorecard',
      'x-matrix': 'Hoshin Kanri X-Matris & Strategiska Glapp',
      vsm: 'Värdeflödesanalys (VSM)',
      kano: 'Kano & Kundkrav (CTQ)',
      kata: 'Toyota Kata Coaching'
    };
    sendInputToLiveSession({
      text: `[Fokusbyte]: Jag vill nu diskutera och fokusera på området "${labels[topic]}". Ge mig en kort introduktion baserad på vår verkliga data och fråga vad vi ska börja med.`
    });
  };

  const initMicrophone = async () => {
    cleanupMicrophone();
    setMicStatus('pending');
    setMicError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicStatus('unavailable');
      setMicError('Webbläsaren blockerar mikrofonåtkomst i denna vy (saknar mediaDevices-stöd eller säker kontext).');
      return;
    }

    try {
      // Check browser permission status first if available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (perm.state === 'denied') {
            setMicStatus('denied');
            setMicError('Mikrofonen är blockerad i webbläsarens behörigheter för den här sidan.');
            return;
          }
        } catch {
          // Safari/Firefox may not support permissions.query({ name: 'microphone' }), continue to getUserMedia
        }
      }

      // Request hardware microphone without strict sampleRate constraint (resampler handles any sampleRate)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (constraintErr: any) {
        if (constraintErr?.name === 'OverconstrainedError' || constraintErr?.name === 'ConstraintNotSatisfiedError') {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw constraintErr;
        }
      }

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx();
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      // Silent gain sink keeps ScriptProcessor active without audio loopback/echo
      const silentGain = inputCtx.createGain();
      silentGain.gain.value = 0;
      silentGainRef.current = silentGain;

      processor.onaudioprocess = (e) => {
        if (isMicMutedRef.current) {
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

        // Wait until Gemini Live session is ready before streaming PCM chunks
        if (!sessionReadyRef.current) {
          return;
        }

        // Buffer audio chunks and send every ~250ms
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

            // Resample from hardware sampleRate to 16000Hz 16-bit PCM little-endian
            const pcmBytes = floatTo16BitPCM(merged, inputCtx.sampleRate, 16000);
            const base64 = uint8ArrayToBase64(pcmBytes);

            sendInputToLiveSession({ audio: base64 });
          }
        }
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(inputCtx.destination);

      setMicStatus('active');
      setMicError(null);
      if (sessionReadyRef.current) {
        setStatusMessage('Klar! Mikrofonen lyssnar — prata fritt eller skriv.');
      }
    } catch (err: any) {
      console.warn('[Live Voice Client] Microphone permission/device failed:', err);
      const errName = err?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errName === 'SecurityError') {
        setMicStatus('denied');
        setMicError(
          'Mikrofonbehörighet nekades (NotAllowedError). Tillåt mikrofonen i webbläsarens adressfält eller ladda om sidan.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setMicStatus('unavailable');
        setMicError('Ingen mikrofon hittades på den här enheten. Anslut en mikrofon eller använd textrutan nedan.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setMicStatus('unavailable');
        setMicError('Mikrofonen används redan av ett annat program eller en annan flik.');
      } else {
        setMicStatus('denied');
        setMicError(`Kunde inte starta mikrofonen (${errName || 'okänt fel'}). Använd textrutan nedan eller försök igen.`);
      }
    }
  };

  const startSession = async () => {
    cleanupAudio();
    setConnectionStatus('connecting');
    setStatusMessage('Ansluter till gemini-3.8-live röstcoach...');

    // 1. Initialize Audio Player for 24kHz model output
    audioPlayerRef.current = new LiveAudioPlayer();
    audioPlayerRef.current.init();

    // 2. Request Microphone immediately (preserves user gesture on Safari/iPad/Chrome)
    initMicrophone();

    // 3. Open HTTP Server-Sent Events stream to backend
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
            sessionReadyRef.current = true;
            setConnectionStatus('ready');
            setStatusMessage('Klar! Mikrofonen lyssnar — prata fritt eller skriv.');
            // Ground with complete strategic context across the entire app
            const vsmStreams = summarizeVsmStreamsForAi();
            const xMatrixGaps = computeXMatrixGaps({
              goals,
              objectives,
              projects,
              initiatives,
              kpis,
              relations: matrixRelations,
              members
            });
            sendInputToLiveSession({
              context: {
                currentView,
                activeProfile,
                goalsCount: goals.length,
                goals: goals.map((g) => ({ id: g.id, title: g.title, category: g.category, progress: g.progress, deadline: g.deadline, ownerId: g.ownerId })),
                objectivesCount: objectives.length,
                objectives: objectives.map((o) => ({ id: o.id, goalId: o.goalId, title: o.title, kpi: o.kpi, progress: o.progress, deadline: o.deadline })),
                projectsCount: projects.length,
                projects: projects.map((p) => ({ id: p.id, title: p.title, goalId: p.goalId, objectiveId: p.objectiveId, progress: p.progress, deadline: p.deadline, ownerId: p.ownerId })),
                initiativesCount: initiatives.length,
                initiatives: initiatives.map((i) => ({ id: i.id, projectId: i.projectId, title: i.title, kpi: i.kpi, progress: i.progress })),
                tasksCount: tasks.length,
                completedTasksCount: tasks.filter((t) => t.completed).length,
                tasks: tasks.map((t) => ({ title: t.title, completed: t.completed, projectId: t.projectId, initiativeId: t.initiativeId })),
                kpisCount: kpis.length,
                kpis: kpis.map((k) => ({ id: k.id, title: k.title, category: k.category, value: k.value, target: k.target, progress: k.progress, ownerId: k.ownerId })),
                kataCount: kataSessions.length,
                kataSessions: kataSessions.map((k) => ({ title: k.title, goal: k.goal, current: k.current, obstacles: k.obstacles, nextStep: k.nextStep, learnings: k.learnings, progress: k.progress })),
                kanoCount: ctqKanoItems.length,
                ctqKanoItems: ctqKanoItems.map((c) => ({ voc: c.voc, driver: c.driver, specification: c.specification, kanoCategory: c.kanoCategory, priority: c.priority })),
                matrixRelationsCount: matrixRelations.filter((r) => r.strength > 0).length,
                matrixRelations: matrixRelations
                  .filter((r) => r.strength > 0)
                  .map((r) => ({ fromId: r.fromId, toId: r.toId, strength: r.strength, note: r.note })),
                xMatrixGapsCount: xMatrixGaps.length,
                xMatrixGaps: xMatrixGaps.map((g) => ({ severity: g.severity, entityType: g.entityType, entityTitle: g.entityTitle, message: g.message })),
                vsmStreamsCount: vsmStreams.length,
                vsmStreams,
                membersCount: members.length,
                members: members.map((m) => ({ id: m.id, name: m.name, role: m.role, status: m.status }))
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

    // 4. Start Visualizer Level Polling
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

  const toggleMic = () => {
    if (micStatus === 'denied' || micStatus === 'unavailable') {
      initMicrophone();
      return;
    }
    const next = !isMicMuted;
    setIsMicMuted(next);
    isMicMutedRef.current = next;
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
    cleanupAudio();
    setTimeout(() => {
      startSession();
    }, 100);
  };

  const handleSendPrompt = (text: string) => {
    if (!text.trim()) return;

    // Ensure audio output player is resumed on user click gesture
    audioPlayerRef.current?.init();

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
    { id: 'goals', label: 'Mål & Delmål', icon: Target },
    { id: 'projects', label: 'Projekt & Uppgifter', icon: Briefcase },
    { id: 'kpis', label: 'KPI & BSC', icon: TrendingUp },
    { id: 'x-matrix', label: 'X-Matris', icon: Compass },
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
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl h-[90vh] max-h-[820px] shadow-2xl flex flex-col overflow-hidden text-left"
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
                  <span className="text-[11px] font-mono text-indigo-300">
                    · gemini-3.8-live
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
              <motion.div
                animate={{
                  scale: 1 + Math.max(userAudioLevel, aiAudioLevel) * 0.9,
                  opacity: Math.max(0.15, Math.max(userAudioLevel, aiAudioLevel) * 0.8)
                }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-rose-500/20 to-amber-500/20 blur-md"
              />

              <motion.div
                animate={{
                  scale: 1 + Math.max(userAudioLevel, aiAudioLevel) * 0.5,
                  borderColor: aiAudioLevel > 0.05 ? '#f43f5e' : userAudioLevel > 0.05 ? '#6366f1' : '#475569'
                }}
                transition={{ duration: 0.08 }}
                className="absolute inset-2 rounded-full border-2 border-indigo-500/40 opacity-70"
              />

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

            {/* Dynamic Real-time Status Text */}
            <div className="mt-1 text-center z-10 flex items-center gap-2 text-xs font-medium text-slate-300">
              {aiAudioLevel > 0.05 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span>AI talar i högtalaren (24kHz)...</span>
                </>
              ) : micStatus === 'denied' || micStatus === 'unavailable' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-300">Mikrofon saknar behörighet • Skriv eller tillåt mikrofon nedan</span>
                </>
              ) : isMicMuted ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-rose-300">Mikrofon mutad</span>
                </>
              ) : userAudioLevel > 0.05 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span className="text-indigo-200">Hör din röst i realtid...</span>
                </>
              ) : micStatus === 'active' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Mikrofon aktiv (16kHz PCM) • Prata fritt!</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Begär mikrofonåtkomst...</span>
                </>
              )}
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

          {/* Microphone Permission Diagnostic Banner */}
          {(micStatus === 'denied' || micStatus === 'unavailable') && (
            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 dark:text-amber-200 leading-snug">
                  <strong className="font-bold block">Mikrofonen behöver behörighet</strong>
                  <span className="text-[11px] text-amber-800 dark:text-amber-300">
                    {micError || 'Klicka på lås-/mikrofonikonen i webbläsarens adressfält för att tillåta mikrofon.'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={initMicrophone}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Tillåt mikrofon</span>
                </button>
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-xl text-[11px] font-semibold transition flex items-center gap-1"
                  title="Öppna appen i en egen flik för direkt mikrofonåtkomst"
                >
                  <span>Ny flik</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

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
              {/* Mic Toggle / Activate Button */}
              <button
                onClick={toggleMic}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer select-none ${
                  micStatus === 'denied' || micStatus === 'unavailable'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : isMicMuted
                    ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                title={
                  micStatus === 'denied' || micStatus === 'unavailable'
                    ? 'Försök aktivera mikrofon igen'
                    : isMicMuted
                    ? 'Slå på mikrofon'
                    : 'Muta mikrofon'
                }
              >
                {micStatus === 'denied' || micStatus === 'unavailable' ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Aktivera mikrofon</span>
                  </>
                ) : isMicMuted ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Mikrofon avstängd</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span>Mikrofon aktiv</span>
                  </>
                )}
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
