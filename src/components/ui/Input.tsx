import {
  type InputHTMLAttributes,
  forwardRef,
  type ReactNode,
  useState,
} from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  mono?: boolean
  suffix?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      mono,
      suffix,
      className = '',
      required,
      type,
      ...props
    },
    ref
  ) => {
    const isPassword = type === 'password'
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="form-group">
        {label && (
          <label
            className={`form-label ${required ? 'form-label--required' : ''}`}
          >
            {label}
          </label>
        )}

        <div className="input-wrapper">
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={[
              'form-input',
              mono ? 'form-input--mono' : '',
              error ? 'form-input--error' : '',
              className,
            ].join(' ')}
            required={required}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : (
            suffix
          )}
        </div>
        {error && <span className="form-error">{error}</span>}
        {hint && !error && <span className="form-hint">{hint}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'