import { type HTMLAttributes, type ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?:    string
  elevated?: boolean
  gold?:     boolean
  children:  ReactNode
}

export function Card({ title, elevated, gold, children, className = '', ...props }: CardProps) {
  return (
    <div className={['card', elevated ? 'card--elevated' : '', gold ? 'card--gold' : '', className].join(' ')} {...props}>
      {title && <p className="card-title">{title}</p>}
      {children}
    </div>
  )
}