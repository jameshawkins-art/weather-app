import { cn } from '../../utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-transparent border-white/80',
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label="Loading weather data"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
