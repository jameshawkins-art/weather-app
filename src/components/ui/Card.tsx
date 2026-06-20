import React from 'react';
import { cn } from '../../utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 transition-all duration-300',
        className,
      )}
    >
      {children}
    </div>
  );
}
