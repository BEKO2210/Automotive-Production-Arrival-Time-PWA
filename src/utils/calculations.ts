/**
 * Berechnungsfunktionen für die Ankunftszeiten
 * Enthält die Kernlogik für die Stationsberechnung
 */

import { TOTAL_STATIONS, SECONDS_PER_STATION } from '@/store/useStationStore';

/**
 * Ergebnis der Ankunftsberechnung
 */
export interface ArrivalResult {
  /** Verbleibende Stationen bis zur Zielstation */
  remainingStations: number;
  /** Verbleibende Zeit in Sekunden */
  remainingSeconds: number;
  /** Ob das Fahrzeug bereits vorbei ist */
  isPassed: boolean;
  /** Ob die Berechnung gültig ist */
  isValid: boolean;
  /** Formatierte Zeit als HH:MM:SS */
  formattedTime: string;
  /** Fortschritt in Prozent (0-100) */
  progressPercent: number;
}

/**
 * Berechnet die Ankunftszeit basierend auf aktueller und Zielstation
 * 
 * @param currentStation - Aktuelle Station des Fahrzeugs (1-150)
 * @param targetStation - Zielstation (Meine Station) (1-150)
 * @returns ArrivalResult mit allen Berechnungsdaten
 */
export function calculateArrivalTime(
  currentStation: number,
  targetStation: number
): ArrivalResult {
  // Validierung der Eingaben
  if (
    isNaN(currentStation) ||
    isNaN(targetStation) ||
    currentStation < 1 ||
    currentStation > TOTAL_STATIONS ||
    targetStation < 1 ||
    targetStation > TOTAL_STATIONS
  ) {
    return {
      remainingStations: 0,
      remainingSeconds: 0,
      isPassed: false,
      isValid: false,
      formattedTime: '--:--:--',
      progressPercent: 0,
    };
  }

  // Berechnung der verbleibenden Stationen
  const remainingStations = targetStation - currentStation;
  
  // Prüfung ob Fahrzeug bereits vorbei ist
  const isPassed = remainingStations <= 0;
  
  // Berechnung der verbleibenden Zeit
  const remainingSeconds = isPassed ? 0 : remainingStations * SECONDS_PER_STATION;
  
  // Berechnung des Fortschritts (0-100%)
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentStation / TOTAL_STATIONS) * 100)
  );

  return {
    remainingStations: Math.max(0, remainingStations),
    remainingSeconds,
    isPassed,
    isValid: true,
    formattedTime: formatDuration(remainingSeconds),
    progressPercent,
  };
}

/**
 * Formatiert Sekunden als HH:MM:SS
 * 
 * @param totalSeconds - Gesamtanzahl der Sekunden
 * @returns Formatierte Zeit als String (HH:MM:SS)
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) {
    return '00:00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number): string => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formatiert Sekunden als lesbare Zeit mit Einheiten
 * 
 * @param totalSeconds - Gesamtanzahl der Sekunden
 * @returns Formatierte Zeit als String (z.B. "2 Std. 30 Min.")
 */
export function formatDurationReadable(totalSeconds: number): string {
  if (totalSeconds <= 0) {
    return '0 Min.';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} Std.`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} Min.`);
  }
  if (seconds > 0 && hours === 0) {
    parts.push(`${seconds} Sek.`);
  }

  return parts.join(' ') || '0 Min.';
}

/**
 * Berechnet die geschätzte Ankunftszeit (Uhrzeit)
 * 
 * @param remainingSeconds - Verbleibende Sekunden
 * @returns Geschätzte Ankunftszeit als Date-Objekt
 */
export function calculateEstimatedArrival(remainingSeconds: number): Date {
  const now = new Date();
  return new Date(now.getTime() + remainingSeconds * 1000);
}

/**
 * Formatiert eine Uhrzeit als HH:MM
 * 
 * @param date - Datum/Uhrzeit
 * @returns Formatierte Uhrzeit (z.B. "14:30")
 */
export function formatTime(date: Date): string {
  const pad = (num: number): string => num.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Berechnet die Stationsnummer basierend auf der verstrichenen Zeit
 * Nützlich für Simulationen
 * 
 * @param startStation - Startstation
 * @param elapsedSeconds - Verstrichene Zeit in Sekunden
 * @returns Aktuelle Station
 */
export function calculateStationFromElapsedTime(
  startStation: number,
  elapsedSeconds: number
): number {
  const stationsPassed = Math.floor(elapsedSeconds / SECONDS_PER_STATION);
  return Math.min(TOTAL_STATIONS, startStation + stationsPassed);
}
