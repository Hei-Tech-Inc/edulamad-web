'use client';

import { useState } from 'react';
import {
  generateAcademicYears,
  isValidAcademicYear,
} from '@/lib/utils/academic-year';

interface AcademicYearInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  useDropdown?: boolean;
}

export function AcademicYearInput({
  value,
  onChange,
  error,
  useDropdown = true,
}: AcademicYearInputProps) {
  const years = generateAcademicYears(10);
  const [localError, setLocalError] = useState('');

  if (useDropdown) {
    return (
      <div>
        <label className="mb-1 block text-xs text-slate-600">Academic year *</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand/50 focus:outline-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-slate-500">
          Format: 2024/2025 (start year / end year)
        </p>
        {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      </div>
    );
  }

  const shownError = error || localError;

  return (
    <div>
      <label className="mb-1 block text-xs text-slate-600">Academic year *</label>
      <input
        type="text"
        placeholder="2024/2025"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v);
          if (v.length >= 9) {
            setLocalError(isValidAcademicYear(v) ? '' : 'Must be format YYYY/YYYY e.g. 2024/2025');
          } else {
            setLocalError('');
          }
        }}
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand/50 focus:outline-none ${
          shownError ? 'border-danger/50' : 'border-slate-300'
        }`}
      />
      {shownError ? <p className="mt-1 text-xs text-danger">{shownError}</p> : null}
    </div>
  );
}
