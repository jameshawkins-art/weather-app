import { useWeather } from './features/weather';
import { SearchBar, WeatherCard } from './features/weather/components';
import { Spinner, ErrorMessage } from './components/ui';

function App() {
  const { weather, isLoading, error, fetchWeather, clearError } = useWeather();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-slate-900 text-white flex flex-col items-center justify-start p-4 md:p-8">
      <div className="w-full max-w-2xl flex flex-col gap-8 mt-12 md:mt-20">
        <header className="flex flex-col items-center text-center gap-2">
          <div className="bg-blue-500/10 text-blue-400 p-3 rounded-2xl border border-blue-500/20 shadow-inner">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mt-2">
            Weather App
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-sm">
            Enter a city name to get real-time weather details and conditions.
          </p>
        </header>

        <section className="w-full">
          <SearchBar onSearch={(city) => { void fetchWeather(city); }} isLoading={isLoading} />
        </section>

        <main className="w-full flex flex-col items-center gap-6">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <Spinner size="lg" />
              <p className="text-sm font-medium text-gray-400 animate-pulse">
                Fetching weather data...
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="w-full animate-fade-in">
              <ErrorMessage message={error} onDismiss={clearError} />
            </div>
          )}

          {weather && !isLoading && !error && (
            <WeatherCard data={weather} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
