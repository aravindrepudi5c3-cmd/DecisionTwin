import React from 'react'
import './ManagerBackgroundVideo.css'

export const ManagerAnimatedBackground: React.FC = () => {
  return (
    <div className="manager-bg-root" aria-hidden="true" data-testid="manager-animated-background">
      <div className="manager-bg-star-field" />
      <div className="manager-bg-overlay" />
    </div>
  )
}
