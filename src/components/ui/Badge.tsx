type BadgeVariant = 'success' | 'warning' | 'danger' | 'gold' | 'gray'
interface BadgeProps { variant: BadgeVariant; children: React.ReactNode }
export function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}