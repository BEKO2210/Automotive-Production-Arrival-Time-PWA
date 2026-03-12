/**
 * CountdownDisplay Komponente
 * Zeigt die verbleibende Zeit in großen Ziffern an
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ArrivalResult } from '@/utils/calculations';

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
        className={`bg-[#1a1a1a] rounded-2xl p-8 md:p-12 ${className}`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mb-6"
          >
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-4">
            Fahrzeug bereits vorbei
          </h2>
          
          <p className="text-gray-400 text-lg max-w-md">
            Das Fahrzeug hat Ihre Station bereits passiert oder befindet sich aktuell dort.
          </p>
          
          <div className="mt-8 flex items-center gap-2 text-gray-500">
            <CheckCircle2 className="w-5 h-5" />
            <span>Berechnung abgeschlossen</span>
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
        className={`bg-[#1a1a1a] rounded-2xl p-8 md:p-12 ${className}`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-gray-700/50 flex items-center justify-center mb-6">
            <Clock className="w-12 h-12 text-gray-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-500 mb-4">
            Warte auf Eingabe
          </h2>
          
          <p className="text-gray-400 text-lg max-w-md">
            Bitte geben Sie die aktuelle Fahrzeugstation und Ihre Station ein.
          </p>
        </div>
      </motion.div>
    );
  }

  // Zerlege die formatierte Zeit in ihre Bestandteile
  const [hours, minutes, seconds] = result.formattedTime.split(':');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-[#1a1a1a] rounded-2xl p-6 md:p-10 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d5001c]/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#d5001c]" />
          </div>
          <h3 className="text-white text-lg md:text-xl font-semibold tracking-wide">
            Ankunft in
          </h3>
        </div>
        
        {/* Geschätzte Ankunftszeit */}
        <div className="text-right">
          <p className="text-gray-400 text-sm">Geschätzte Ankunft</p>
          <p className="text-white text-xl font-bold">{arrivalTimeString} Uhr</p>
        </div>
      </div>

      {/* Haupt-Countdown */}
      <div className="flex justify-center items-center gap-2 md:gap-4 mb-10">
        {/* Stunden */}
        <div className="flex flex-col items-center">
          <div className="bg-black rounded-xl md:rounded-2xl px-4 md:px-8 py-6 md:py-10 border border-gray-800">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={hours}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl lg:text-9xl font-bold text-white font-mono tracking-tighter"
              >
                {hours}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-gray-500 text-sm md:text-base mt-2 uppercase tracking-wider">
            Std.
          </span>
        </div>

        {/* Trennzeichen */}
        <div className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#d5001c] pb-8">
          :
        </div>

        {/* Minuten */}
        <div className="flex flex-col items-center">
          <div className="bg-black rounded-xl md:rounded-2xl px-4 md:px-8 py-6 md:py-10 border border-gray-800">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={minutes}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl lg:text-9xl font-bold text-white font-mono tracking-tighter"
              >
                {minutes}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-gray-500 text-sm md:text-base mt-2 uppercase tracking-wider">
            Min.
          </span>
        </div>

        {/* Trennzeichen */}
        <div className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#d5001c] pb-8">
          :
        </div>

        {/* Sekunden */}
        <div className="flex flex-col items-center">
          <div className="bg-black rounded-xl md:rounded-2xl px-4 md:px-8 py-6 md:py-10 border border-gray-800">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={seconds}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl lg:text-9xl font-bold text-[#d5001c] font-mono tracking-tighter"
              >
                {seconds}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-gray-500 text-sm md:text-base mt-2 uppercase tracking-wider">
            Sek.
          </span>
        </div>
      </div>

      {/* Zusatzinformationen */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-1">Verbleibende Stationen</p>
          <motion.p
            key={result.remainingStations}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            {result.remainingStations}
          </motion.p>
        </div>
        
        <div className="text-center border-x border-gray-800">
          <p className="text-gray-500 text-sm mb-1">Zeit pro Station</p>
          <p className="text-2xl md:text-3xl font-bold text-white">
            2:42
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-1">Gesamtfortschritt</p>
          <motion.p
            key={result.progressPercent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            {result.progressPercent.toFixed(0)}%
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export default CountdownDisplay;
