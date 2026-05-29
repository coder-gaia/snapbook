import { useLocation } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/app':                  'Dashboard',
  '/app/agenda':           'Agenda',
  '/app/servicos':         'Serviços',
  '/app/disponibilidade':  'Disponibilidade',
  '/app/configuracoes':    'Configurações',
}

export function Header() {
  const { pathname } = useLocation()
  return (
    <header className="mobile-header">
      <span className="mobile-header-brand">Snapbook</span>
      <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
        {TITLES[pathname] ?? ''}
      </span>
    </header>
  )
}