/**
 * Zustand Store für die Enterprise-Stations-Verwaltung
 * Inklusive Schichtpausen-Management und Watchlist für Multi-Tracking
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Interface für eine Schichtpause
export interface ShiftBreak {
  id: string;
  name: string;
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
  enabled: boolean;
}

// Interface für ein Fahrzeug in der Watchlist
export interface TrackedVehicle {
  id: string;
  label: string;
  currentStation: number;
  targetStation: number;
  createdAt: number;
}

interface StationState {
  // Konfiguration
  totalStations: number;
  secondsPerStation: number;
  
  // Schichtpausen
  breaks: ShiftBreak[];
  
  // Multi-Tracking Watchlist
  watchlist: TrackedVehicle[];
  
  // Aktuelle Eingaben (Haupt-Tracker)
  currentStation: number;
  targetStation: number;
  
  // Gespeicherte Favoritenstation
  favoriteStation: number | null;
  
  // Aktionen
  setTotalStations: (total: number) => void;
  setSecondsPerStation: (seconds: number) => void;
  
  // Pausen-Aktionen
  setBreaks: (breaks: ShiftBreak[]) => void;
  toggleBreak: (id: string) => void;
  
  // Watchlist-Aktionen
  addToWatchlist: (vehicle: Omit<TrackedVehicle, 'id' | 'createdAt'>) => void;
  removeFromWatchlist: (id: string) => void;
  updateVehiclePosition: (id: string, currentStation: number) => void;
  
  // Haupt-Tracker Aktionen
  setCurrentStation: (station: number) => void;
  setTargetStation: (station: number) => void;
  setFavoriteStation: (station: number | null) => void;
  loadFavoriteAsTarget: () => void;
  reset: () => void;
}

// Standard-Pausen für Porsche Produktion
const defaultBreaks: ShiftBreak[] = [
  { id: 'b1', name: 'Frühstückspause', startTime: '09:00', endTime: '09:15', enabled: true },
  { id: 'b2', name: 'Mittagspause', startTime: '12:00', endTime: '12:35', enabled: true },
  { id: 'b3', name: 'Abendpause', startTime: '18:00', endTime: '18:15', enabled: true },
];

const initialState = {
  totalStations: 150,
  secondsPerStation: 162, // 2 Min 42 Sek
  breaks: defaultBreaks,
  watchlist: [],
  currentStation: 1,
  targetStation: 80,
  favoriteStation: null,
};

/**
 * Zustand Store mit Persistenz
 * Speichert Enterprise-Einstellungen und Watchlist lokal
 */
export const useStationStore = create<StationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setTotalStations: (total: number) => {
        const newTotal = Math.max(1, Math.round(total));
        set({ totalStations: newTotal });
      },
      
      setSecondsPerStation: (seconds: number) => {
        set({ secondsPerStation: Math.max(1, Math.round(seconds)) });
      },
      
      setBreaks: (breaks: ShiftBreak[]) => set({ breaks }),
      
      toggleBreak: (id: string) => {
        set({
          breaks: get().breaks.map(b => 
            b.id === id ? { ...b, enabled: !b.enabled } : b
          )
        });
      },
      
      addToWatchlist: (vehicle) => {
        const newVehicle: TrackedVehicle = {
          ...vehicle,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: Date.now(),
        };
        set({ watchlist: [newVehicle, ...get().watchlist] });
      },
      
      removeFromWatchlist: (id: string) => {
        set({ watchlist: get().watchlist.filter(v => v.id !== id) });
      },

      updateVehiclePosition: (id: string, currentStation: number) => {
        set({
          watchlist: get().watchlist.map(v => 
            v.id === id ? { ...v, currentStation } : v
          )
        });
      },
      
      setCurrentStation: (station: number) => {
        const { totalStations } = get();
        const clampedStation = Math.max(1, Math.min(totalStations, Math.round(station)));
        set({ currentStation: clampedStation });
      },
      
      setTargetStation: (station: number) => {
        const { totalStations } = get();
        const clampedStation = Math.max(1, Math.min(totalStations, Math.round(station)));
        set({ targetStation: clampedStation });
      },
      
      setFavoriteStation: (station: number | null) => {
        const { totalStations } = get();
        if (station !== null) {
          const clampedStation = Math.max(1, Math.min(totalStations, Math.round(station)));
          set({ favoriteStation: clampedStation });
        } else {
          set({ favoriteStation: null });
        }
      },
      
      loadFavoriteAsTarget: () => {
        const { favoriteStation } = get();
        if (favoriteStation !== null) {
          set({ targetStation: favoriteStation });
        }
      },
      
      reset: () => set({
        currentStation: 1,
        targetStation: 80,
        watchlist: [],
      }),
    }),
    {
      name: 'autoflow-enterprise-storage',
      partialize: (state) => ({ 
        favoriteStation: state.favoriteStation,
        targetStation: state.targetStation,
        totalStations: state.totalStations,
        secondsPerStation: state.secondsPerStation,
        breaks: state.breaks,
        watchlist: state.watchlist,
      }),
    }
  )
);
