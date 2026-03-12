/**
 * Berechnungsfunktionen für die Ankunftszeiten (Realtime Enterprise Edition)
 * Berechnet Fahrzeugbewegungen live basierend auf verstrichener Zeit
 */

import type { ShiftBreak } from '@/store/useStationStore';

export interface ArrivalResult {
  remainingStations: number;
  remainingSeconds: number;
  totalSecondsIncludingBreaks: number;
  isPassed: boolean;
  isValid: boolean;
  formattedTime: string;
  progressPercent: number;
  estimatedArrivalTime: Date;
  liveCurrentStation: number; // Die aktuell berechnete Position (Gleitkommazahl)
}

/**
 * Berechnet die Ankunftszeit in Echtzeit
 */
export function calculateArrivalTime(
  enteredStation: number,
  targetStation: number,
  totalStations: number,
  secondsPerStation: number,
  lastUpdateTimestamp: number,
  minStation: number = -10,
  breaks: ShiftBreak[] = []
): ArrivalResult {
  if (
    isNaN(enteredStation) || isNaN(targetStation) ||
    enteredStation < minStation || enteredStation > totalStations ||
    targetStation < minStation || targetStation > totalStations
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
      liveCurrentStation: enteredStation
    };
  }

  const nowTimestamp = Date.now();
  const elapsedSecondsReal = (nowTimestamp - lastUpdateTimestamp) / 1000;
  
  // Wir berechnen wie viele Stationen das Band seit der Eingabe gefahren ist.
  // Dabei müssen wir eigentlich auch Pausen berücksichtigen, die SEIT der Eingabe vergangen sind.
  const elapsedWorkSeconds = calculateWorkSecondsBetween(lastUpdateTimestamp, nowTimestamp, breaks);
  const stationsTraveled = elapsedWorkSeconds / secondsPerStation;
  
  const liveCurrentStation = enteredStation + stationsTraveled;
  const remainingStations = Math.max(0, targetStation - liveCurrentStation);
  const isPassed = liveCurrentStation >= targetStation;
  const remainingWorkSeconds = isPassed ? 0 : remainingStations * secondsPerStation;
  
  // Berechnung der ETA ab JETZT
  const arrivalTime = calculateTimeAfterWorkSeconds(nowTimestamp, remainingWorkSeconds, breaks);
  const totalSecondsUntilArrival = Math.max(0, Math.floor((arrivalTime.getTime() - nowTimestamp) / 1000));

  const totalRange = totalStations - minStation;
  const currentOffset = liveCurrentStation - minStation;
  const progressPercent = Math.min(100, Math.max(0, (currentOffset / totalRange) * 100));

  return {
    remainingStations: Math.ceil(remainingStations),
    remainingSeconds: Math.floor(remainingWorkSeconds),
    totalSecondsIncludingBreaks: totalSecondsUntilArrival,
    isPassed,
    isValid: true,
    formattedTime: formatDuration(totalSecondsUntilArrival),
    progressPercent,
    estimatedArrivalTime: arrivalTime,
    liveCurrentStation: liveCurrentStation
  };
}

/**
 * Berechnet wie viele "Arbeitssekunden" zwischen zwei Zeitpunkten liegen (ohne Pausen)
 */
function calculateWorkSecondsBetween(startTs: number, endTs: number, breaks: ShiftBreak[]): number {
  if (endTs <= startTs) return 0;
  
  let workSeconds = 0;
  const activeBreaks = getActiveBreaksRange(startTs, endTs, breaks);
  
  // Millisekunden-genau für maximale Porsche-Präzision
  // (In der Praxis reicht Sekunden-Schleife für Performance)
  let current = startTs;
  const step = 1000; // 1 Sekunde
  
  while (current < endTs) {
    const inBreak = activeBreaks.some(b => current >= b.start && current < b.end);
    if (!inBreak) {
      workSeconds += 1;
    }
    current += step;
  }
  
  return workSeconds;
}

/**
 * Berechnet den Zeitpunkt nach X Arbeitssekunden (überspringt Pausen)
 */
function calculateTimeAfterWorkSeconds(startTs: number, workSeconds: number, breaks: ShiftBreak[]): Date {
  if (workSeconds <= 0) return new Date(startTs);
  
  let currentTs = startTs;
  let remaining = workSeconds;
  
  // Wir schauen 24 Stunden in die Zukunft
  const futureLimit = startTs + (24 * 60 * 60 * 1000);
  const activeBreaks = breaks.filter(b => b.enabled).map(b => {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    const s = new Date(startTs); s.setHours(sh, sm, 0, 0);
    const e = new Date(startTs); e.setHours(eh, em, 0, 0);
    if (e < s) e.setDate(e.getDate() + 1);
    return { start: s.getTime(), end: e.getTime() };
  });

  while (remaining > 0 && currentTs < futureLimit) {
    currentTs += 1000;
    const inBreak = activeBreaks.some(b => currentTs > b.start && currentTs <= b.end);
    if (!inBreak) {
      remaining -= 1;
    }
  }
  
  return new Date(currentTs);
}

function getActiveBreaksRange(startTs: number, endTs: number, breaks: ShiftBreak[]) {
  return breaks.filter(b => b.enabled).map(b => {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    const s = new Date(startTs); s.setHours(sh, sm, 0, 0);
    const e = new Date(startTs); e.setHours(eh, em, 0, 0);
    if (e < s) e.setDate(e.getDate() + 1);
    return { start: s.getTime(), end: e.getTime() };
  });
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num: number): string => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatTime(date: Date): string {
  const pad = (num: number): string => num.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
