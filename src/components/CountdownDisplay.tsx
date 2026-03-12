/**
 * CountdownDisplay Komponente
 * Zeigt die verbleibende Zeit in großen Ziffern an (Porsche Design)
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ArrivalResult } from '@/utils/calculations';
import { formatDuration } from '@/utils/calculations';
import { useStationStore } from '@/store/useStationStore';

interface CountdownDisplayProps {
  /** Berechnungsergebnis */
  result: ArrivalResult;
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

/**
 * Zeigt den Countdown in großen Ziffern an
 * Optimiert für industrielle Umgebungen mit großen Displays
 */
export function CountdownDisplay({ result, className = '' }: CountdownDisplayProps) {
  const [now, setNow] = useState(new Date());
  const { secondsPerStation } = useStationStore();

  // Aktualisiere die aktuelle Zeit jede Sekunde
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Berechne geschätzte Ankunftszeit
  const estimatedArrival = new Date(now.getTime() + result.remainingSeconds * 1000);
  const arrivalTimeString = estimatedArrival.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Animation-Varianten für die Ziffern
  const digitVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  // Wenn das Fahrzeug bereits vorbei ist
  if (result.isPassed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-[#111] rounded-sm p-8 md:p-12 border border-white/5 ${className}`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-yellow-500/10 flex items-center justify-center mb-6 rounded-sm"
          >
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-widest">
            Fahrzeug Vorbei
          </h2>
          
          <p className="text-gray-400 text-sm tracking-wide max-w-md">
            Das Fahrzeug hat Ihre Station bereits passiert.
          </p>
          
          <div className="mt-8 flex items-center gap-2 text-[#d5001c] text-sm uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" />
            <span>Abgeschlossen</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Wenn die Eingabe ungültig ist
  if (!result.isValid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-[#111] rounded-sm p-8 md:p-12 border border-white/5 ${className}`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-white/5 flex items-center justify-center mb-6 rounded-sm">
            <Clock className="w-10 h-10 text-gray-500" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-300 mb-4 uppercase tracking-widest">
            Bereitschaft
          </h2>
          
          <p className="text-gray-500 text-sm tracking-wide max-w-md uppercase">
            Bitte Stationsdaten eingeben
          </p>
        </div>
      </motion.div>
    );
  }

  // Zerlege die formatierte Zeit in ihre Bestandteile
  const [hours, minutes, seconds] = result.formattedTime.split(':');
  // Formatiere die Taktzeit
  const taktTimeString = formatDuration(secondsPerStation).replace(/^00:/, '');

  return (
    <motion.div
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
      className={`bg-[#111] rounded-sm p-6 md:p-10 border border-white/5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#d5001c] flex items-center justify-center rounded-sm">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white text-lg md:text-xl font-bold tracking-widest uppercase">
            ETA Countdown
          </h3>
        </div>
        
        {/* Geschätzte Ankunftszeit */}
        <div className="text-right">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Ankunft um</p>
          <p className="text-white text-xl md:text-2xl font-bold tracking-wider">{arrivalTimeString}</p>
        </div>
      </div>

      {/* Haupt-Countdown */}
      <div className="flex justify-center items-center gap-2 md:gap-4 mb-10">
        {/* Stunden */}
        <div className="flex flex-col items-center">
          <div className="bg-black rounded-sm px-4 md:px-8 py-6 md:py-10 border border-white/10 shadow-inner min-w-[80px] md:min-w-[140px] flex justify-center items-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={hours}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white font-mono tracking-tighter tabular-nums inline-block"
              >
                {hours}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-gray-500 text-xs mt-3 uppercase tracking-widest">
            Stunden
          </span>
        </div>

        {/* Trennzeichen */}
        <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#d5001c] pb-8 opacity-80 w-4 flex justify-center">
          :
        </div>

        {/* Minuten */}
        <div className="flex flex-col items-center">
          <div className="bg-black rounded-sm px-4 md:px-8 py-6 md:py-10 border border-white/10 shadow-inner min-w-[80px] md:min-w-[140px] flex justify-center items-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={minutes}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white font-mono tracking-tighter tabular-nums inline-block"
              >
                {minutes}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-gray-500 text-xs mt-3 uppercase tracking-widest">
            Minuten
          </span>
        </div>

        {/* Trennzeichen */}
        <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#d5001c] pb-8 opacity-80 w-4 flex justify-center">
          :
        </div>

        {/* Sekunden */}
        <div className="flex flex-col items-center">
          <div className="bg-black rounded-sm px-4 md:px-8 py-6 md:py-10 border border-white/10 shadow-inner min-w-[80px] md:min-w-[140px] flex justify-center items-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={seconds}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#d5001c] font-mono tracking-tighter tabular-nums inline-block"
              >
                {seconds}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[#d5001c] opacity-80 text-xs mt-3 uppercase tracking-widest">
            Sekunden
          </span>
        </div>
      </div>

      {/* Zusatzinformationen */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Differenz</p>
          <motion.p
            key={result.remainingStations}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-bold text-white"
          >
            {result.remainingStations} Stat.
          </motion.p>
        </div>
        
        <div className="text-center border-x border-white/5">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Taktzeit</p>
          <p className="text-xl md:text-2xl font-bold text-white">
            {taktTimeString}
          </p>
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
    </motion.div>
  );
}

export default CountdownDisplay;
