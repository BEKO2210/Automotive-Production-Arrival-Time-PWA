/**
 * Berechnungsfunktionen für die Ankunftszeiten (Enterprise Edition)
 * Berücksichtigt Schichtpausen für eine präzise Industrie-ETA
 */

import { ShiftBreak } from '@/store/useStationStore';

/**
 * Ergebnis der Ankunftsberechnung
 */
export interface ArrivalResult {
  /** Verbleibende Stationen bis zur Zielstation */
  remainingStations: number;
  /** Verbleibende reine Arbeitszeit in Sekunden (ohne Pausen) */
  remainingSeconds: number;
  /** Tatsächliche Sekunden bis zur Ankunft (inklusive Pausen) */
  totalSecondsIncludingBreaks: number;
  /** Ob das Fahrzeug bereits vorbei ist */
  isPassed: boolean;
  /** Ob die Berechnung gültig ist */
  isValid: boolean;
  /** Formatierte Zeit als HH:MM:SS */
  formattedTime: string;
  /** Fortschritt in Prozent (0-100) */
  progressPercent: number;
  /** Uhrzeit der tatsächlichen Ankunft */
  estimatedArrivalTime: Date;
}

/**
 * Berechnet die Ankunftszeit unter Berücksichtigung von Schichtpausen
 * 
 * @param currentStation - Aktuelle Station des Fahrzeugs
 * @param targetStation - Zielstation (Meine Station)
 * @param totalStations - Gesamtanzahl der Stationen
 * @param secondsPerStation - Sekunden pro Station
 * @param breaks - Liste der konfigurierten Schichtpausen
 * @returns ArrivalResult mit allen Berechnungsdaten inkl. Pausen-Korrektur
 */
export function calculateArrivalTime(
  currentStation: number,
  targetStation: number,
  totalStations: number,
  secondsPerStation: number,
  breaks: ShiftBreak[] = []
): ArrivalResult {
  // Validierung der Eingaben
  if (
    isNaN(currentStation) || isNaN(targetStation) ||
    currentStation < 1 || currentStation > totalStations ||
    targetStation < 1 || targetStation > totalStations
  ) {
    return {
      remainingStations: 0,
      remainingSeconds: 0,
      totalSecondsIncludingBreaks: 0,
      isPassed: false,
      isValid: false,
      formattedTime: '--:--:--',
      progressPercent: 0,
      estimatedArrivalTime: new Date(),
    };
  }

  const remainingStations = Math.max(0, targetStation - currentStation);
  const isPassed = targetStation <= currentStation;
  const remainingSeconds = isPassed ? 0 : remainingStations * secondsPerStation;
  
  const now = new Date();
  let currentCheckTime = now.getTime();
  let workSecondsRemaining = remainingSeconds;
  
  // Aktive Pausen für heute vorbereiten
  const activeBreaksToday = breaks
    .filter(b => b.enabled)
    .map(b => {
      const [startH, startM] = b.startTime.split(':').map(Number);
      const [endH, endM] = b.endTime.split(':').map(Number);
      
      const start = new Date(now);
      start.setHours(startH, startM, 0, 0);
      
      const end = new Date(now);
      end.setHours(endH, endM, 0, 0);
      
      // Falls Pause bereits vorbei war (z.B. gestern Nacht), ignorieren
      // (Wir betrachten nur Pausen im Arbeitsfenster)
      return { start: start.getTime(), end: end.getTime() };
    })
    .sort((a, b) => a.start - b.start);

  // Simulation des Bandlaufs (sekundengenau)
  while (workSecondsRemaining > 0) {
    currentCheckTime += 1000; // 1 Sekunde Schritt
    
    // Prüfe ob aktuelle Zeit in einer aktiven Pause liegt
    const inBreak = activeBreaksToday.find(b => 
      currentCheckTime >= b.start && currentCheckTime <= b.end
    );
    
    if (!inBreak) {
      workSecondsRemaining -= 1;
    }
    // Wenn wir in einer Pause sind, zählt die Sekunde nicht zur Arbeitszeit
  }

  const totalSecondsIncludingBreaks = Math.floor((currentCheckTime - now.getTime()) / 1000);
  const estimatedArrivalTime = new Date(currentCheckTime);
  const progressPercent = Math.min(100, Math.max(0, (currentStation / totalStations) * 100));

  return {
    remainingStations,
    remainingSeconds,
    totalSecondsIncludingBreaks,
    isPassed,
    isValid: true,
    formattedTime: formatDuration(totalSecondsIncludingBreaks),
    progressPercent,
    estimatedArrivalTime,
  };
}

/**
 * Formatiert Sekunden als HH:MM:SS
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num: number): string => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formatiert Sekunden als lesbare Zeit (z.B. "2 Std. 30 Min.")
 */
export function formatDurationReadable(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0 Min.';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} Std.`);
  if (minutes > 0) parts.push(`${minutes} Min.`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds} Sek.`);
  return parts.join(' ') || '0 Min.';
}

/**
 * Formatiert eine Uhrzeit als HH:MM
 */
export function formatTime(date: Date): string {
  const pad = (num: number): string => num.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
