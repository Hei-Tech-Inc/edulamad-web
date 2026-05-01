'use client';

import { generateAssessmentLabel } from '@/lib/utils/academic-year';

interface AssessmentTypeSelectorProps {
  value: string;
  onChange: (type: string, number: number, label: string) => void;
  number?: number;
  customLabel?: string;
}

const ASSESSMENT_TYPES = [
  {
    value: 'interim_assessment',
    label: 'Midsem / Interim',
    desc: 'Mid-semester exam or assessment',
  },
  { value: 'class_quiz', label: 'Class Quiz', desc: 'Short in-class quiz' },
  { value: 'class_test', label: 'Class Test', desc: 'Longer in-class test' },
  { value: 'assignment', label: 'Assignment', desc: 'Take-home or project-based' },
];

export function AssessmentTypeSelector({
  value,
  onChange,
  number = 1,
  customLabel,
}: AssessmentTypeSelectorProps) {
  const preview = generateAssessmentLabel(value, number, customLabel);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1.5 block text-xs text-slate-600">Assessment type *</label>
        <div className="grid grid-cols-2 gap-2">
          {ASSESSMENT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value, number, customLabel ?? '')}
              className={`rounded-lg border px-3 py-2.5 text-left transition-all ${
                value === t.value
                  ? 'border-brand/40 bg-brand/15 text-brand'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              <p className="text-xs font-medium">{t.label}</p>
              <p className="mt-0.5 text-[10px] opacity-70">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-slate-600">Number *</label>
          <select
            value={number}
            onChange={(e) => onChange(value, Number.parseInt(e.target.value, 10), customLabel ?? '')}
            className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand/50 focus:outline-none"
          >
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-600">
            Custom label <span className="ml-1 text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            placeholder={`e.g. ${generateAssessmentLabel(value, number)}`}
            value={customLabel ?? ''}
            onChange={(e) => onChange(value, number, e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-xs text-slate-500">Preview:</span>
        <span className="text-xs font-medium text-brand">{preview}</span>
      </div>
    </div>
  );
}
