import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Camera, Clock, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { to: '/app',                   label: 'Dashboard',       icon: LayoutDashboard, end: true },
  { to: '/app/agenda',            label: 'Agenda',          icon: CalendarDays },
  { to: '/app/servicos',          label: 'Serviços',        icon: Camera },
  { to: '/app/disponibilidade',   label: 'Disponibilidade', icon: Clock },
]

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() { await signOut(); navigate('/') }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p className="sidebar-brand-name">Snapbook</p>
        <p className="sidebar-brand-sub">{profile?.display_name ?? '—'}</p>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/app/configuracoes"
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}>
          <Settings size={18} />
          Configurações
        </NavLink>
        <button className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent', marginTop: 4 }} onClick={handleSignOut}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}