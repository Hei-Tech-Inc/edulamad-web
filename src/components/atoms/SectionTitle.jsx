export default function SectionTitle({
  title,
  description,
  titleClassName = 'text-2xl font-semibold text-slate-900',
  descriptionClassName = 'mt-1 text-sm text-slate-600',
}) {
  return (
    <div>
      <h2 className={titleClassName}>{title}</h2>
      {description ? <p className={descriptionClassName}>{description}</p> : null}
    </div>
  )
}
