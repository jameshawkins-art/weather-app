import { useState, useEffect, useRef } from 'react';
import { Input } from '../../../components/ui';

export interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const prevIsLoading = useRef(isLoading);

  useEffect(() => {
    if (prevIsLoading.current && !isLoading) {
      setInputKey((prev) => prev + 1);
    }
    prevIsLoading.current = isLoading;
  }, [isLoading]);

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !isLoading) {
      onSearch(trimmed);
    }
  };

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="w-full relative group"
    >
      <label htmlFor="city-search-input" className="sr-only">
        Search for a city
      </label>

      <div
        className={`absolute inset-0 rounded-xl pointer-events-none filter blur-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 transition-opacity duration-500 ease-in-out ${isFocused ? 'opacity-90' : 'opacity-0'
          }`}
        aria-hidden="true"
      />

      <div className={`relative p-[1.5px] rounded-xl overflow-hidden w-full bg-white/5 transition-all duration-300 ${isFocused ? 'shadow-[0_0_20px_rgba(56,189,248,0.35)]' : ''
        }`}>

        <div
          className={`absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_20%,#3b82f6_40%,#60a5fa_60%,#a855f7_80%,transparent_100%)] transition-opacity duration-300 ${isFocused ? 'opacity-0' : 'opacity-100 animate-[spin_4s_linear_infinite]'
            }`}
          aria-hidden="true"
        />

        <div
          className={`absolute inset-0 bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'
            }`}
          aria-hidden="true"
        />

        <div className="relative w-full rounded-[10px] bg-slate-950 overflow-hidden">
          <Input
            key={inputKey}
            id="city-search-input"
            placeholder="Search for a city..."
            onSubmit={handleSubmit}
            disabled={isLoading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label="Search for a city"
            aria-describedby="search-helper-text"
            className="!border-none !bg-transparent !focus:ring-0 !focus:ring-offset-0 !focus:ring-transparent !shadow-none"
          />
        </div>
      </div>
    </form>
  );
}
