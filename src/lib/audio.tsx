import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Lightweight Web Audio API SFX system — redesigned for a soft, organic
 * "premium app" feel (think macOS UI sounds) instead of the earlier
 * synth-beep tones. Every sound is a short filtered-noise "pop" (a tapered
 * noise burst through a lowpass filter) blended with a very quiet sine
 * "thump" for warmth — no oscillator beeps, nothing that reads as
 * synthetic/8-bit.
 * - Never autoplays: the AudioContext is only created/resumed after a real
 *   user gesture (first pointerdown anywhere on the page).
 * - Every sound is synthesized on the fly (no external audio files).
 * - Volume stays low and short by design.
 * - Muting is persisted in localStorage; the toggle lives in the nav.
 */

const STORAGE_KEY = "enzo-dev-sfx-enabled";
const BASE_GAIN = 0.06;

interface PopOptions {
  freq?: number;
  duration?: number;
  gain?: number;
  noiseMix?: number;
  toneMix?: number;
}

interface AudioApi {
  enabled: boolean;
  toggleEnabled: () => void;
  enableAudio: () => void;
  hoverSfx: () => void;
  clickSfx: () => void;
  successSfx: () => void;
  playModeSfx: () => void;
  /** Reality Warp transition: a heavy, felt-more-than-heard sub-bass thump
   *  for the initial click ("effet sous-marin"). */
  warpThumpSfx: () => void;
  /** Reality Warp transition: a muffled engine-rev pitch sweep over
   *  `durationSec`, timed to the boost/accelerate phase. */
  warpRevSfx: (durationSec: number) => void;
  /** Reality Warp transition: one crisp, clean, high "pop" for the impact
   *  moment — distinct from the softer everyday click/hover pops. */
  warpImpactSfx: () => void;
}

const AudioCtx = createContext<AudioApi | null>(null);

function makeNoiseBuffer(ac: AudioContext) {
  const length = Math.floor(ac.sampleRate * 0.09);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    // Amplitude tapers toward the tail so it reads as a soft "pop" instead
    // of a harsh burst, even before the gain envelope is applied.
    const taper = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * taper * taper;
  }
  return buffer;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setEnabled(stored === "1");
    } catch {
      /* localStorage unavailable — keep default */
    }
  }, []);

  const enableAudio = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
      return;
    }
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ac = new Ctor();
    ctxRef.current = ac;
    noiseBufferRef.current = makeNoiseBuffer(ac);
  }, []);

  // Arm on the very first pointer/key gesture anywhere on the page.
  useEffect(() => {
    const onGesture = () => enableAudio();
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [enableAudio]);

  const pop = useCallback(
    ({ freq = 900, duration = 0.05, gain = BASE_GAIN, noiseMix = 1, toneMix = 0.35 }: PopOptions) => {
      const ac = ctxRef.current;
      const noiseBuffer = noiseBufferRef.current;
      if (!ac || !enabled) return;
      const now = ac.currentTime;

      if (noiseMix > 0 && noiseBuffer) {
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ac.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = freq;
        filter.Q.value = 0.6;
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * noiseMix), now + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        src.connect(filter).connect(g).connect(ac.destination);
        src.start(now);
        src.stop(now + duration + 0.02);
      }

      if (toneMix > 0) {
        const osc = ac.createOscillator();
        const g2 = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * 0.42, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.26), now + duration);
        g2.gain.setValueAtTime(0.0001, now);
        g2.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * toneMix), now + 0.006);
        g2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.1);
        osc.connect(g2).connect(ac.destination);
        osc.start(now);
        osc.stop(now + duration * 1.1 + 0.02);
      }
    },
    [enabled]
  );

  const hoverSfx = useCallback(() => {
    pop({ freq: 1500, duration: 0.03, gain: BASE_GAIN * 0.4, toneMix: 0.12 });
  }, [pop]);

  const clickSfx = useCallback(() => {
    pop({ freq: 950, duration: 0.055, gain: BASE_GAIN, toneMix: 0.4 });
  }, [pop]);

  const successSfx = useCallback(() => {
    [640, 860, 1080].forEach((freq, i) => {
      setTimeout(() => pop({ freq, duration: 0.07, gain: BASE_GAIN * 0.85, toneMix: 0.45 }), i * 80);
    });
  }, [pop]);

  const playModeSfx = useCallback(() => {
    pop({ freq: 520, duration: 0.13, gain: BASE_GAIN * 0.9, toneMix: 0.55 });
  }, [pop]);

  const warpThumpSfx = useCallback(() => {
    const ac = ctxRef.current;
    if (!ac || !enabled) return;
    const now = ac.currentTime;

    // Deep sine body — the "felt, not heard" sub-bass thump.
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(72, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.32);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(BASE_GAIN * 3.2, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    osc.connect(g).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.45);

    // A short filtered-noise transient layered underneath for a bit of
    // "underwater" texture instead of a pure clean sine thump.
    const noiseBuffer = noiseBufferRef.current;
    if (noiseBuffer) {
      const src = ac.createBufferSource();
      src.buffer = noiseBuffer;
      const filter = ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 220;
      const ng = ac.createGain();
      ng.gain.setValueAtTime(0.0001, now);
      ng.gain.exponentialRampToValueAtTime(BASE_GAIN * 0.9, now + 0.01);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      src.connect(filter).connect(ng).connect(ac.destination);
      src.start(now);
      src.stop(now + 0.22);
    }
  }, [enabled]);

  const warpRevSfx = useCallback(
    (durationSec: number) => {
      const ac = ctxRef.current;
      if (!ac || !enabled) return;
      const now = ac.currentTime;
      const dur = Math.max(0.15, durationSec);

      // A muffled sawtooth engine growl, low-passed and swept upward —
      // "monte dans les tours" without turning into a harsh synth lead.
      const osc = ac.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + dur);

      const filter = ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 4;
      filter.frequency.setValueAtTime(260, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + dur);

      // A gentle soft-clip curve for a touch of grit/distortion, kept
      // subtle so it reads as an engine, not a distortion pedal.
      const shaper = ac.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * 2 - 1;
        curve[i] = Math.tanh(x * 2.2);
      }
      shaper.curve = curve;

      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(BASE_GAIN * 0.8, now + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(BASE_GAIN * 1.1, now + dur * 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.08);

      osc.connect(filter).connect(shaper).connect(g).connect(ac.destination);
      osc.start(now);
      osc.stop(now + dur + 0.1);
    },
    [enabled]
  );

  const warpImpactSfx = useCallback(() => {
    pop({ freq: 2600, duration: 0.045, gain: BASE_GAIN * 1.6, noiseMix: 0.5, toneMix: 0.9 });
  }, [pop]);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<AudioApi>(
    () => ({
      enabled,
      toggleEnabled,
      enableAudio,
      hoverSfx,
      clickSfx,
      successSfx,
      playModeSfx,
      warpThumpSfx,
      warpRevSfx,
      warpImpactSfx,
    }),
    [
      enabled,
      toggleEnabled,
      enableAudio,
      hoverSfx,
      clickSfx,
      successSfx,
      playModeSfx,
      warpThumpSfx,
      warpRevSfx,
      warpImpactSfx,
    ]
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
