/**
 * useCountdown Hook
 * Verwaltet einen Countdown-Timer mit automatischer Aktualisierung
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownOptions {
  /** Startwert in Sekunden */
  initialSeconds: number;
  /** Callback wenn der Countdown abgelaufen ist */
  onComplete?: () => void;
  /** Callback bei jeder Sekunde */
  onTick?: (remainingSeconds: number) => void;
  /** Automatisch starten */
  autoStart?: boolean;
}

interface UseCountdownReturn {
  /** Verbleibende Sekunden */
  remainingSeconds: number;
  /** Formatierte Zeit als HH:MM:SS */
  formattedTime: string;
  /** Ob der Countdown läuft */
  isRunning: boolean;
  /** Ob der Countdown abgelaufen ist */
  isExpired: boolean;
  /** Countdown starten */
  start: () => void;
  /** Countdown pausieren */
  pause: () => void;
  /** Countdown zurücksetzen */
  reset: (newSeconds?: number) => void;
  /** Countdown neu starten */
  restart: (newSeconds?: number) => void;
}

/**
 * Formatiert Sekunden als HH:MM:SS
 */
function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number): string => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Hook für einen Countdown-Timer
 * Aktualisiert sich jede Sekunde automatisch
 */
export function useCountdown({
  initialSeconds,
  onComplete,
  onTick,
  autoStart = true,
}: UseCountdownOptions): UseCountdownReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isExpired, setIsExpired] = useState(false);
  
  // Refs für Callbacks (verhindern unnötige Re-Renders)
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);
  
  // Callback-Refs aktualisieren
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);

  // Countdown-Logik
  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        
        // Callback bei jeder Sekunde
        if (onTickRef.current) {
          onTickRef.current(newValue);
        }
        
        // Prüfung auf Abgelaufen
        if (newValue <= 0) {
          setIsRunning(false);
          setIsExpired(true);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          return 0;
        }
        
        return newValue;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, remainingSeconds]);

  // Aktualisierung wenn sich initialSeconds ändert
  useEffect(() => {
    setRemainingSeconds(initialSeconds);
    setIsExpired(false);
    if (autoStart) {
      setIsRunning(true);
    }
  }, [initialSeconds, autoStart]);

  /** Countdown starten */
  const start = useCallback(() => {
    if (remainingSeconds > 0) {
      setIsRunning(true);
    }
  }, [remainingSeconds]);

  /** Countdown pausieren */
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  /** Countdown zurücksetzen */
  const reset = useCallback((newSeconds?: number) => {
    const seconds = newSeconds !== undefined ? newSeconds : initialSeconds;
    setRemainingSeconds(seconds);
    setIsRunning(autoStart);
    setIsExpired(false);
  }, [initialSeconds, autoStart]);

  /** Countdown neu starten */
  const restart = useCallback((newSeconds?: number) => {
    const seconds = newSeconds !== undefined ? newSeconds : initialSeconds;
    setRemainingSeconds(seconds);
    setIsExpired(false);
    setIsRunning(true);
  }, [initialSeconds]);

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isRunning,
    isExpired,
    start,
    pause,
    reset,
    restart,
  };
}

export default useCountdown;
