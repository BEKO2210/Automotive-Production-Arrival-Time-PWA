/**
 * Home Page
 * Hauptseite der Autoflow Tracker App
 * Kombiniert alle Komponenten zur Stationsberechnung
 */
import { useMemo, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, MapPin, RotateCcw, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStationStore, TOTAL_STATIONS } from '@/store/useStationStore';
import { calculateArrivalTime } from '@/utils/calculations';
import { StationInput } from '@/components/StationInput';
import { CountdownDisplay } from '@/components/CountdownDisplay';
import { ProductionLine } from '@/components/ProductionLine';

/**
 * Hauptkomponente der Anwendung
 * Verwaltet den gesamten Zustand und die Darstellung
 */
export function Home() {
  // Store-States
  const {
    currentStation,
    targetStation,
    favoriteStation,
    setCurrentStation,
    setTargetStation,
    setFavoriteStation,
    loadFavoriteAsTarget,
    reset,
  } = useStationStore();

  // Lokaler State für PWA Install Prompt
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Berechnung der Ankunftszeit
  const arrivalResult = useMemo(() => {
    return calculateArrivalTime(currentStation, targetStation);
  }, [currentStation, targetStation]);

  // Handler für Favoriten-Toggle
  const handleFavoriteToggle = useCallback(() => {
    if (favoriteStation === targetStation) {
      setFavoriteStation(null);
    } else {
      setFavoriteStation(targetStation);
    }
  }, [favoriteStation, targetStation, setFavoriteStation]);

  // Handler für Reset
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // PWA Install Prompt Handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    // Prüfe ob die App bereits installiert ist
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Installations-Handler
  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  }, [installPrompt]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            {/* Logo und Titel */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#d5001c] flex items-center justify-center">
                <Car className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  AUTOFLOW <span className="text-[#d5001c]">TRACKER</span>
                </h1>
                <p className="text-gray-400 text-xs md:text-sm">
                  Produktionslinien ETA
                </p>
              </div>
            </div>

            {/* Install-Button */}
            <AnimatePresence>
              {installPrompt && !isInstalled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    onClick={handleInstall}
                    variant="outline"
                    size="sm"
                    className="border-[#d5001c] text-[#d5001c] hover:bg-[#d5001c] hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Installieren
                  </Button>
                </motion.div>
              )}
              {isInstalled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-green-500 text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden md:inline">Installiert</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* Hauptinhalt */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Eingabebereich */}
        <section className="space-y-6 mb-8">
          {/* Aktuelle Fahrzeugstation */}
          <StationInput
            value={currentStation}
            onChange={setCurrentStation}
            label="Aktuelle Fahrzeugstation"
            description="Station wo sich das Fahrzeug aktuell befindet"
            icon={<Car className="w-5 h-5 text-[#d5001c]" />}
          />

          {/* Meine Station */}
          <StationInput
            value={targetStation}
            onChange={setTargetStation}
            label="Meine Station"
            description="Ihre Arbeitsstation an der Produktionslinie"
            icon={<MapPin className="w-5 h-5 text-[#d5001c]" />}
            showFavorite
            isFavorite={favoriteStation === targetStation}
            onFavoriteToggle={handleFavoriteToggle}
          />

          {/* Schnellaktionen */}
          {favoriteStation !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={loadFavoriteAsTarget}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <MapPin className="w-4 h-4 mr-2 text-[#d5001c]" />
                Favorit laden (Station {favoriteStation})
              </Button>
            </motion.div>
          )}
        </section>

        {/* Ergebnisbereich */}
        <section className="space-y-6">
          {/* Countdown-Anzeige */}
          <CountdownDisplay result={arrivalResult} />

          {/* Produktionslinie-Visualisierung */}
          <ProductionLine
            currentStation={currentStation}
            targetStation={targetStation}
          />
        </section>

        {/* Info-Bereich */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-6 bg-[#1a1a1a] rounded-2xl"
        >
          <h3 className="text-white font-semibold mb-4">Informationen</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <p className="mb-2">
                <span className="text-gray-500">Gesamtstationen:</span>{' '}
                <span className="text-white font-medium">{TOTAL_STATIONS}</span>
              </p>
              <p className="mb-2">
                <span className="text-gray-500">Zeit pro Station:</span>{' '}
                <span className="text-white font-medium">2 Min. 42 Sek.</span>
              </p>
            </div>
            <div>
              <p className="mb-2">
                <span className="text-gray-500">Aktuelle Station:</span>{' '}
                <span className="text-white font-medium">{currentStation}</span>
              </p>
              <p className="mb-2">
                <span className="text-gray-500">Zielstation:</span>{' '}
                <span className="text-white font-medium">{targetStation}</span>
              </p>
            </div>
          </div>
        </motion.section>

        {/* Reset-Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-center"
        >
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-gray-500 hover:text-white hover:bg-gray-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Zurücksetzen
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="border-t border-gray-800 mt-12"
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              Autoflow Tracker • Produktionslinien ETA
            </p>
            <p className="text-gray-600 text-xs">
              Offline-fähige PWA • Installierbar
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

// TypeScript Interface für BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default Home;
