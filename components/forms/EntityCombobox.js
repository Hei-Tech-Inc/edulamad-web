import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Loader2, Search } from 'lucide-react'

function defaultFilter(options, term) {
  const q = term.trim().toLowerCase()
  if (!q) return options
  return options.filter((opt) => {
    const hay = `${opt.name} ${opt.code || ''}`.toLowerCase()
    return hay.includes(q)
  })
}

export default function EntityCombobox({
  id,
  label,
  placeholder,
  value,
  options,
  search,
  onSearchChange,
  onSelect,
  disabled = false,
  loading = false,
  emptyLabel,
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef(null)

  const filtered = useMemo(() => defaultFilter(options || [], search || ''), [options, search])

  useEffect(() => {
    const onDocClick = (evt) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(evt.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const handleSelect = (item) => {
    onSelect(item)
    onSearchChange(item.name)
    setOpen(false)
    setActiveIndex(-1)
  }

  const onKeyDown = (evt) => {
    if (!open && (evt.key === 'ArrowDown' || evt.key === 'ArrowUp')) {
      setOpen(true)
      setActiveIndex(0)
      return
    }
    if (!open) return
    if (evt.key === 'ArrowDown') {
      evt.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
      return
    }
    if (evt.key === 'ArrowUp') {
      evt.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (evt.key === 'Enter') {
      if (activeIndex >= 0 && filtered[activeIndex]) {
        evt.preventDefault()
        handleSelect(filtered[activeIndex])
      }
      return
    }
    if (evt.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <label className="flex flex-col gap-1" ref={rootRef}>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          value={search}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onSearchChange(e.target.value)
            setOpen(true)
            setActiveIndex(0)
          }}
          onKeyDown={onKeyDown}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-50 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
        />
        {loading ? (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        ) : (
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        {open ? (
          <div
            id={`${id}-listbox`}
            role="listbox"
            className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-neutral-700 dark:bg-neutral-900"
          >
            {loading ? (
              <p className="px-2 py-2 text-xs text-slate-500 dark:text-slate-400">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-2 text-xs text-slate-500 dark:text-slate-400">
                {emptyLabel || `No results for "${search}" - try a different spelling`}
              </p>
            ) : (
              filtered.map((opt, idx) => {
                const active = idx === activeIndex
                const selected = value && value.id === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(opt)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm ${
                      active
                        ? 'bg-orange-50 text-orange-800 dark:bg-orange-900/25 dark:text-orange-200'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>{opt.code ? `${opt.code} - ${opt.name}` : opt.name}</span>
                    {selected ? <Check className="h-4 w-4 text-orange-500" /> : null}
                  </button>
                )
              })
            )}
          </div>
        ) : null}
      </div>
    </label>
  )
}
