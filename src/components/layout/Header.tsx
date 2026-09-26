import { Search } from 'lucide-react'

export function Header() {
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
          <strong>Northstar Operations</strong>
        </div>
      </div>
    </header>
  )
}
