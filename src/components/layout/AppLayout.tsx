import type { ReactNode } from 'react'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'
import { ManagerAnimatedBackground } from '../manager/ManagerBackgroundVideo.tsx'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <ManagerAnimatedBackground />
      <Sidebar />
      <div className="app-main">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  )
}
