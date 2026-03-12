/**
 * Home Page (Enterprise Edition)
 * Inklusive Pausen-Management, Watchlist, Haptik und Porsche-Präzision
 */
import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, MapPin, Settings2, Save, X, 
  Clock, Plus, Trash2, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStationStore } from '@/store/useStationStore';
import type { TrackedVehicle } from '@/store/useStationStore';
import { calculateArrivalTime, formatTime } from '@/utils/calculations';
import { StationInput } from '@/components/StationInput';
import { CountdownDisplay } from '@/components/CountdownDisplay';
import { ProductionLine } from '@/components/ProductionLine';

export function Home() {
  // Store-States
  const {
    currentStation, targetStation, favoriteStation, totalStations, secondsPerStation,
    breaks, watchlist,
    setCurrentStation, setTargetStation, setFavoriteStation, setTotalStations,
    setSecondsPerStation, toggleBreak, addToWatchlist, removeFromWatchlist
  } = useStationStore();

  const [showSettings, setShowSettings] = useState(false);

  // Settings State
  const [editTotal, setEditTotal] = useState(totalStations.toString());
  const [editMins, setEditMins] = useState(Math.floor(secondsPerStation / 60).toString());
  const [editSecs, setEditSecs] = useState((secondsPerStation % 60).toString());

  useEffect(() => {
    setEditTotal(totalStations.toString());
    setEditMins(Math.floor(secondsPerStation / 60).toString());
    setEditSecs((secondsPerStation % 60).toString());
  }, [totalStations, secondsPerStation, showSettings]);

  const handleSaveSettings = () => {
    setTotalStations(parseInt(editTotal, 10) || totalStations);
    setSecondsPerStation((parseInt(editMins, 10) || 0) * 60 + (parseInt(editSecs, 10) || 0));
    setShowSettings(false);
  };

  const arrivalResult = useMemo(() => {
    return calculateArrivalTime(currentStation, targetStation, totalStations, secondsPerStation, breaks);
  }, [currentStation, targetStation, totalStations, secondsPerStation, breaks]);

  // Effekt für Vibration und Visual Alerts
  useEffect(() => {
    if (arrivalResult.remainingStations === 1 && !arrivalResult.isPassed) {
      if ('vibrate' in navigator) navigator.vibrate(200);
    } else if (arrivalResult.isPassed && arrivalResult.isValid) {
      if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
    }
  }, [arrivalResult.remainingStations, arrivalResult.isPassed, arrivalResult.isValid]);

  // Wake Lock API (Hält Bildschirm an)
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    };
    requestWakeLock();
    return () => { if (wakeLock && wakeLock.release) wakeLock.release(); };
  }, []);

  return (
    <div className={`min-h-screen bg-black text-white font-sans transition-all duration-500 ${
      arrivalResult.remainingStations === 1 && !arrivalResult.isPassed 
        ? 'ring-inset ring-8 ring-[#d5001c] animate-pulse' 
        : ''
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#d5001c] flex items-center justify-center rounded-sm">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-widest uppercase text-white">
                Autoflow <span className="text-[#d5001c]">Enterprise</span>
              </h1>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white">
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8">
        
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-6 bg-[#111] border border-white/10 rounded-sm space-y-6 overflow-hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Konfiguration</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}><X className="w-5 h-5" /></Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-gray-400 uppercase text-[10px] tracking-widest">Produktion</Label>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[10px] uppercase">Stationen Gesamt</Label>
                      <Input type="number" value={editTotal} onChange={e => setEditTotal(e.target.value)} className="bg-black border-white/10 rounded-sm" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-[10px] uppercase">Taktzeit (M:S)</Label>
                      <div className="flex gap-2">
                        <Input type="number" value={editMins} onChange={e => setEditMins(e.target.value)} className="bg-black border-white/10 rounded-sm" />
                        <Input type="number" value={editSecs} onChange={e => setEditSecs(e.target.value)} className="bg-black border-white/10 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-gray-400 uppercase text-[10px] tracking-widest">Schichtpausen (ETA Korrektur)</Label>
                  <div className="space-y-2">
                    {breaks.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-black border border-white/5 rounded-sm">
                        <div className="flex items-center gap-3">
                          <Clock className={`w-4 h-4 ${b.enabled ? 'text-[#d5001c]' : 'text-gray-700'}`} />
                          <span className={`text-[10px] font-bold uppercase ${b.enabled ? 'text-white' : 'text-gray-700'}`}>{b.name} ({b.startTime}-{b.endTime})</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toggleBreak(b.id)} className="text-[10px] uppercase">{b.enabled ? 'Aktiv' : 'Inaktiv'}</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveSettings} className="bg-[#d5001c] hover:bg-[#b30017] text-white rounded-sm w-full uppercase tracking-widest text-xs h-12">
                <Save className="w-4 h-4 mr-2" /> Speichern
              </Button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Main Interface */}
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <StationInput
              value={currentStation}
              onChange={setCurrentStation}
              totalStations={totalStations}
              label="Aktuelle Fahrzeugstation"
              icon={<Car className="w-5 h-5 text-[#d5001c]" />}
            />

            <StationInput
              value={targetStation}
              onChange={setTargetStation}
              totalStations={totalStations}
              label="Ihre Arbeitsstation"
              icon={<MapPin className="w-5 h-5 text-[#d5001c]" />}
              showFavorite
              isFavorite={favoriteStation === targetStation}
              onFavoriteToggle={() => setFavoriteStation(favoriteStation === targetStation ? null : targetStation)}
            />

            <Button onClick={() => addToWatchlist({ label: `VIN-${Math.floor(Math.random()*1000)}`, currentStation, targetStation })} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-sm h-12 uppercase tracking-widest text-xs">
              <Plus className="w-4 h-4 mr-2 text-[#d5001c]" /> Zur Watchlist hinzufügen
            </Button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <CountdownDisplay result={arrivalResult} />
            <ProductionLine currentStation={currentStation} targetStation={targetStation} totalStations={totalStations} />
          </div>
        </div>

        {/* Watchlist Section */}
        <section className="space-y-4 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-[#d5001c]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Fahrzeug Watchlist (Multi-Tracking)</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map(v => (
              <WatchlistCard key={v.id} vehicle={v} onRemove={removeFromWatchlist} />
            ))}
            {watchlist.length === 0 && (
              <div className="col-span-full py-12 text-center bg-[#111] border border-dashed border-white/10 rounded-sm">
                <p className="text-gray-600 text-xs uppercase tracking-widest">Keine Fahrzeuge in der Liste</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function WatchlistCard({ vehicle, onRemove }: { vehicle: TrackedVehicle, onRemove: (id: string) => void }) {
  const { totalStations, secondsPerStation, breaks } = useStationStore();
  const res = useMemo(() => calculateArrivalTime(vehicle.currentStation, vehicle.targetStation, totalStations, secondsPerStation, breaks), [vehicle.currentStation, vehicle.targetStation, totalStations, secondsPerStation, breaks]);
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[#111] border border-white/5 rounded-sm flex flex-col justify-between h-32 relative group">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{vehicle.label}</p>
          <p className="text-sm font-bold text-white uppercase tracking-widest">ETA: {formatTime(res.estimatedArrivalTime)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(vehicle.id)} className="h-6 w-6 text-gray-700 hover:text-[#d5001c] opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
          <span>Stat: {vehicle.currentStation}</span>
          <span className={res.isPassed ? 'text-green-500' : 'text-[#d5001c]'}>{res.isPassed ? 'Ankunft' : res.formattedTime}</span>
        </div>
        <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${res.progressPercent}%` }} className="h-full bg-[#d5001c]" />
        </div>
      </div>
    </motion.div>
  );
}

export default Home;
