import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  LayoutDashboard,
  Network,
  Settings2,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

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
        <div className="profile-chip">
          <div className="avatar">AM</div>
          <div>
            <strong>Account manager</strong>
            <span>Workspace member</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
