/**
 * Home Page
 * Hauptseite der Autoflow Tracker App
 * Kombiniert alle Komponenten zur Stationsberechnung im Porsche-Design
 */
import { useMemo, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, MapPin, RotateCcw, Download, Settings2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStationStore } from '@/store/useStationStore';
import { calculateArrivalTime, formatDurationReadable } from '@/utils/calculations';
import { StationInput } from '@/components/StationInput';
import { CountdownDisplay } from '@/components/CountdownDisplay';
import { ProductionLine } from '@/components/ProductionLine';

// TypeScript Interface für BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function Home() {
  // Store-States
  const {
    currentStation,
    targetStation,
    favoriteStation,
    totalStations,
    secondsPerStation,
    setCurrentStation,
    setTargetStation,
    setFavoriteStation,
    setTotalStations,
    setSecondsPerStation,
    loadFavoriteAsTarget,
    reset,
  } = useStationStore();

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings State für Editing
  const [editTotal, setEditTotal] = useState(totalStations.toString());
  const [editMins, setEditMins] = useState(Math.floor(secondsPerStation / 60).toString());
  const [editSecs, setEditSecs] = useState((secondsPerStation % 60).toString());

  useEffect(() => {
    setEditTotal(totalStations.toString());
    setEditMins(Math.floor(secondsPerStation / 60).toString());
    setEditSecs((secondsPerStation % 60).toString());
  }, [totalStations, secondsPerStation, showSettings]);

  const handleSaveSettings = () => {
    const total = parseInt(editTotal, 10);
    const mins = parseInt(editMins, 10) || 0;
    const secs = parseInt(editSecs, 10) || 0;
    
    if (!isNaN(total) && total > 0) {
      setTotalStations(total);
    }
    
    const totalSecs = (mins * 60) + secs;
    if (totalSecs > 0) {
      setSecondsPerStation(totalSecs);
    }
    setShowSettings(false);
  };

  const arrivalResult = useMemo(() => {
    return calculateArrivalTime(currentStation, targetStation, totalStations, secondsPerStation);
  }, [currentStation, targetStation, totalStations, secondsPerStation]);

  const handleFavoriteToggle = useCallback(() => {
    if (favoriteStation === targetStation) {
      setFavoriteStation(null);
    } else {
      setFavoriteStation(targetStation);
    }
  }, [favoriteStation, targetStation, setFavoriteStation]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

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

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setInstallPrompt(null);
  }, [installPrompt]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#d5001c] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#d5001c] flex items-center justify-center rounded-sm">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-widest uppercase">
                  Autoflow <span className="text-[#d5001c]">Tracker</span>
                </h1>
                <p className="text-gray-400 text-xs md:text-sm tracking-wide uppercase">
                  Produktions ETA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className={`rounded-sm transition-colors ${showSettings ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                aria-label="Einstellungen"
              >
                <Settings2 className="w-5 h-5" />
              </Button>

              <AnimatePresence>
                {installPrompt && !isInstalled && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button onClick={handleInstall} variant="outline" size="sm" className="rounded-sm border-[#d5001c] text-[#d5001c] hover:bg-[#d5001c] hover:text-white uppercase tracking-wider text-xs">
                      <Download className="w-4 h-4 mr-2" /> App laden
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <AnimatePresence>
          {showSettings && (
            <motion.section
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-[#111] border border-white/10 rounded-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-white">Konfiguration</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-gray-400 uppercase tracking-wide text-xs">Gesamtstationen</Label>
                    <Input 
                      type="number" 
                      value={editTotal} 
                      onChange={(e) => setEditTotal(e.target.value)}
                      className="bg-black border-white/20 text-white rounded-sm h-12 text-lg focus:border-[#d5001c]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-400 uppercase tracking-wide text-xs">Zeit pro Station</Label>
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Input 
                          type="number" 
                          value={editMins} 
                          onChange={(e) => setEditMins(e.target.value)}
                          className="bg-black border-white/20 text-white rounded-sm h-12 text-lg pr-12 focus:border-[#d5001c]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm uppercase">Min</span>
                      </div>
                      <div className="relative flex-1">
                        <Input 
                          type="number" 
                          value={editSecs} 
                          onChange={(e) => setEditSecs(e.target.value)}
                          className="bg-black border-white/20 text-white rounded-sm h-12 text-lg pr-12 focus:border-[#d5001c]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm uppercase">Sek</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button onClick={handleSaveSettings} className="bg-[#d5001c] hover:bg-[#b30017] text-white rounded-sm px-8 uppercase tracking-widest text-sm h-12">
                    <Save className="w-4 h-4 mr-2" /> Speichern
                  </Button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Linke Spalte: Eingaben */}
          <div className="lg:col-span-5 space-y-6">
            <StationInput
              value={currentStation}
              onChange={setCurrentStation}
              totalStations={totalStations}
              label="Aktuelle Fahrzeugstation"
              description="Die Station, an der sich das Fahrzeug momentan befindet."
              icon={<Car className="w-5 h-5 text-[#d5001c]" />}
              className="rounded-sm border border-white/5"
            />

            <StationInput
              value={targetStation}
              onChange={setTargetStation}
              totalStations={totalStations}
              label="Ihre Arbeitsstation"
              description="Die Zielstation, für die Sie die Ankunftszeit berechnen möchten."
              icon={<MapPin className="w-5 h-5 text-[#d5001c]" />}
              showFavorite
              isFavorite={favoriteStation === targetStation}
              onFavoriteToggle={handleFavoriteToggle}
              className="rounded-sm border border-white/5"
            />

            {favoriteStation !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex">
                <Button
                  variant="outline"
                  onClick={loadFavoriteAsTarget}
                  className="w-full border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-sm h-12 uppercase tracking-wider text-xs"
                >
                  <MapPin className="w-4 h-4 mr-2 text-[#d5001c]" />
                  Favorit laden (Station {favoriteStation})
                </Button>
              </motion.div>
            )}
            
            <Button
              variant="ghost"
              onClick={reset}
              className="w-full text-gray-500 hover:text-white hover:bg-white/5 rounded-sm uppercase tracking-wider text-xs"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Eingaben zurücksetzen
            </Button>
          </div>

          {/* Rechte Spalte: Ergebnisse */}
          <div className="lg:col-span-7 space-y-6">
            <CountdownDisplay result={arrivalResult} />
            <ProductionLine
              currentStation={currentStation}
              targetStation={targetStation}
              totalStations={totalStations}
              className="rounded-sm border border-white/5"
            />
            
            <div className="p-6 bg-[#111] rounded-sm border border-white/5">
              <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Linien-Informationen</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 uppercase text-xs tracking-wider mb-1">Gesamtstationen</p>
                  <p className="text-white font-medium text-lg">{totalStations}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-xs tracking-wider mb-1">Taktzeit</p>
                  <p className="text-white font-medium text-lg">{formatDurationReadable(secondsPerStation)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs uppercase tracking-widest">
              Autoflow Tracker • Entwickelt für industrielle Präzision
            </p>
            <p className="text-gray-600 text-xs uppercase tracking-widest">
              Offline-fähige PWA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
