import { Card } from '../../../components/ui';
import type { ExtendedWeatherResponse, DailyWeatherData } from '../types';
import { WeatherTile } from './WeatherTile';
import React from 'react';

export interface ForecastHistorySectionProps {
  weather: ExtendedWeatherResponse;
  selectedDay: DailyWeatherData | null;
  onSelectDay: (day: DailyWeatherData | null) => void;
}

export function ForecastHistorySection({
  weather,
  selectedDay,
  onSelectDay,
}: ForecastHistorySectionProps) {
  const isCurrentSelected = selectedDay === null;

  const handleCurrentClick = () => {
    onSelectDay(null);
  };

  const handleCurrentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectDay(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 md:p-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl transition-all duration-300 hover:border-blue-500/20">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        {/* Reset / Current Weather Tile */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center md:text-left">
            Current
          </h3>
          <Card
            className={`cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 !p-3 flex flex-col items-center justify-between text-center gap-1 select-none h-full min-h-[120px] ${
              isCurrentSelected
                ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/10'
                : 'hover:border-white/20 hover:bg-white/10'
            }`}
            role="button"
            tabIndex={0}
            onClick={handleCurrentClick}
            onKeyDown={handleCurrentKeyDown}
            aria-selected={isCurrentSelected}
            aria-label={`Current weather, ${weather.current.temperature} degrees Celsius`}
          >
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Today
            </span>
            {weather.current.weather_icons?.[0] && (
              <img
                src={weather.current.weather_icons[0]}
                alt={weather.current.weather_descriptions?.[0] || 'Current Weather'}
                className="w-10 h-10 object-contain rounded-lg shadow-md my-0.5 shrink-0"
                draggable={false}
              />
            )}
            <span className="text-sm font-bold text-white shrink-0">
              {Math.round(weather.current.temperature)}°C
            </span>
          </Card>
        </div>

        {/* 3-Day History Grid */}
        <div className="md:col-span-3 flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center md:text-left">
            3-Day History
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {weather.history.map((day) => {
              const isSelected = selectedDay?.date === day.date;
              return (
                <WeatherTile
                  key={day.date}
                  day={day}
                  isSelected={isSelected}
                  onClick={() => onSelectDay(day)}
                />
              );
            })}
          </div>
        </div>

        {/* 3-Day Forecast Grid */}
        <div className="md:col-span-3 flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center md:text-left">
            3-Day Forecast
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {weather.forecast.map((day) => {
              const isSelected = selectedDay?.date === day.date;
              return (
                <WeatherTile
                  key={day.date}
                  day={day}
                  isSelected={isSelected}
                  onClick={() => onSelectDay(day)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
