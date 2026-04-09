import { Input } from '../ui/input'

export default function TextField({
  id,
  value,
  onChange,
  disabled = false,
  placeholder,
  type = 'text',
}) {
  return (
    <Input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="h-10 rounded-md border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:border-teal-700 focus-visible:ring-1 focus-visible:ring-teal-600/30"
    />
  )
}
