import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ArrivalResult } from '@/utils/calculations';
import { formatDuration } from '@/utils/calculations';
import { useStationStore } from '@/store/useStationStore';

interface CountdownDisplayProps {
  result: ArrivalResult;
  className?: string;
}

export function CountdownDisplay({ result, className = '' }: CountdownDisplayProps) {
  const { secondsPerStation } = useStationStore();

  const arrivalTimeString = result.estimatedArrivalTime.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const digitVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  if (result.isPassed) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-[#111] rounded-sm p-8 md:p-12 border border-white/5 ${className}`}
        aria-label="Fahrzeug hat Ziel erreicht"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-green-500/10 flex items-center justify-center mb-6 rounded-sm"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" aria-hidden="true" />
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-widest">
            Fahrzeug Angekommen
          </h2>

          <p className="text-gray-400 text-sm tracking-wide max-w-md">
            Das Fahrzeug hat Ihre Station erreicht oder bereits passiert.
          </p>

          <div className="mt-8 flex items-center gap-2 text-green-500 text-sm uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>Abgeschlossen</span>
          </div>
        </div>
      </motion.section>
    );
  }

  if (!result.isValid) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-[#111] rounded-sm p-8 md:p-12 border border-white/5 ${className}`}
        aria-label="Warte auf Eingabe"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-white/5 flex items-center justify-center mb-6 rounded-sm">
            <Clock className="w-10 h-10 text-gray-500" aria-hidden="true" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-300 mb-4 uppercase tracking-widest">
            Bereitschaft
          </h2>

          <p className="text-gray-500 text-sm tracking-wide max-w-md uppercase">
            Bitte Stationsdaten eingeben
          </p>
        </div>
      </motion.section>
    );
  }

  const [hours, minutes, seconds] = result.formattedTime.split(':');
  const taktTimeString = formatDuration(secondsPerStation).replace(/^00:/, '');

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        borderColor: result.remainingStations === 1 ? '#d5001c' : 'rgba(255,255,255,0.05)',
        backgroundColor: result.remainingStations === 1 ? 'rgba(213,0,28,0.05)' : '#111'
      }}
      transition={{
        duration: 0.5,
        borderColor: { repeat: Infinity, duration: 1, repeatType: 'reverse' }
      }}
      className={`bg-[#111] rounded-sm p-4 md:p-10 border border-white/5 ${className}`}
      aria-label={`ETA Countdown: ${result.formattedTime}`}
      role="timer"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#d5001c] flex items-center justify-center rounded-sm">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" aria-hidden="true" />
          </div>
          <h3 className="text-white text-xs md:text-xl font-bold tracking-widest uppercase">
            ETA Countdown
          </h3>
        </div>

        <div className="text-right">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-0.5">Ankunft um</p>
          <p className="text-white text-sm md:text-2xl font-bold tracking-wider">{arrivalTimeString}</p>
        </div>
      </div>

      {/* Main countdown */}
      <div className="flex justify-center items-center gap-1 md:gap-4 mb-8" aria-live="polite">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="bg-black rounded-sm px-2 md:px-8 py-4 md:py-10 border border-white/10 shadow-inner min-w-[65px] md:min-w-[140px] flex justify-center items-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={hours}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-3xl md:text-7xl lg:text-8xl font-bold text-white font-mono tracking-tighter tabular-nums inline-block"
              >
                {hours}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-gray-500 text-[9px] mt-2 uppercase tracking-widest">Stunden</span>
        </div>

        <div className="text-xl md:text-5xl lg:text-6xl font-bold text-[#d5001c] pb-6 opacity-80 w-3 flex justify-center" aria-hidden="true">:</div>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="bg-black rounded-sm px-2 md:px-8 py-4 md:py-10 border border-white/10 shadow-inner min-w-[65px] md:min-w-[140px] flex justify-center items-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={minutes}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-3xl md:text-7xl lg:text-8xl font-bold text-white font-mono tracking-tighter tabular-nums inline-block"
              >
                {minutes}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-gray-500 text-[9px] mt-2 uppercase tracking-widest">Minuten</span>
        </div>

        <div className="text-xl md:text-5xl lg:text-6xl font-bold text-[#d5001c] pb-6 opacity-80 w-3 flex justify-center" aria-hidden="true">:</div>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="bg-black rounded-sm px-2 md:px-8 py-4 md:py-10 border border-white/10 shadow-inner min-w-[65px] md:min-w-[140px] flex justify-center items-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={seconds}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-3xl md:text-7xl lg:text-8xl font-bold text-[#d5001c] font-mono tracking-tighter tabular-nums inline-block"
              >
                {seconds}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[#d5001c] opacity-80 text-[9px] mt-2 uppercase tracking-widest">Sekunden</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Differenz</p>
          <motion.p
            key={result.remainingStations}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-bold text-white"
          >
            {result.remainingStations} <span className="text-sm text-gray-500">Stat.</span>
          </motion.p>
        </div>

        <div className="text-center border-x border-white/5">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Taktzeit</p>
          <p className="text-xl md:text-2xl font-bold text-white">{taktTimeString}</p>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Fortschritt</p>
          <motion.p
            key={result.progressPercent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-bold text-white"
          >
            {result.progressPercent.toFixed(0)}%
          </motion.p>
        </div>
      </div>

      {/* Alert when close */}
      {result.remainingStations <= 3 && result.remainingStations > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-3 p-3 bg-[#d5001c]/10 border border-[#d5001c]/30 rounded-sm"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 text-[#d5001c] shrink-0" aria-hidden="true" />
          <p className="text-[#d5001c] text-xs uppercase tracking-widest font-bold">
            {result.remainingStations === 1
              ? 'Fahrzeug erreicht nächste Station!'
              : `Noch ${result.remainingStations} Stationen entfernt`}
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}

export default CountdownDisplay;
