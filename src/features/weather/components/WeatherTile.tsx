import { Card } from '../../../components/ui';
import type { DailyWeatherData } from '../types';
import React from 'react';

export interface WeatherTileProps {
  day: DailyWeatherData;
  isSelected: boolean;
  onClick: () => void;
}

export function WeatherTile({ day, isSelected, onClick }: WeatherTileProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={`cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 !p-3 flex flex-col items-center justify-between text-center gap-1 select-none h-full min-h-[120px] ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/10'
          : 'hover:border-white/20 hover:bg-white/10'
      }`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-selected={isSelected}
      aria-label={`Weather for ${day.dayName}, ${day.temperature} degrees Celsius, ${day.weather_descriptions?.[0] || ''}`}
    >
      <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase truncate w-full">
        {day.dayName}
      </span>
      {day.weather_icons?.[0] && (
        <img
          src={day.weather_icons[0]}
          alt={day.weather_descriptions?.[0] || 'Weather condition'}
          className="w-10 h-10 object-contain rounded-lg shadow-md my-0.5 shrink-0"
          draggable={false}
        />
      )}
      <span className="text-sm font-bold text-white shrink-0">
        {Math.round(day.temperature)}°C
      </span>
    </Card>
  );
}
