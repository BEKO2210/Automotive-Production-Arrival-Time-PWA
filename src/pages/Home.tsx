import { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, MapPin, Settings2, Save, X,
  Clock, Plus, Trash2, List, RotateCcw
} from 'lucide-react';
const logoSvg = `${import.meta.env.BASE_URL}icons/logo.svg`;
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStationStore } from '@/store/useStationStore';
import type { TrackedVehicle } from '@/store/useStationStore';
import { calculateArrivalTime, formatTime, formatDuration } from '@/utils/calculations';
import { StationInput } from '@/components/StationInput';
import { CountdownDisplay } from '@/components/CountdownDisplay';
import { ProductionLine } from '@/components/ProductionLine';

export function Home() {
  const {
    currentStation, targetStation, totalStations, secondsPerStation,
    breaks, watchlist, minStation, lastUpdateTimestamp,
    setCurrentStation, setTargetStation, setTotalStations,
    setSecondsPerStation, toggleBreak, addBreak, removeBreak, addToWatchlist, removeFromWatchlist
  } = useStationStore();

  const [showSettings, setShowSettings] = useState(false);
  const [ticker, setTicker] = useState(Date.now());

  const [editTotal, setEditTotal] = useState(totalStations.toString());
  const [editMins, setEditMins] = useState(Math.floor(secondsPerStation / 60).toString());
  const [editSecs, setEditSecs] = useState((secondsPerStation % 60).toString());

  const [newBreakName, setNewBreakName] = useState('');
  const [newBreakStart, setNewBreakStart] = useState('09:00');
  const [newBreakEnd, setNewBreakEnd] = useState('09:15');

  // Track if arrival notification was already shown
  const arrivalNotifiedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setTicker(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setEditTotal(totalStations.toString());
    setEditMins(Math.floor(secondsPerStation / 60).toString());
    setEditSecs((secondsPerStation % 60).toString());
  }, [totalStations, secondsPerStation, showSettings]);

  const handleSaveSettings = () => {
    const newTotal = parseInt(editTotal, 10);
    const newSeconds = (parseInt(editMins, 10) || 0) * 60 + (parseInt(editSecs, 10) || 0);

    if (newTotal && newTotal > 0) setTotalStations(newTotal);
    if (newSeconds > 0) setSecondsPerStation(newSeconds);

    setShowSettings(false);
    toast.success('Einstellungen gespeichert');
  };

  const handleAddBreak = () => {
    if (newBreakName.trim()) {
      addBreak(newBreakName, newBreakStart, newBreakEnd);
      setNewBreakName('');
      toast.success(`Pause "${newBreakName}" hinzugefügt`);
    }
  };

  const handleAddToWatchlist = () => {
    const label = `FZG-${String(Date.now()).slice(-4)}`;
    addToWatchlist({ label, currentStation, targetStation });
    toast.success(`${label} zur Watchlist hinzugefügt`);
  };

  const handleResetStation = () => {
    setCurrentStation(minStation);
    arrivalNotifiedRef.current = false;
    toast('Station zurückgesetzt');
  };

  const arrivalResult = useMemo(() => {
    return calculateArrivalTime(
      currentStation,
      targetStation,
      totalStations,
      secondsPerStation,
      lastUpdateTimestamp,
      minStation,
      breaks
    );
  }, [currentStation, targetStation, totalStations, secondsPerStation, lastUpdateTimestamp, minStation, breaks, ticker]);

  // Notifications for proximity and arrival
  useEffect(() => {
    if (arrivalResult.remainingStations === 1 && !arrivalResult.isPassed) {
      if ('vibrate' in navigator) navigator.vibrate(200);
    } else if (arrivalResult.isPassed && arrivalResult.isValid && !arrivalNotifiedRef.current) {
      if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
      toast.success('Fahrzeug hat Ihre Station erreicht!', { duration: 5000 });
      arrivalNotifiedRef.current = true;
    }
  }, [arrivalResult.remainingStations, arrivalResult.isPassed, arrivalResult.isValid]);

  // Reset notification flag when station changes
  useEffect(() => {
    arrivalNotifiedRef.current = false;
  }, [currentStation, targetStation]);

  // Wake Lock
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch {
        // Wake lock request failed (e.g. low battery)
      }
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLock?.release();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans transition-all duration-500" style={{
      boxShadow: arrivalResult.remainingStations === 1 && !arrivalResult.isPassed
        ? 'inset 0 0 40px #d5001c'
        : 'none',
      animation: arrivalResult.remainingStations === 1 && !arrivalResult.isPassed
        ? 'pulse-red 2s infinite'
        : 'none'
    }}>
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-3 py-3 md:py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="Autoflow Logo" className="w-8 h-10 md:w-10 md:h-12 object-contain" />
            <h1 className="text-base md:text-xl font-bold tracking-widest uppercase text-white">
              Autoflow <span className="text-[#d5001c]">Tracker</span>
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetStation}
              className="text-gray-400 hover:text-white h-8 w-8"
              aria-label="Station zurücksetzen"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-white h-8 w-8"
              aria-label="Einstellungen öffnen"
            >
              <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-2 py-4 md:py-10 space-y-6 md:space-y-8">

        <AnimatePresence>
          {showSettings && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 bg-[#111] border border-white/10 rounded-sm space-y-6 overflow-hidden"
              aria-label="Werkseinstellungen"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Werkseinstellungen</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)} aria-label="Einstellungen schließen">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-gray-400 uppercase text-[10px] tracking-widest">Produktions-Parameter</Label>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="edit-total" className="text-[10px] uppercase">End-Station</Label>
                        <Input id="edit-total" type="number" value={editTotal} onChange={e => setEditTotal(e.target.value)} className="bg-black border-white/10 rounded-sm" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-[10px] uppercase">Taktzeit (M:S)</Label>
                        <div className="flex gap-2">
                          <Input type="number" value={editMins} onChange={e => setEditMins(e.target.value)} className="bg-black border-white/10 rounded-sm" aria-label="Minuten" />
                          <Input type="number" value={editSecs} onChange={e => setEditSecs(e.target.value)} className="bg-black border-white/10 rounded-sm" aria-label="Sekunden" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveSettings} className="bg-[#d5001c] hover:bg-[#b30017] text-white rounded-sm w-full uppercase tracking-widest text-xs h-12">
                    <Save className="w-4 h-4 mr-2" aria-hidden="true" /> Parameter Speichern
                  </Button>
                </div>

                <div className="space-y-4">
                  <Label className="text-gray-400 uppercase text-[10px] tracking-widest">Schichtpausen</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {breaks.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-black border border-white/5 rounded-sm">
                        <div className="flex items-center gap-3">
                          <Clock className={`w-4 h-4 ${b.enabled ? 'text-[#d5001c]' : 'text-gray-700'}`} aria-hidden="true" />
                          <div>
                            <p className={`text-[10px] font-bold uppercase ${b.enabled ? 'text-white' : 'text-gray-700'}`}>{b.name}</p>
                            <p className="text-[9px] text-gray-500">{b.startTime} - {b.endTime}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => toggleBreak(b.id)} className="text-[9px] uppercase px-2 h-7">
                            {b.enabled ? 'Aktiv' : 'Aus'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeBreak(b.id)} className="text-gray-600 hover:text-[#d5001c] h-7 w-7 p-0" aria-label={`Pause ${b.name} entfernen`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <Input placeholder="Pausenname (z.B. Mittag)" value={newBreakName} onChange={e => setNewBreakName(e.target.value.toUpperCase())} className="bg-black border-white/10 rounded-sm text-[10px]" aria-label="Name der neuen Pause" />
                    <div className="flex gap-2">
                      <Input type="time" value={newBreakStart} onChange={e => setNewBreakStart(e.target.value)} className="bg-black border-white/10 rounded-sm text-[10px]" aria-label="Pausenbeginn" />
                      <Input type="time" value={newBreakEnd} onChange={e => setNewBreakEnd(e.target.value)} className="bg-black border-white/10 rounded-sm text-[10px]" aria-label="Pausenende" />
                      <Button onClick={handleAddBreak} variant="outline" className="border-white/10 text-white rounded-sm h-10 px-3" aria-label="Pause hinzufügen">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <StationInput
              value={currentStation}
              onChange={setCurrentStation}
              minStation={minStation}
              totalStations={totalStations}
              label="Fahrzeugstation"
              icon={<Car className="w-5 h-5 text-[#d5001c]" />}
            />

            <StationInput
              value={targetStation}
              onChange={setTargetStation}
              minStation={minStation}
              totalStations={totalStations}
              label="Ihre Station"
              icon={<MapPin className="w-5 h-5 text-[#d5001c]" />}
            />

            <Button
              onClick={handleAddToWatchlist}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-sm h-12 uppercase tracking-widest text-[10px]"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" /> Zur Watchlist hinzufügen
            </Button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <CountdownDisplay result={arrivalResult} />
            <ProductionLine
              currentStation={arrivalResult.liveCurrentStation}
              targetStation={targetStation}
              minStation={minStation}
              totalStations={totalStations}
            />
          </div>
        </div>

        {/* Watchlist */}
        <section className="space-y-4 pt-8 border-t border-white/10" aria-label="Fahrzeug Watchlist">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <List className="w-5 h-5 text-[#d5001c]" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Watchlist
                {watchlist.length > 0 && (
                  <span className="ml-2 text-gray-500">({watchlist.length})</span>
                )}
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map(v => (
              <WatchlistCard key={v.id} vehicle={v} onRemove={(id) => {
                removeFromWatchlist(id);
                toast(`${v.label} entfernt`);
              }} ticker={ticker} />
            ))}
            {watchlist.length === 0 && (
              <div className="col-span-full py-12 text-center bg-[#111] border border-dashed border-white/10 rounded-sm">
                <p className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">Keine Fahrzeuge in der Watchlist</p>
                <p className="text-gray-700 text-[9px] mt-2">Verwenden Sie den Button oben, um Fahrzeuge hinzuzufügen</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-3 py-6 mt-8 border-t border-white/5 text-center">
        <p className="text-gray-700 text-[9px] uppercase tracking-widest">
          Autoflow Tracker &middot; Taktzeit: {formatDuration(secondsPerStation)} &middot; {totalStations} Stationen
        </p>
      </footer>
    </div>
  );
}

