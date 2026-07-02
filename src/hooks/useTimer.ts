import { useCallback, useEffect, useRef, useState } from 'react';

export type TimerPhase = 'idle' | 'holding' | 'ready' | 'running';

export interface TimerState {
  phase: TimerPhase;
  /** Live elapsed ms while running; final time after a stop; last shown value when idle. */
  displayMs: number;
}

const HOLD_TO_READY_MS = 300;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * Space-bar timer, csTimer style: hold Space until ready (green), release
 * to start, press Space again to stop. `onStop` receives the elapsed ms.
 * Disabled entirely while `enabled` is false (e.g. a dialog is open).
 */
export function useTimer(enabled: boolean, onStop: (elapsedMs: number) => void): TimerState {
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [displayMs, setDisplayMs] = useState(0);

  const phaseRef = useRef<TimerPhase>('idle');
  const startedAtRef = useRef(0);
  const holdTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const onStopRef = useRef(onStop);
  onStopRef.current = onStop;

  const setPhaseBoth = useCallback((next: TimerPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearHoldTimeout = useCallback(() => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, []);

  const stopRafLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Cancel a pending hold, but let a running solve keep running.
      clearHoldTimeout();
      if (phaseRef.current === 'holding' || phaseRef.current === 'ready') {
        setPhaseBoth('idle');
      }
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if (phaseRef.current !== 'running' && isTypingTarget(e.target)) return;
      e.preventDefault();

      if (phaseRef.current === 'running') {
        const elapsed = Math.round(performance.now() - startedAtRef.current);
        stopRafLoop();
        setDisplayMs(elapsed);
        setPhaseBoth('idle');
        onStopRef.current(elapsed);
        return;
      }

      if (phaseRef.current === 'idle') {
        setPhaseBoth('holding');
        holdTimeoutRef.current = window.setTimeout(() => {
          holdTimeoutRef.current = null;
          if (phaseRef.current === 'holding') setPhaseBoth('ready');
        }, HOLD_TO_READY_MS);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;

      if (phaseRef.current === 'ready') {
        e.preventDefault();
        startedAtRef.current = performance.now();
        setDisplayMs(0);
        setPhaseBoth('running');
        const tick = () => {
          setDisplayMs(performance.now() - startedAtRef.current);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (phaseRef.current === 'holding') {
        clearHoldTimeout();
        setPhaseBoth('idle');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled, clearHoldTimeout, stopRafLoop, setPhaseBoth]);

  useEffect(() => () => {
    clearHoldTimeout();
    stopRafLoop();
  }, [clearHoldTimeout, stopRafLoop]);

  return { phase, displayMs };
}
