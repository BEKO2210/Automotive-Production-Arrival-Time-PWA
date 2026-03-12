/**
 * StationInput Komponente
 * Eingabefeld für Stationsnummern mit Slider und numerischer Eingabe
 */
import { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, StarOff } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StationInputProps {
  /** Aktueller Wert */
  value: number;
  /** Callback bei Änderung */
  onChange: (value: number) => void;
  /** Gesamtanzahl Stationen */
  totalStations: number;
  /** Label für das Eingabefeld */
  label: string;
  /** Beschreibungstext */
  description?: string;
  /** Icon-Komponente */
  icon?: React.ReactNode;
  /** Ob diese Station als Favorit markiert werden kann */
  showFavorite?: boolean;
  /** Ob diese Station aktuell als Favorit gespeichert ist */
  isFavorite?: boolean;
  /** Callback für Favoriten-Button */
  onFavoriteToggle?: () => void;
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

/**
 * Eingabekomponente für Stationsnummern
 * Kombiniert Slider und numerische Eingabe für beste UX
 */
export function StationInput({
  value,
  onChange,
  totalStations,
  label,
  description,
  icon,
  showFavorite = false,
  isFavorite = false,
  onFavoriteToggle,
  className = '',
}: StationInputProps) {
  // Lokaler State für die Eingabe (verhindert zu viele Updates)
  const [inputValue, setInputValue] = useState(value.toString());

  // Update lokaler State wenn sich der Wert von außen ändert
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  /**
   * Handler für Slider-Änderungen
   */
  const handleSliderChange = useCallback((values: number[]) => {
    const newValue = values[0];
    onChange(newValue);
  }, [onChange]);

  /**
   * Handler für numerische Eingabe
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    // Nur gültige Zahlen akzeptieren
    const numValue = parseInt(rawValue, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(1, Math.min(totalStations, numValue));
      onChange(clampedValue);
    }
  }, [onChange, totalStations]);

  /**
   * Handler für Blur-Event (Validierung)
   */
  const handleBlur = useCallback(() => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < 1) {
      onChange(1);
    } else if (numValue > totalStations) {
      onChange(totalStations);
    }
  }, [inputValue, onChange, totalStations]);

  /**
   * Handler für Favoriten-Button
   */
  const handleFavoriteClick = useCallback(() => {
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
  }, [onFavoriteToggle]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-[#1a1a1a] rounded-sm p-4 md:p-8 ${className}`}
    >
      {/* Header mit Label und Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-[#d5001c]/20">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-white text-sm md:text-xl font-semibold tracking-wide uppercase tracking-widest">
              {label}
            </h3>
          </div>
        </div>

        {/* Favoriten-Button */}
        {showFavorite && onFavoriteToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className={`rounded-sm transition-all duration-300 ${
              isFavorite
                ? 'text-[#d5001c] hover:text-[#ff1a3c] hover:bg-[#d5001c]/20'
                : 'text-gray-500 hover:text-white hover:bg-white/10'
            }`}
            aria-label={isFavorite ? 'Favorit entfernen' : 'Als Favorit speichern'}
          >
            {isFavorite ? (
              <Star className="w-6 h-6 fill-current" />
            ) : (
              <StarOff className="w-6 h-6" />
            )}
          </Button>
        )}
      </div>

      {/* Eingabebereich */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Numerische Eingabe */}
        <div className="relative w-full md:w-40 shrink-0">
          <Input
            type="number"
            min={1}
            max={totalStations}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="text-center text-3xl md:text-4xl font-bold text-white bg-black border-2 border-gray-700 rounded-sm h-16 md:h-20 focus:border-[#d5001c] focus:ring-[#d5001c]/30 transition-all font-mono"
            aria-label={`${label} eingeben`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] uppercase font-bold pointer-events-none">
            Stat.
          </span>
        </div>

        {/* Slider */}
        <div className="flex-1 w-full touch-none">
          <Slider
            value={[value]}
            onValueChange={handleSliderChange}
            min={1}
            max={totalStations}
            step={1}
            className="w-full h-10"
          />
          <div className="flex justify-between mt-2 text-[10px] uppercase font-bold text-gray-600 tracking-widest">
            <span>Start</span>
            <span>Ende ({totalStations})</span>
          </div>
        </div>
      </div>

      {/* Stations-Indikator */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
        <MapPin className="w-4 h-4" />
        <span>
          {value === 1 && 'Start der Produktionslinie'}
          {value === totalStations && 'Ende der Produktionslinie'}
          {value > 1 && value < totalStations && `Station ${value} von ${totalStations}`}
        </span>
      </div>
    </motion.div>
  );
}

export default StationInput;
