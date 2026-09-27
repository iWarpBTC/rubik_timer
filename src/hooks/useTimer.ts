import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export type TimerPhase = 'idle' | 'holding' | 'ready' | 'running';

/** Spread onto the element that works as the click/touch timer pad. */
export interface TimerPadHandlers {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  onContextMenu: (e: ReactMouseEvent<HTMLElement>) => void;
}

export interface TimerState {
  phase: TimerPhase;
  /** Live elapsed ms while running; final time after a stop; last shown value when idle. */
  displayMs: number;
  padHandlers: TimerPadHandlers;
}

const HOLD_TO_READY_MS = 300;

/** What started the current hold: the space bar, or a pointer by its pointerId. */
type HoldSource = 'key' | number;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * Swallows the click that follows the press which stopped the timer, so the
 * tap doesn't also hit whatever is under the finger. The next press ends the
 * suppression in case that click never comes.
 */
function suppressNextClick(): void {
  const swallow = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    cleanup();
  };
  const cleanup = () => {
    window.removeEventListener('click', swallow, true);
    window.removeEventListener('pointerdown', cleanup, true);
  };
  window.addEventListener('click', swallow, true);
  window.addEventListener('pointerdown', cleanup, true);
}

/**
 * csTimer-style timer: hold Space — or press and hold the timer pad — until
 * ready (green), release to start; press Space or tap/click anywhere to stop.
 * `onStop` receives the elapsed ms. Disabled entirely while `enabled` is
 * false (e.g. a dialog is open).
 */
export function useTimer(enabled: boolean, onStop: (elapsedMs: number) => void): TimerState {
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [displayMs, setDisplayMs] = useState(0);

  const phaseRef = useRef<TimerPhase>('idle');
  const holdSourceRef = useRef<HoldSource | null>(null);
  const startedAtRef = useRef(0);
  const holdTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
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

  const beginHold = useCallback(
    (source: HoldSource) => {
      holdSourceRef.current = source;
      setPhaseBoth('holding');
      holdTimeoutRef.current = window.setTimeout(() => {
        holdTimeoutRef.current = null;
        if (phaseRef.current === 'holding') setPhaseBoth('ready');
      }, HOLD_TO_READY_MS);
    },
    [setPhaseBoth],
  );

  const cancelHold = useCallback(() => {
    holdSourceRef.current = null;
    clearHoldTimeout();
    if (phaseRef.current === 'holding' || phaseRef.current === 'ready') setPhaseBoth('idle');
  }, [clearHoldTimeout, setPhaseBoth]);

  /** Ends a hold: starts the timer when it was held long enough, otherwise cancels it. */
  const releaseHold = useCallback(() => {
    if (phaseRef.current !== 'ready') {
      cancelHold();
      return;
    }
    holdSourceRef.current = null;
    startedAtRef.current = performance.now();
    setDisplayMs(0);
    setPhaseBoth('running');
    const tick = () => {
      setDisplayMs(performance.now() - startedAtRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [cancelHold, setPhaseBoth]);

  const stop = useCallback(() => {
    const elapsed = Math.round(performance.now() - startedAtRef.current);
    stopRafLoop();
    setDisplayMs(elapsed);
    setPhaseBoth('idle');
    onStopRef.current(elapsed);
  }, [stopRafLoop, setPhaseBoth]);

  useEffect(() => {
    if (!enabled) {
      // Cancel a pending hold, but let a running solve keep running.
      cancelHold();
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if (phaseRef.current !== 'running' && isTypingTarget(e.target)) return;
      e.preventDefault();

      if (phaseRef.current === 'running') stop();
      else if (phaseRef.current === 'idle') beginHold('key');
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || holdSourceRef.current !== 'key') return;
      e.preventDefault();
      releaseHold();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled, cancelHold, beginHold, releaseHold, stop]);

  // While running, any press anywhere stops the timer — the whole screen is the stop button.
  useEffect(() => {
    if (!enabled || phase !== 'running') return;
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stop();
      suppressNextClick();
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, [enabled, phase, stop]);

  useEffect(() => () => {
    clearHoldTimeout();
    stopRafLoop();
  }, [clearHoldTimeout, stopRafLoop]);

  const padHandlers = useMemo<TimerPadHandlers>(
    () => ({
      onPointerDown: (e) => {
        if (!e.isPrimary || e.button !== 0) return;
        if (!enabledRef.current || phaseRef.current !== 'idle') return;
        // Leave any text field, so its on-screen keyboard closes and Space works afterwards.
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        e.currentTarget.setPointerCapture(e.pointerId);
        beginHold(e.pointerId);
      },
      onPointerUp: (e) => {
        if (holdSourceRef.current === e.pointerId) releaseHold();
      },
      onPointerCancel: (e) => {
        if (holdSourceRef.current === e.pointerId) cancelHold();
      },
      // A long press would otherwise open the context menu on touch screens.
      onContextMenu: (e) => e.preventDefault(),
    }),
    [beginHold, releaseHold, cancelHold],
  );

  return { phase, displayMs, padHandlers };
}
