import { Card } from '../../../components/ui';
import { WeatherDetails } from './WeatherDetails';
import type { WeatherStackResponse } from '../types';

export interface WeatherCardProps {
  data: WeatherStackResponse;
}

export function WeatherCard({ data }: WeatherCardProps) {
  const { location, current } = data;

  return (
    <div className="animate-fade-in w-full">
      <Card className="flex flex-col gap-6 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {location.name}
            </h2>
            <p className="text-sm font-medium text-gray-400 mt-1">
              {location.region ? `${location.region}, ` : ''}{location.country}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 self-start md:self-auto">
            {current.weather_icons?.[0] && (
              <img
                src={current.weather_icons[0]}
                alt={current.weather_descriptions?.[0] || 'Weather icon'}
                className="w-10 h-10 object-contain rounded-lg shadow-md shrink-0"
              />
            )}
            <span className="text-sm font-semibold text-white">
              {current.weather_descriptions?.[0] || 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center py-6">
          {current.day_title && (
            <span
              className="text-xs font-extrabold text-blue-400 uppercase tracking-widest mb-3 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 shadow-inner select-none animate-fade-in"
              data-testid="weather-card-day-title"
            >
              {current.day_title}
            </span>
          )}
          <div className="flex items-start">
            <span className="text-7xl md:text-8xl font-black text-white tracking-tighter select-none">
              {current.temperature}
            </span>
            <span className="text-3xl md:text-4xl font-bold text-blue-400 mt-1 select-none">
              °C
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-3">
            Local Time: {location.localtime.split(' ')[1] || location.localtime}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <WeatherDetails
            label="Feels Like"
            value={current.feelslike}
            unit="°C"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14h.01M12 6v11m0 3a3 3 0 100-6 3 3 0 000 6zm-3-12h6a3 3 0 013 3v8.158a7 7 0 11-12 0V9a3 3 0 013-3z" />
              </svg>
            }
          />

          <WeatherDetails
            label="Humidity"
            value={current.humidity}
            unit="%"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
              </svg>
            }
          />

          <WeatherDetails
            label="Wind"
            value={`${current.wind_speed} km/h`}
            unit={current.wind_dir}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 10H4m10 4H4m14-8H4M14 6c0-1.657 1.343-3 3-3s3 1.343 3 3a3 3 0 01-3 3M10 14c0-1.657 1.343-3 3-3s3 1.343 3 3a3 3 0 01-3 3" />
              </svg>
            }
          />

          <WeatherDetails
            label="UV Index"
            value={current.uv_index}
            unit=""
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            }
          />

          <WeatherDetails
            label="Visibility"
            value={current.visibility}
            unit="km"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />

          <WeatherDetails
            label="Pressure"
            value={current.pressure}
            unit="hPa"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v-3m-7.071.071A8 8 0 1119.07 12M12 5a7.978 7.978 0 00-3 .586" />
              </svg>
            }
          />
        </div>
      </Card>
    </div>
  );
}
