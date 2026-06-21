export interface ErrorMessageProps {
  message: string | Error | unknown;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  let displayMessage = 'An unexpected error occurred.';

  if (typeof message === 'string') {
    displayMessage = message;
  } else if (message instanceof Error) {
    displayMessage = message.message;
  } else if (message && typeof message === 'object') {
    displayMessage = (message as any).message || (message as any).info || 'An unexpected error occurred.';
  } else if (message !== null && message !== undefined) {
    displayMessage = String(message);
  }

  if (displayMessage.includes('Stack trace:') || displayMessage.includes('at ') || displayMessage.includes('\n')) {
    displayMessage = displayMessage.split('\n')[0];
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm backdrop-blur-sm transition-all duration-200"
    >
      <div className="text-red-400 mt-0.5 shrink-0">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="flex-1 leading-normal font-medium">{displayMessage}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition-colors duration-150 p-0.5 rounded-lg hover:bg-white/5 shrink-0 cursor-pointer"
          aria-label="Dismiss error"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
