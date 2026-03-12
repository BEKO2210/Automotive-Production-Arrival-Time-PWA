/**
 * Zustand Store für die Enterprise-Stations-Verwaltung
 * Inklusive Echtzeit-Tracking-Logik und Fehler-Bereinigung
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShiftBreak {
  id: string;
  name: string;
  startTime: string; 
  endTime: string;   
  enabled: boolean;
}

export interface TrackedVehicle {
  id: string;
  label: string;
  currentStation: number;
  targetStation: number;
  lastUpdateTimestamp: number;
  createdAt: number;
}

interface StationState {
  minStation: number; 
  totalStations: number; 
  secondsPerStation: number;
  breaks: ShiftBreak[];
  watchlist: TrackedVehicle[];
  currentStation: number;
  targetStation: number;
  lastUpdateTimestamp: number;
  favoriteStation: number | null;
  
  setTotalStations: (total: number) => void;
  setSecondsPerStation: (seconds: number) => void;
  setBreaks: (breaks: ShiftBreak[]) => void;
  toggleBreak: (id: string) => void;
  addBreak: (name: string, start: string, end: string) => void;
  removeBreak: (id: string) => void;
  
  addToWatchlist: (vehicle: Omit<TrackedVehicle, 'id' | 'createdAt' | 'lastUpdateTimestamp'>) => void;
  removeFromWatchlist: (id: string) => void;
  
  setCurrentStation: (station: number) => void;
  setTargetStation: (station: number) => void;
  setFavoriteStation: (station: number | null) => void;
  loadFavoriteAsTarget: () => void;
  reset: () => void;
}

const defaultBreaks: ShiftBreak[] = [
  { id: 'b1', name: 'Frühstück', startTime: '09:00', endTime: '09:15', enabled: true },
  { id: 'b2', name: 'Mittag', startTime: '12:00', endTime: '12:35', enabled: true },
];

export const useStationStore = create<StationState>()(
  persist(
    (set, get) => ({
      minStation: -10,
      totalStations: 150,
      secondsPerStation: 162,
      breaks: defaultBreaks,
      watchlist: [],
      currentStation: -10,
      targetStation: 80,
      lastUpdateTimestamp: Date.now(),
      favoriteStation: null,
      
      setTotalStations: (total: number) => {
        const { minStation } = get();
        const newTotal = Math.max(minStation + 1, Math.round(total));
        set({ totalStations: newTotal });
        
        // BUGFIX: Klemme alle Werte an das neue Maximum
        const state = get();
        if (state.currentStation > newTotal) set({ currentStation: newTotal });
        if (state.targetStation > newTotal) set({ targetStation: newTotal });
        if (state.favoriteStation && state.favoriteStation > newTotal) set({ favoriteStation: newTotal });
      },
      
      setSecondsPerStation: (seconds: number) => set({ secondsPerStation: Math.max(1, Math.round(seconds)) }),
      
      setBreaks: (breaks: ShiftBreak[]) => set({ breaks }),
      
      toggleBreak: (id: string) => set({
        breaks: get().breaks.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b)
      }),
      
      addBreak: (name, start, end) => {
        const newBreak: ShiftBreak = {
          id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 9),
          name,
          startTime: start,
          endTime: end,
          enabled: true
        };
        set({ breaks: [...get().breaks, newBreak] });
      },
      
      removeBreak: (id: string) => set({ breaks: get().breaks.filter(b => b.id !== id) }),
      
      addToWatchlist: (vehicle) => {
        const newVehicle: TrackedVehicle = {
          ...vehicle,
          id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 9),
          lastUpdateTimestamp: Date.now(),
          createdAt: Date.now(),
        };
        set({ watchlist: [newVehicle, ...get().watchlist] });
      },
      
      removeFromWatchlist: (id: string) => set({ watchlist: get().watchlist.filter(v => v.id !== id) }),
      
      setCurrentStation: (station: number) => {
        const { minStation, totalStations } = get();
        set({ 
          currentStation: Math.max(minStation, Math.min(totalStations, Math.round(station))),
          lastUpdateTimestamp: Date.now()
        });
      },
      
      setTargetStation: (station: number) => {
        const { minStation, totalStations } = get();
        set({ targetStation: Math.max(minStation, Math.min(totalStations, Math.round(station))) });
      },
      
      setFavoriteStation: (station: number | null) => {
        const { minStation, totalStations } = get();
        if (station !== null) {
          set({ favoriteStation: Math.max(minStation, Math.min(totalStations, Math.round(station))) });
        } else {
          set({ favoriteStation: null });
        }
      },
      
      loadFavoriteAsTarget: () => {
        const { favoriteStation } = get();
        if (favoriteStation !== null) set({ targetStation: favoriteStation });
      },
      
      reset: () => set({
        currentStation: get().minStation,
        targetStation: 80,
        lastUpdateTimestamp: Date.now(),
        watchlist: [],
      }),
    }),
    {
      name: 'autoflow-enterprise-storage-v4',
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
