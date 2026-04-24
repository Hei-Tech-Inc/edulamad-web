'use client';

import { Check, Minus } from 'lucide-react';

type Cell = string | boolean;

type Row =
  | { kind: 'category'; title: string }
  | {
      kind: 'feature';
      feature: string;
      free: Cell;
      basic: Cell;
      pro: Cell;
    };

const ROWS: Row[] = [
  { kind: 'category', title: 'Content access' },
  {
    kind: 'feature',
    feature: 'Past questions',
    free: '3 total',
    basic: 'Unlimited',
    pro: 'Unlimited',
  },
  {
    kind: 'feature',
    feature: 'Universities covered',
    free: 'All',
    basic: 'All',
    pro: 'All',
  },
  {
    kind: 'feature',
    feature: 'Solutions & answers',
    free: false,
    basic: true,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'AI explanations',
    free: false,
    basic: true,
    pro: true,
  },
  { kind: 'category', title: 'Study tools' },
  {
    kind: 'feature',
    feature: 'Exam simulation',
    free: false,
    basic: true,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'Flashcard decks',
    free: false,
    basic: true,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'Performance analytics',
    free: false,
    basic: true,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'Mnemonics library',
    free: false,
    basic: true,
    pro: true,
  },
  { kind: 'category', title: 'AI features' },
  {
    kind: 'feature',
    feature: 'AI tutor discussion',
    free: false,
    basic: false,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'Slide summaries',
    free: false,
    basic: false,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'Question prediction',
    free: false,
    basic: false,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'Concept maps',
    free: false,
    basic: false,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'Daily AI requests',
    free: '0',
    basic: '20',
    pro: 'Unlimited',
  },
  { kind: 'category', title: 'Extras' },
  {
    kind: 'feature',
    feature: 'Exam countdown',
    free: false,
    basic: false,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'PDF downloads',
    free: false,
    basic: false,
    pro: true,
  },
  {
    kind: 'feature',
    feature: 'Early feature access',
    free: false,
    basic: false,
    pro: true,
  },
];

function CellView({ value }: { value: Cell }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check
        className="mx-auto h-4 w-4 text-emerald-700 dark:text-emerald-400"
        aria-label="Included"
      />
    ) : (
      <Minus className="mx-auto h-4 w-4 text-slate-400 dark:text-slate-500" aria-label="Not included" />
    );
  }
  return (
    <span className="font-medium text-slate-800 dark:text-slate-100">{value}</span>
  );
}

export function FeatureComparisonTable() {
  return (
    <div className="mt-14">
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
        Compare plans
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        See exactly what you stop losing when you leave the free limit behind.
      </p>

      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 md:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/90 dark:border-slate-700 dark:bg-slate-900">
              <th className="px-4 py-3 font-semibold text-slate-950 dark:text-white">
                Feature
              </th>
              <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                Free
              </th>
              <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                Basic
              </th>
              <th className="px-4 py-3 font-semibold text-orange-800 dark:text-orange-300">
                Pro
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) =>
              row.kind === 'category' ? (
                <tr
                  key={`cat-${row.title}`}
                  className="bg-slate-100 dark:bg-slate-800/80"
                >
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                  >
                    {row.title}
                  </td>
                </tr>
              ) : (
                <tr
                  key={`${row.feature}-${i}`}
                  className="border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CellView value={row.free} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CellView value={row.basic} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CellView value={row.pro} />
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-4 md:hidden">
        {ROWS.map((row, i) =>
          row.kind === 'category' ? (
            <p
              key={`m-cat-${row.title}`}
              className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400"
            >
              {row.title}
            </p>
          ) : (
            <details
              key={`m-${row.feature}-${i}`}
              className="rounded-xl border border-slate-200 bg-white open:shadow-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white">
                {row.feature}
              </summary>
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 px-4 py-3 text-xs dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Free
                  </p>
                  <div className="mt-1 flex justify-center">
                    <CellView value={row.free} />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Basic
                  </p>
                  <div className="mt-1 flex justify-center">
                    <CellView value={row.basic} />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-orange-700 dark:text-orange-400">
                    Pro
                  </p>
                  <div className="mt-1 flex justify-center">
                    <CellView value={row.pro} />
                  </div>
                </div>
              </div>
            </details>
          ),
        )}
      </div>
    </div>
  );
}
