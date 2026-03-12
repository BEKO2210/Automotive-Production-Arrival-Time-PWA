/**
 * Zustand Store für die Stations-Verwaltung
 * Speichert aktuelle Station, Zielstation und Benutzereinstellungen
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Konstanten für die Produktionslinie
export const TOTAL_STATIONS = 150;
export const SECONDS_PER_STATION = 162; // 2 Minuten 42 Sekunden

// Interface für den Store-State
interface StationState {
  // Aktuelle Eingaben
  currentStation: number;
  targetStation: number;
  
  // Gespeicherte Favoritenstation
  favoriteStation: number | null;
  
  // Aktionen
  setCurrentStation: (station: number) => void;
  setTargetStation: (station: number) => void;
  setFavoriteStation: (station: number | null) => void;
  loadFavoriteAsTarget: () => void;
  reset: () => void;
}

// Initialwerte
const initialState = {
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
      
      /**
       * Setzt die aktuelle Fahrzeugstation
       * Validiert den Bereich 1-150
       */
      setCurrentStation: (station: number) => {
        const clampedStation = Math.max(1, Math.min(TOTAL_STATIONS, Math.round(station)));
        set({ currentStation: clampedStation });
      },
      
      /**
       * Setzt die Zielstation (Meine Station)
       * Validiert den Bereich 1-150
       */
      setTargetStation: (station: number) => {
        const clampedStation = Math.max(1, Math.min(TOTAL_STATIONS, Math.round(station)));
        set({ targetStation: clampedStation });
      },
      
      /**
       * Speichert eine Station als Favorit
       */
      setFavoriteStation: (station: number | null) => {
        if (station !== null) {
          const clampedStation = Math.max(1, Math.min(TOTAL_STATIONS, Math.round(station)));
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
      reset: () => set(initialState),
    }),
    {
      name: 'autoflow-tracker-storage', // Name für localStorage
      partialize: (state) => ({ 
        favoriteStation: state.favoriteStation,
        targetStation: state.targetStation,
      }), // Nur Favorit und Zielstation persistieren
    }
  )
);
