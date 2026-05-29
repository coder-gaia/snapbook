import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Camera, Clock } from 'lucide-react'

const NAV = [
  { to: '/app',                  label: 'Início',    icon: LayoutDashboard, end: true },
  { to: '/app/agenda',           label: 'Agenda',    icon: CalendarDays },
  { to: '/app/servicos',         label: 'Serviços',  icon: Camera },
  { to: '/app/disponibilidade',  label: 'Horários',  icon: Clock },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`}>
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}