import { motion } from 'framer-motion';
import { Car, Factory, Flag } from 'lucide-react';

interface ProductionLineProps {
  currentStation: number;
  targetStation: number;
  minStation: number;
  totalStations: number;
  className?: string;
}

export function ProductionLine({
  currentStation,
  targetStation,
  minStation,
  totalStations,
  className = '',
}: ProductionLineProps) {
  const range = totalStations - minStation;
  const currentPosition = Math.max(0, Math.min(100, ((currentStation - minStation) / range) * 100));
  const targetPosition = Math.max(0, Math.min(100, ((targetStation - minStation) / range) * 100));

  const isPassed = currentStation >= targetStation;
  const isAtTarget = Math.abs(currentStation - targetStation) < 1;

  return (
    <section
      aria-label="Produktionslinie Visualisierung"
      className={`bg-[#1a1a1a] rounded-sm p-4 md:p-8 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-[#d5001c]/20 flex items-center justify-center">
            <Factory className="w-4 h-4 text-[#d5001c]" aria-hidden="true" />
          </div>
          <h3 className="text-white text-sm md:text-xl font-semibold uppercase tracking-widest">
            Produktionslinie
          </h3>
        </div>

        <div className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ${
          isPassed
            ? 'bg-yellow-500/20 text-yellow-500'
            : isAtTarget
            ? 'bg-green-500/20 text-green-500'
            : 'bg-[#d5001c]/20 text-[#d5001c]'
        }`} role="status">
          {isPassed ? 'Vorbei' : isAtTarget ? 'Am Ziel' : 'Aktiv'}
        </div>
      </div>

      <div className="relative py-8 mx-4" aria-hidden="true">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-800 rounded-sm" />

        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#d5001c] rounded-sm"
          initial={{ width: 0 }}
          animate={{ width: `${currentPosition}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Start marker */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
          <div className="w-8 h-8 rounded-sm bg-gray-700 border-2 border-[#1a1a1a] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{minStation}</span>
          </div>
        </div>

        {/* Vehicle marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          initial={{ left: 0 }}
          animate={{ left: `${currentPosition}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-sm bg-[#d5001c]/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="w-10 h-10 rounded-sm bg-[#d5001c] border-2 border-black flex items-center justify-center shadow-lg shadow-[#d5001c]/30">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded-sm tracking-tighter">
                {Math.round(currentStation)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Target marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          initial={{ left: 0 }}
          animate={{ left: `${targetPosition}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative">
            <div className={`w-10 h-10 rounded-sm border-2 border-black flex items-center justify-center ${
              isPassed || isAtTarget ? 'bg-green-500' : 'bg-white'
            }`}>
              <Flag className={`w-5 h-5 ${isPassed || isAtTarget ? 'text-white' : 'text-black'}`} />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-sm tracking-tighter ${
                isPassed || isAtTarget
                  ? 'text-green-500 bg-green-500/10'
                  : 'text-white bg-black/80'
              }`}>
                Ziel: {targetStation}
              </span>
            </div>
          </div>
        </motion.div>

        {/* End marker */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
          <div className="w-8 h-8 rounded-sm bg-gray-700 border-2 border-[#1a1a1a] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{totalStations}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#d5001c]" />
          <span className="text-gray-500 text-[10px] uppercase tracking-wider">Aktuelle Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white" />
          <span className="text-gray-500 text-[10px] uppercase tracking-wider">Zielstation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gray-700" />
          <span className="text-gray-500 text-[10px] uppercase tracking-wider">Start/Ende</span>
        </div>
      </div>
    </section>
  );
}

export default ProductionLine;
