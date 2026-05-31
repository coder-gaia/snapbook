import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
  full?:    boolean
  icon?:    ReactNode
}

export function Button({
  variant = 'primary', size = 'md', loading = false,
  full = false, icon, children, disabled, className = '', ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'btn', `btn--${variant}`,
        size !== 'md' ? `btn--${size}` : '',
        full ? 'btn--full' : '', className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  )
}