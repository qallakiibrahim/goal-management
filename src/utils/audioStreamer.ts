/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to convert binary Uint8Array to Base64 string safely
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 string to Uint8Array safely
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Resamples Float32 audio buffer from sourceRate to targetRate (16000 Hz)
// and converts to 16-bit signed PCM little-endian byte array
export function floatTo16BitPCM(
  inputData: Float32Array,
  sourceRate: number,
  targetRate: number = 16000
): Uint8Array {
  let samples: Float32Array;

  if (sourceRate === targetRate) {
    samples = inputData;
  } else {
    // Linear interpolation resampler
    const ratio = sourceRate / targetRate;
    const newLength = Math.round(inputData.length / ratio);
    samples = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const position = i * ratio;
      const index = Math.floor(position);
      const decimal = position - index;
      const sample1 = inputData[index] || 0;
      const sample2 = inputData[index + 1] || sample1;
      samples[i] = sample1 + decimal * (sample2 - sample1);
    }
  }

  // Convert Float32 (-1.0 to 1.0) to 16-bit PCM little-endian
  const output = new Uint8Array(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    // Clamp to [-1.0, 1.0]
    let s = Math.max(-1, Math.min(1, samples[i]));
    // Scale to signed 16-bit int (-32768 to 32767)
    let val = s < 0 ? s * 0x8000 : s * 0x7fff;
    val = Math.round(val);
    output[i * 2] = val & 0xff;
    output[i * 2 + 1] = (val >> 8) & 0xff;
  }

  return output;
}

// Converts 16-bit PCM little-endian Uint8Array (from 24kHz Gemini Live output) to Float32Array
export function pcm16ToFloat32(pcmData: Uint8Array): Float32Array {
  const numSamples = Math.floor(pcmData.byteLength / 2);
  const float32 = new Float32Array(numSamples);
  const dataView = new DataView(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);

  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true); // true = little-endian
    float32[i] = int16 < 0 ? int16 / 32768.0 : int16 / 32767.0;
  }

  return float32;
}

// Audio Player Manager for Gemini Live 24kHz PCM gapless playback
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted = false;

  constructor() {
    // Lazy initialized on first user gesture
  }

  public init() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx({ sampleRate: 24000 });
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 1.0;

      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.nextStartTime = this.audioCtx.currentTime;
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playChunkBase64(base64Data: string) {
    this.init();
    if (!this.audioCtx || !this.gainNode) return;

    try {
      const bytes = base64ToUint8Array(base64Data);
      const float32 = pcm16ToFloat32(bytes);
      if (float32.length === 0) return;

      const buffer = this.audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode);

      const now = this.audioCtx.currentTime;
      // Schedule gaplessly: if nextStartTime is in the past, reset to now
      const startTime = Math.max(now + 0.01, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + buffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
      };
    } catch (err) {
      console.warn('[LiveAudioPlayer] Error playing audio chunk:', err);
    }
  }

  public interrupt() {
    // Instantly stop all playing and scheduled sources
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // Source might already have ended
      }
    });
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : 1.0, this.audioCtx.currentTime);
    }
  }

  public getVolumeRMS(): number {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const val = (data[i] - 128) / 128;
      sum += val * val;
    }
    return Math.sqrt(sum / data.length);
  }

  public close() {
    this.interrupt();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
    this.audioCtx = null;
    this.analyser = null;
    this.gainNode = null;
  }
}
