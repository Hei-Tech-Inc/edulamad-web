import { Card, CardContent } from '../ui/card'

export default function SectionCard({ children, className = '', id }) {
  return (
    <Card
      id={id}
      className={`rounded-2xl border border-white/10 bg-[#111827]/95 text-slate-100 shadow-[0_14px_38px_rgba(0,0,0,0.32)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(0,0,0,0.4)] ${className}`}
    >
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}
