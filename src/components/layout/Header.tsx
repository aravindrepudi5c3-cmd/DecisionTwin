import { Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { managerUser } = useAuth()
  return (
    <header className="topbar">
      <div className="mobile-brand">DecisionTwin</div>
      <div className="topbar-search">
        <Search size={18} />
        <input aria-label="Search workspace" placeholder="Search workspace" type="search" />
        <span className="search-shortcut">Ctrl K</span>
      </div>
      <div className="topbar-actions">
        <div className="topbar-context">
          <span>Workspace</span>
          <strong>{managerUser?.organizationName || 'Northstar Operations'}</strong>
        </div>
      </div>
    </header>
  )
}
