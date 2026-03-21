import { Link } from 'react-router-dom'

interface EmptyStateProps {
  eyebrow: string
  title: string
  description: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel?: string
  secondaryTo?: string
}

export function EmptyState({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
}: EmptyStateProps) {
  return (
    <section className="surface-card empty-state">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="body-copy">{description}</p>
      <div className="action-row">
        <Link className="button button-primary" to={primaryTo}>
          {primaryLabel}
        </Link>
        {secondaryLabel && secondaryTo ? (
          <Link className="button button-secondary" to={secondaryTo}>
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
