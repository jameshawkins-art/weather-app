import { useWeather } from './features/weather';
import { SearchBar, WeatherCard } from './features/weather/components';
import { Spinner, ErrorMessage } from './components/ui';

function App() {
  const { weather, isLoading, error, lastSearchedCity, fetchWeather, clearError } = useWeather();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-slate-900 text-white flex flex-col items-center justify-start p-4 md:p-8">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all"
      >
        Skip to content
      </a>

      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="w-full max-w-2xl flex flex-col gap-8 mt-12 md:mt-20 focus:outline-none"
      >
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
          <p
            id="search-helper-text"
            className="text-sm font-medium text-gray-500 max-w-sm"
          >
            Enter a city name to get real-time weather details and conditions.
          </p>
        </header>

        <section aria-label="City search" className="w-full">
          <SearchBar onSearch={(city) => { fetchWeather(city); }} isLoading={isLoading} />
        </section>

        <div
          className="w-full flex flex-col items-center gap-6"
          aria-live="polite"
        >
          {!lastSearchedCity && !isLoading && !error && (
            <section aria-label="Welcome screen" className="w-full">
              <div className="w-full max-w-md mx-auto bg-slate-900/50 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl animate-fade-in flex flex-col items-center justify-center gap-5 transition-all duration-300 hover:border-blue-500/30">
                <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 via-orange-400 to-blue-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-orange-500/10 animate-pulse">
                  ☀️
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                    Ready to check the weather?
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Search for any city to get instant local conditions, temperatures, and updates.
                  </p>
                </div>
              </div>
            </section>
          )}

          {isLoading && (
            <section aria-label="Loading progress" className="flex flex-col items-center gap-3 py-12">
              <Spinner size="lg" />
              <p className="text-sm font-medium text-gray-400 animate-pulse">
                Fetching weather data...
              </p>
            </section>
          )}

          {error && !isLoading && (
            <section aria-label="Error message" className="w-full animate-fade-in">
              <ErrorMessage message={error} onDismiss={clearError} />
            </section>
          )}

          {weather && !isLoading && !error && (
            <section
              aria-label="Weather results"
              className="w-full animate-fade-in"
              aria-busy={isLoading}
            >
              <WeatherCard data={weather} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