function WatchlistCard({ vehicle, onRemove, ticker }: { vehicle: TrackedVehicle, onRemove: (id: string) => void, ticker: number }) {
  const { totalStations, secondsPerStation, breaks, minStation } = useStationStore();
  const res = useMemo(() => calculateArrivalTime(
    vehicle.currentStation,
    vehicle.targetStation,
    totalStations,
    secondsPerStation,
    vehicle.lastUpdateTimestamp,
    minStation,
    breaks
  ), [vehicle.currentStation, vehicle.targetStation, totalStations, secondsPerStation, vehicle.lastUpdateTimestamp, minStation, breaks, ticker]);

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 bg-[#111] border border-white/5 rounded-sm flex flex-col justify-between h-36 relative group"
      aria-label={`Fahrzeug ${vehicle.label}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">{vehicle.label}</p>
          <p className="text-sm font-bold text-white uppercase tracking-widest">
            ETA: {res.isPassed ? '--:--' : formatTime(res.estimatedArrivalTime)}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(vehicle.id)} className="h-6 w-6 text-gray-700 hover:text-[#d5001c]" aria-label={`${vehicle.label} entfernen`}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] uppercase font-bold text-gray-500">
          <span>Stat: {Math.round(res.liveCurrentStation)} → {vehicle.targetStation}</span>
          <span className={res.isPassed ? 'text-green-500' : 'text-[#d5001c]'}>
            {res.isPassed ? 'Angekommen' : res.formattedTime}
          </span>
        </div>
        <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${res.progressPercent}%` }}
            className={`h-full rounded-full ${res.isPassed ? 'bg-green-500' : 'bg-[#d5001c]'}`}
          />
        </div>
      </div>
    </motion.article>
  );
}

export default Home;
