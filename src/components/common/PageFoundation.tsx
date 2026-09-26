import type { LucideIcon } from 'lucide-react'

type PageFoundationProps = {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  message: string
}

export function PageFoundation({ eyebrow, title, description, icon: Icon, message }: PageFoundationProps) {
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <section className="foundation-panel" aria-label={`${title} foundation`}>
        <div>
          <Icon size={30} strokeWidth={1.6} />
          <h2>{message}</h2>
          <p>This workspace is ready for its connected data and decision workflow.</p>
        </div>
      </section>
    </div>
  )
}
