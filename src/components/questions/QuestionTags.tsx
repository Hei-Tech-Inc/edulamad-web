import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAddTag, useQuestionTags } from '@/hooks/tags/useTags';
import { tagsApi } from '@/lib/api/tags.api';

type Props = {
  questionId: string;
  editable?: boolean;
};

export function QuestionTags({ questionId, editable = false }: Props) {
  const { data: tags, isLoading } = useQuestionTags(questionId);
  const { mutate: addTag } = useAddTag(questionId);
  const [showInput, setShowInput] = useState(false);

  if (isLoading) {
    return <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {(tags ?? []).map((tag) => (
        <span
          key={tag._id}
          className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"
        >
          {tag.name}
        </span>
      ))}

      {editable && !showInput ? (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-500 hover:border-orange-300 hover:text-orange-700"
        >
          + tag
        </button>
      ) : null}

      {editable && showInput ? (
        <TagAutocomplete
          onSubmit={(name) => {
            addTag(name);
            setShowInput(false);
          }}
          onCancel={() => setShowInput(false)}
        />
      ) : null}
    </div>
  );
}

function TagAutocomplete({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState('');
  const { data: suggestions } = useQuery({
    queryKey: ['tags', 'search', query] as const,
    queryFn: ({ signal }) => tagsApi.search(query, undefined, signal),
    enabled: query.length >= 2,
  });

  return (
    <div className="relative">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.trim()) onSubmit(query.trim());
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Add tag..."
        className="h-7 w-28 rounded-full border border-orange-300 bg-white px-2 text-xs text-slate-900 outline-none"
      />
      {suggestions && suggestions.length > 0 ? (
        <div className="absolute left-0 top-8 z-20 min-w-[170px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
          {suggestions.map((s) => (
            <button
              key={s._id}
              type="button"
              onClick={() => onSubmit(s.name)}
              className="block w-full px-3 py-2 text-left text-xs text-slate-800 hover:bg-slate-50"
            >
              {s.name}
              <span className="ml-2 text-slate-400">{s.usageCount ?? 0} uses</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
