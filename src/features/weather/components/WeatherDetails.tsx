import React from 'react';
import { Card } from '../../../components/ui';

export interface WeatherDetailsProps {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
}

export function WeatherDetails({ label, value, unit, icon }: WeatherDetailsProps) {
  return (
    <Card className="p-4 flex items-center gap-4 hover:bg-white/10 transition-colors duration-200">
      <div className="text-blue-400 shrink-0 bg-white/5 p-2 rounded-xl border border-white/5">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-lg font-bold text-white mt-0.5 truncate">
          {value}
          <span className="text-sm font-medium text-gray-300 ml-0.5">{unit}</span>
        </span>
      </div>
    </Card>
  );
}
