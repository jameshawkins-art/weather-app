import React from 'react';

export interface DataDiagnosticsProps {
  dataSource: 'network' | 'cache' | 'pwa-cache' | null;
  cachedAt: number | null;
  ttlRemaining: number | null;
  revalidationError: string | null;
  isOffline: boolean;
  isPWAActive: boolean;
}

export const DataDiagnostics: React.FC<DataDiagnosticsProps> = ({
  dataSource,
  cachedAt,
  ttlRemaining,
  revalidationError,
  isOffline,
  isPWAActive,
}) => {
  if (!dataSource) return null;

  const formatTtl = (ms: number | null): string => {
    if (ms === null) return 'N/A';
    if (ms <= 0) return 'Expired';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatTime = (timestamp: number | null): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const totalTtl = 15 * 60 * 1000;
  const remainingPercent =
    ttlRemaining !== null ? Math.min(100, Math.max(0, (ttlRemaining / totalTtl) * 100)) : 0;

  const getTtlBarColor = (percent: number) => {
    if (percent > 50) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    if (percent > 10) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
    return 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse';
  };

  return (
    <div
      className="w-full bg-slate-900/45 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-2xl animate-fade-in flex flex-col gap-4 transition-all duration-300 hover:border-white/15"
      role="region"
      aria-label="Data loading and cache diagnostics"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
          <span className="text-sm font-bold text-gray-300 tracking-wide uppercase">
            Data Diagnostics
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isOffline
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-ping'
                }`}
            />
            {isOffline ? 'Offline' : 'Online'}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isPWAActive
                ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
              }`}
            title={isPWAActive ? 'Controlled by a registered Service Worker' : 'Service Worker not controlling page'}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            PWA {isPWAActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Data Source</span>
          <div className="flex items-center gap-2">
            {dataSource === 'network' && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-300 font-semibold text-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Live API Response
              </div>
            )}
            {dataSource === 'cache' && (
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-blue-300 font-semibold text-sm">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
                Local Cache (Hydrated)
              </div>
            )}
            {dataSource === 'pwa-cache' && (
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl text-purple-300 font-semibold text-sm">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                PWA SW Offline Cache
              </div>
            )}
          </div>
        </div>

        {cachedAt && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium">Cache Ingestion Time</span>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-200 mt-1">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatTime(cachedAt)}</span>
              <span className="text-gray-500 font-normal">({new Date(cachedAt).toLocaleDateString()})</span>
            </div>
          </div>
        )}
      </div>

      {cachedAt && ttlRemaining !== null && (
        <div className="flex flex-col gap-2 bg-slate-950/30 border border-white/5 rounded-2xl p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              ⌛ Cache TTL (15m Limit)
            </span>
            <span
              className={`font-mono px-2 py-0.5 rounded-md ${ttlRemaining <= 0
                  ? 'bg-rose-500/10 text-rose-400'
                  : ttlRemaining < 60000
                    ? 'bg-amber-500/10 text-amber-400 animate-pulse'
                    : 'bg-slate-900 text-blue-400'
                }`}
            >
              {formatTtl(ttlRemaining)}
            </span>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${getTtlBarColor(
                remainingPercent
              )}`}
              style={{ width: `${remainingPercent}%` }}
            />
          </div>
        </div>
      )}

      {revalidationError && (
        <div
          className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-3.5 flex items-start gap-2.5 animate-fade-in shadow-inner"
          role="alert"
        >
          <span className="text-rose-400 text-lg mt-0.5" aria-hidden="true">
            ⚠️
          </span>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-rose-300">
              Background Sync Failed
            </span>
            <p className="text-rose-200/90 leading-relaxed font-mono bg-rose-950/20 border border-rose-500/10 rounded-lg p-2 mt-1 select-all break-words">
              {revalidationError}
            </p>
            <p className="text-[10px] text-rose-400/80 leading-normal mt-1">
              Offline fallback or invalid API credential simulated. Displaying stale Local Cache to keep app functional.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
