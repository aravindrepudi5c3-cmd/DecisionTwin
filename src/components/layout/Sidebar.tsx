import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Network,
  Settings2,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { NavLink, useNavigate } from 'react-router-dom'

type NavigationItem = {
  label: string
  to: string
  icon: LucideIcon
}

const workspaceNavigation: NavigationItem[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: BriefcaseBusiness },
  { label: 'Employees', to: '/employees', icon: Users },
]

const decisionNavigation: NavigationItem[] = [
  { label: 'Skill matching', to: '/skill-matching', icon: Sparkles },
  { label: 'Team builder', to: '/team-builder', icon: Network },
  { label: 'Scenario simulator', to: '/simulator', icon: Workflow },
  { label: 'Insights', to: '/insights', icon: BarChart3 },
]

function NavigationGroup({ items }: { items: NavigationItem[] }) {
  return (
    <nav className="sidebar-nav">
      {items.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          to={to}
        >
          <Icon size={18} strokeWidth={1.8} />
          <span>{label}</span>
          <ChevronRight className="nav-chevron" size={15} />
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">D</div>
        <div>
          <strong>DecisionTwin</strong>
          <span>Decision intelligence</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-label">Workspace</p>
        <NavigationGroup items={workspaceNavigation} />
      </div>
      <div className="sidebar-section">
        <p className="sidebar-label">Decision tools</p>
        <NavigationGroup items={decisionNavigation} />
      </div>

      <div className="sidebar-spacer" />
      <div className="sidebar-footer">
        <NavLink className="nav-item" to="/notifications">
          <Bell size={18} strokeWidth={1.8} />
          <span>Notifications</span>
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? 'nav-item active sidebar-settings' : 'nav-item sidebar-settings')} to="/settings">
          <Settings2 size={18} strokeWidth={1.8} />
          <span>Workspace settings</span>
        </NavLink>
        <div className="profile-chip" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar">
              {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'AM'}
            </div>
            <div>
              <strong>{user?.fullName || 'Account manager'}</strong>
              <span>{user?.role === 'manager' ? 'Manager Twin' : 'Workspace member'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of DecisionTwin"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-sidebar-muted, #9caaca)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
