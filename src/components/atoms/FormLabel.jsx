export default function FormLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-sm font-medium text-slate-600"
    >
      {children}
    </label>
  )
}
