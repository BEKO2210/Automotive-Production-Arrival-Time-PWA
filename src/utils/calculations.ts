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
  liveCurrentStation: number; 
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
  // Grund-Validierung
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
  
  // 1. Berechne Arbeitssekunden seit der letzten Eingabe
  const elapsedWorkSeconds = calculateWorkSecondsBetween(lastUpdateTimestamp, nowTimestamp, breaks);
  const stationsTraveled = elapsedWorkSeconds / secondsPerStation;
  
  // 2. Bestimme Live-Position (Geklemmt am Band-Ende)
  const liveCurrentStation = Math.min(totalStations, enteredStation + stationsTraveled);
  
  // 3. Bestimme Restweg und Status
  const isPassed = liveCurrentStation >= targetStation;
  const remainingStationsRaw = Math.max(0, targetStation - liveCurrentStation);
  const remainingWorkSeconds = isPassed ? 0 : remainingStationsRaw * secondsPerStation;
  
  // 4. Berechne ETA ab JETZT (überspringt zukünftige Pausen)
  const arrivalTime = calculateTimeAfterWorkSeconds(nowTimestamp, remainingWorkSeconds, breaks);
  const totalSecondsUntilArrival = Math.max(0, Math.floor((arrivalTime.getTime() - nowTimestamp) / 1000));

  // 5. Fortschritt relativ zum individuellen Auftrag
  const tripTotal = targetStation - enteredStation;
  const tripDone = liveCurrentStation - enteredStation;
  
  let progressPercent = 0;
  if (isPassed) {
    progressPercent = 100;
  } else if (tripTotal > 0) {
    progressPercent = Math.min(100, Math.max(0, (tripDone / tripTotal) * 100));
  }

  return {
    remainingStations: Math.ceil(remainingStationsRaw),
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
 * Berechnet Arbeitssekunden zwischen zwei Zeitpunkten (Pausen werden abgezogen)
 */
function calculateWorkSecondsBetween(startTs: number, endTs: number, breaks: ShiftBreak[]): number {
  if (endTs <= startTs) return 0;
  
  const activeBreaks = getActiveBreaksRange(startTs, endTs, breaks);
  let totalPauseSeconds = 0;

  activeBreaks.forEach(b => {
    // Überschneidung zwischen Zeitfenster [startTs, endTs] und Pause [b.start, b.end]
    const overlapStart = Math.max(startTs, b.start);
    const overlapEnd = Math.min(endTs, b.end);
    
    if (overlapStart < overlapEnd) {
      totalPauseSeconds += (overlapEnd - overlapStart) / 1000;
    }
  });
  
  const totalElapsedSeconds = (endTs - startTs) / 1000;
  return Math.max(0, totalElapsedSeconds - totalPauseSeconds);
}

/**
 * Berechnet den Zeitpunkt nach X Arbeitssekunden (überspringt Pausen)
 * Optimierte Logik ohne Sekundenschleife
 */
function calculateTimeAfterWorkSeconds(startTs: number, workSeconds: number, breaks: ShiftBreak[]): Date {
  if (workSeconds <= 0) return new Date(startTs);
  
  let currentTs = startTs;
  let workSecondsRemaining = workSeconds;
  
  // Sortierte aktive Pausen
  const activeBreaks = breaks
    .filter(b => b.enabled)
    .map(b => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      const s = new Date(startTs); s.setHours(sh, sm, 0, 0);
      const e = new Date(startTs); e.setHours(eh, em, 0, 0);
      if (e < s) e.setDate(e.getDate() + 1);
      return { start: s.getTime(), end: e.getTime() };
    })
    .sort((a, b) => a.start - b.start);

  // Wir springen durch die Pausen
  for (const b of activeBreaks) {
    if (b.end <= currentTs) continue; // Pause liegt in der Vergangenheit

    // Zeit bis zum Pausenbeginn
    const timeUntilBreak = Math.max(0, b.start - currentTs) / 1000;
    
    if (workSecondsRemaining <= timeUntilBreak) {
      // Ziel liegt vor oder genau am Pausenbeginn
      return new Date(currentTs + workSecondsRemaining * 1000);
    } else {
      // Wir erreichen die Pause und müssen sie überspringen
      workSecondsRemaining -= timeUntilBreak;
      currentTs = b.end;
    }
  }

  // Ziel liegt nach allen betrachteten Pausen
  return new Date(currentTs + workSecondsRemaining * 1000);
}

function getActiveBreaksRange(startTs: number, breaks: ShiftBreak[]) {
  // Erzeugt Pausen-Intervalle für den relevanten Zeitraum
  // (Einfachheitshalber heute und morgen, falls Schichtwechsel)
  const ranges: {start: number, end: number}[] = [];
  const days = [0, 1]; // Heute und morgen

  days.forEach(dayOffset => {
    breaks.filter(b => b.enabled).forEach(b => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      
      const s = new Date(startTs);
      s.setDate(s.getDate() + dayOffset);
      s.setHours(sh, sm, 0, 0);
      
      const e = new Date(startTs);
      e.setDate(e.getDate() + dayOffset);
      e.setHours(eh, em, 0, 0);
      
      if (e < s) e.setDate(e.getDate() + 1);
      
      ranges.push({ start: s.getTime(), end: e.getTime() });
    });
  });

  return ranges.sort((a, b) => a.start - b.start);
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
