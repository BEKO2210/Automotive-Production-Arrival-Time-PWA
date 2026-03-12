/**
 * Zustand Store für die Stations-Verwaltung
 * Speichert aktuelle Station, Zielstation und Benutzereinstellungen
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Interface für den Store-State
interface StationState {
  // Konfiguration
  totalStations: number;
  secondsPerStation: number;
  
  // Aktuelle Eingaben
  currentStation: number;
  targetStation: number;
  
  // Gespeicherte Favoritenstation
  favoriteStation: number | null;
  
  // Aktionen
  setTotalStations: (total: number) => void;
  setSecondsPerStation: (seconds: number) => void;
  setCurrentStation: (station: number) => void;
  setTargetStation: (station: number) => void;
  setFavoriteStation: (station: number | null) => void;
  loadFavoriteAsTarget: () => void;
  reset: () => void;
}

// Initialwerte
const initialState = {
  totalStations: 150,
  secondsPerStation: 162, // 2 Minuten 42 Sekunden
  currentStation: 1,
  targetStation: 80,
  favoriteStation: null,
};

/**
 * Zustand Store mit Persistenz im localStorage
 * Die Daten bleiben auch nach dem Schließen des Browsers erhalten
 */
export const useStationStore = create<StationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setTotalStations: (total: number) => {
        const newTotal = Math.max(1, Math.round(total));
        set({ totalStations: newTotal });
        
        // Klemme aktuelle Werte auf neues Maximum
        const { currentStation, targetStation, favoriteStation } = get();
        if (currentStation > newTotal) set({ currentStation: newTotal });
        if (targetStation > newTotal) set({ targetStation: newTotal });
        if (favoriteStation !== null && favoriteStation > newTotal) {
          set({ favoriteStation: newTotal });
        }
      },
      
      setSecondsPerStation: (seconds: number) => {
        set({ secondsPerStation: Math.max(1, Math.round(seconds)) });
      },
      
      /**
       * Setzt die aktuelle Fahrzeugstation
       * Validiert den Bereich
       */
      setCurrentStation: (station: number) => {
        const { totalStations } = get();
        const clampedStation = Math.max(1, Math.min(totalStations, Math.round(station)));
        set({ currentStation: clampedStation });
      },
      
      /**
       * Setzt die Zielstation (Meine Station)
       * Validiert den Bereich
       */
      setTargetStation: (station: number) => {
        const { totalStations } = get();
        const clampedStation = Math.max(1, Math.min(totalStations, Math.round(station)));
        set({ targetStation: clampedStation });
      },
      
      /**
       * Speichert eine Station als Favorit
       */
      setFavoriteStation: (station: number | null) => {
        const { totalStations } = get();
        if (station !== null) {
          const clampedStation = Math.max(1, Math.min(totalStations, Math.round(station)));
          set({ favoriteStation: clampedStation });
        } else {
          set({ favoriteStation: null });
        }
      },
      
      /**
       * Lädt die Favoritenstation als Zielstation
       */
      loadFavoriteAsTarget: () => {
        const { favoriteStation } = get();
        if (favoriteStation !== null) {
          set({ targetStation: favoriteStation });
        }
      },
      
      /**
       * Setzt alle Werte auf die Initialwerte zurück
       */
      reset: () => set({ ...initialState, totalStations: get().totalStations, secondsPerStation: get().secondsPerStation }),
    }),
    {
      name: 'autoflow-tracker-storage', // Name für localStorage
      partialize: (state) => ({ 
        favoriteStation: state.favoriteStation,
        targetStation: state.targetStation,
        totalStations: state.totalStations,
        secondsPerStation: state.secondsPerStation,
      }), // Persistierte Werte
    }
  )
);
