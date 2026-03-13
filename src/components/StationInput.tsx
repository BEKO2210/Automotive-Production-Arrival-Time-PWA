import { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StationInputProps {
  value: number;
  onChange: (value: number) => void;
  minStation: number;
  totalStations: number;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StationInput({
  value,
  onChange,
  minStation,
  totalStations,
  label,
  icon,
  className = '',
}: StationInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleSliderChange = useCallback((values: number[]) => {
    onChange(values[0]);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    const numValue = parseInt(rawValue, 10);
    if (!isNaN(numValue)) {
      onChange(Math.max(minStation, Math.min(totalStations, numValue)));
    }
  }, [onChange, minStation, totalStations]);

  const handleBlur = useCallback(() => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < minStation) {
      onChange(minStation);
    } else if (numValue > totalStations) {
      onChange(totalStations);
    }
  }, [inputValue, onChange, minStation, totalStations]);

  const increment = useCallback(() => {
    if (value < totalStations) onChange(value + 1);
  }, [value, totalStations, onChange]);

  const decrement = useCallback(() => {
    if (value > minStation) onChange(value - 1);
  }, [value, minStation, onChange]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-[#1a1a1a] rounded-sm p-4 md:p-8 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-[#d5001c]/20">
            {icon}
          </div>
        )}
        <h3 className="text-white text-sm md:text-xl font-semibold uppercase tracking-widest">
          {label}
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={decrement}
            disabled={value <= minStation}
            className="h-16 w-12 md:h-20 md:w-14 border-gray-700 bg-black hover:bg-[#d5001c]/20 hover:border-[#d5001c] text-white rounded-sm disabled:opacity-30"
            aria-label="Station verringern"
          >
            <Minus className="w-5 h-5" />
          </Button>

          <div className="relative">
            <Input
              type="number"
              min={minStation}
              max={totalStations}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="text-center text-3xl md:text-4xl font-bold text-white bg-black border-2 border-gray-700 rounded-sm h-16 md:h-20 w-24 md:w-32 focus:border-[#d5001c] focus:ring-[#d5001c]/30 transition-all font-mono"
              aria-label={`${label} eingeben`}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={increment}
            disabled={value >= totalStations}
            className="h-16 w-12 md:h-20 md:w-14 border-gray-700 bg-black hover:bg-[#d5001c]/20 hover:border-[#d5001c] text-white rounded-sm disabled:opacity-30"
            aria-label="Station erhöhen"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 w-full touch-none">
          <Slider
            value={[value]}
            onValueChange={handleSliderChange}
            min={minStation}
            max={totalStations}
            step={1}
            className="w-full h-10"
          />
          <div className="flex justify-between mt-2 text-[10px] uppercase font-bold text-gray-600 tracking-widest">
            <span>Start ({minStation})</span>
            <span>Ende ({totalStations})</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default StationInput;
