/**
 * ProductionLine Komponente
 * Visualisiert die Produktionslinie mit Fortschrittsanzeige
 */
import { motion } from 'framer-motion';
import { Car, Factory, Flag } from 'lucide-react';

interface ProductionLineProps {
  /** Aktuelle Station des Fahrzeugs */
  currentStation: number;
  /** Zielstation (Meine Station) */
  targetStation: number;
  /** Gesamtanzahl der Stationen */
  totalStations: number;
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

/**
 * Visualisiert die Produktionslinie als animierte Grafik
 * Zeigt aktuelle Position, Ziel und Fortschritt
 */
export function ProductionLine({
  currentStation,
  targetStation,
  totalStations,
  className = '',
}: ProductionLineProps) {
  // Berechne die Positionen als Prozentsatz
  const currentPosition = (currentStation / totalStations) * 100;
  const targetPosition = (targetStation / totalStations) * 100;

  // Bestimme den Status
  const isPassed = currentStation >= targetStation;
  const isAtTarget = currentStation === targetStation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-[#1a1a1a] rounded-2xl p-6 md:p-8 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d5001c]/20 flex items-center justify-center">
            <Factory className="w-5 h-5 text-[#d5001c]" />
          </div>
          <div>
            <h3 className="text-white text-lg md:text-xl font-semibold tracking-wide">
              Produktionslinie
            </h3>
            <p className="text-gray-400 text-sm">
              Station {currentStation} → Station {targetStation}
            </p>
          </div>
        </div>
        
        {/* Status-Indikator */}
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          isPassed
            ? 'bg-yellow-500/20 text-yellow-500'
            : isAtTarget
            ? 'bg-green-500/20 text-green-500'
            : 'bg-[#d5001c]/20 text-[#d5001c]'
        }`}>
          {isPassed && 'Vorbei'}
          {isAtTarget && 'Angekommen'}
          {!isPassed && !isAtTarget && 'In Bewegung'}
        </div>
      </div>

      {/* Produktionslinie-Visualisierung */}
      <div className="relative py-8">
        {/* Hauptlinie (Hintergrund) */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-3 bg-gray-800 rounded-full" />
        
        {/* Fortschrittslinie (bis zur aktuellen Position) */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-[#d5001c] to-[#ff1a3c] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${currentPosition}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Verbleibender Weg (von aktueller bis Zielstation) */}
        {!isPassed && !isAtTarget && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-3 bg-[#d5001c]/30 rounded-full"
            initial={{ left: `${currentPosition}%`, width: 0 }}
            animate={{ 
              left: `${currentPosition}%`, 
              width: `${targetPosition - currentPosition}%` 
            }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        )}

        {/* Start-Marker */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
          <div className="w-8 h-8 rounded-full bg-gray-700 border-4 border-[#1a1a1a] flex items-center justify-center">
            <span className="text-xs font-bold text-white">1</span>
          </div>
        </div>

        {/* Fahrzeug-Marker (aktuelle Position) */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          initial={{ left: 0 }}
          animate={{ left: `${currentPosition}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative">
            {/* Pulsierender Ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-[#d5001c]/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Fahrzeug-Icon */}
            <div className="w-12 h-12 rounded-full bg-[#d5001c] border-4 border-[#1a1a1a] flex items-center justify-center shadow-lg shadow-[#d5001c]/30">
              <Car className="w-6 h-6 text-white" />
            </div>
            
            {/* Stations-Label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-sm font-bold text-white bg-black/80 px-2 py-1 rounded">
                Station {currentStation}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Ziel-Marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          initial={{ left: 0 }}
          animate={{ left: `${targetPosition}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative">
            <div className={`w-10 h-10 rounded-full border-4 border-[#1a1a1a] flex items-center justify-center ${
              isPassed || isAtTarget ? 'bg-green-500' : 'bg-white'
            }`}>
              <Flag className={`w-5 h-5 ${
                isPassed || isAtTarget ? 'text-white' : 'text-black'
              }`} />
            </div>
            
            {/* Ziel-Label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className={`text-sm font-bold px-2 py-1 rounded ${
                isPassed || isAtTarget 
                  ? 'text-green-500 bg-green-500/10' 
                  : 'text-white bg-black/80'
              }`}>
                Ziel: {targetStation}
              </span>
            </div>
          </div>
        </motion.div>

        {/* End-Marker */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
          <div className="w-8 h-8 rounded-full bg-gray-700 border-4 border-[#1a1a1a] flex items-center justify-center">
            <span className="text-xs font-bold text-white">{totalStations}</span>
          </div>
        </div>
      </div>

      {/* Stations-Ticks */}
      <div className="relative h-4 mt-2">
        {Array.from({ length: 11 }, (_, i) => {
          const station = Math.round((totalStations / 10) * i);
          const position = (station / totalStations) * 100;
          return (
            <div
              key={station}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${position}%` }}
            >
              <div className="w-0.5 h-2 bg-gray-600" />
            </div>
          );
        })}
      </div>

      {/* Legende */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#d5001c]" />
          <span className="text-gray-400 text-sm">Aktuelle Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white" />
          <span className="text-gray-400 text-sm">Zielstation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-700" />
          <span className="text-gray-400 text-sm">Start/Ende</span>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductionLine;
