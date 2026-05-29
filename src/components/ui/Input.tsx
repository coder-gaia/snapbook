import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:  string
  error?:  string
  hint?:   string
  mono?:   boolean
  suffix?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, mono, suffix, className = '', required, ...props
}, ref) => (
  <div className="form-group">
    {label && (
      <label className={`form-label ${required ? 'form-label--required' : ''}`}>{label}</label>
    )}
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        ref={ref}
        className={['form-input', mono ? 'form-input--mono' : '', error ? 'form-input--error' : '', className].join(' ')}
        required={required}
        {...props}
      />
      {suffix}
    </div>
    {error && <span className="form-error">{error}</span>}
    {hint && !error && <span className="form-hint">{hint}</span>}
  </div>
))
Input.displayName = 'Input'