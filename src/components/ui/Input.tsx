import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSubmit'> {
  onSubmit?: (value: string) => void;
  debounceTime?: number;
}

export function Input({
  onSubmit,
  className,
  placeholder,
  value: propValue,
  onChange,
  debounceTime = 300,
  ...props
}: InputProps) {
  const [value, setValue] = useState<string>(
    typeof propValue === 'string' ? propValue : ''
  );
  const [prevPropValue, setPrevPropValue] = useState<unknown>(propValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (propValue !== prevPropValue) {
    setPrevPropValue(propValue);
    if (typeof propValue === 'string') {
      setValue(propValue);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (onSubmit) {
        onSubmit(value);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (onChange) {
      timeoutRef.current = setTimeout(() => {
        onChange(e);
      }, debounceTime);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm',
          className,
        )}
        {...props}
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}
