/**
 * Zeit-Utility-Funktionen
 * Hilfsfunktionen für Zeitberechnungen und Formatierungen
 */

/**
 * Konvertiert Minuten und Sekunden in Gesamtsekunden
 * 
 * @param minutes - Minuten
 * @param seconds - Sekunden
 * @returns Gesamtanzahl der Sekunden
 */
export function toSeconds(minutes: number, seconds: number): number {
  return minutes * 60 + seconds;
}

/**
 * Konvertiert Sekunden in Minuten und Sekunden
 * 
 * @param totalSeconds - Gesamtsekunden
 * @returns Objekt mit Minuten und Sekunden
 */
export function fromSeconds(totalSeconds: number): { minutes: number; seconds: number } {
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
}

/**
 * Formatiert eine Zahl mit führender Null
 * 
 * @param num - Zu formatierende Zahl
 * @param digits - Anzahl der Stellen (default: 2)
 * @returns Formatierte Zahl als String
 */
export function padNumber(num: number, digits: number = 2): string {
  return num.toString().padStart(digits, '0');
}

/**
 * Formatiert Sekunden als Countdown-String (MM:SS oder HH:MM:SS)
 * 
 * @param totalSeconds - Gesamtsekunden
 * @param showHours - Immer Stunden anzeigen, auch wenn 0
 * @returns Formatierte Zeit
 */
export function formatCountdown(totalSeconds: number, showHours: boolean = true): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (showHours || hours > 0) {
    return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
  }
  return `${padNumber(minutes)}:${padNumber(seconds)}`;
}

/**
 * Berechnet die verbleibende Zeit für einen Countdown
 * 
 * @param targetTime - Zielzeit als Timestamp
 * @returns Verbleibende Sekunden
 */
export function getRemainingSeconds(targetTime: number): number {
  const now = Date.now();
  const remaining = Math.max(0, Math.floor((targetTime - now) / 1000));
  return remaining;
}

/**
 * Erstellt einen Timestamp für die Zielzeit basierend auf verbleibenden Sekunden
 * 
 * @param seconds - Verbleibende Sekunden
 * @returns Timestamp der Zielzeit
 */
export function createTargetTimestamp(seconds: number): number {
  return Date.now() + seconds * 1000;
}

/**
 * Formatiert eine Zeitdauer in menschlich lesbarer Form
 * 
 * @param ms - Millisekunden
 * @returns Formatierte Dauer
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Debounce-Funktion für Eingaben
 * Verzögert die Ausführung einer Funktion
 * 
 * @param fn - Auszuführende Funktion
 * @param delay - Verzögerung in Millisekunden
 * @returns Debounced Funktion
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle-Funktion für Performance-Optimierung
 * Begrenzt die Ausführungsrate einer Funktion
 * 
 * @param fn - Auszuführende Funktion
 * @param limit - Mindestabstand in Millisekunden
 * @returns Throttled Funktion
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
