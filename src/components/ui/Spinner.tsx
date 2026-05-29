interface SpinnerProps { size?: 'lg' }
export function Spinner({ size }: SpinnerProps) {
  return <div className={`spinner ${size ? `spinner--${size}` : ''}`} />
}