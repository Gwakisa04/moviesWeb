import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <div 
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </div>
          <div 
            className={`nav-item ${isActive('/browse') ? 'active' : ''}`}
            onClick={() => navigate('/browse')}
          >
            <span className="nav-icon">🔍</span>
            <span>Browse</span>
          </div>
          <div 
            className={`nav-item ${isActive('/library') ? 'active' : ''}`}
            onClick={() => navigate('/library')}
          >
            <span className="nav-icon">📚</span>
            <span>Library</span>
          </div>
          <div 
            className={`nav-item ${isActive('/manga') ? 'active' : ''}`}
            onClick={() => navigate('/manga')}
          >
            <span className="nav-icon">📖</span>
            <span>Manga</span>
          </div>
          <div 
            className={`nav-item ${isActive('/music') ? 'active' : ''}`}
            onClick={() => navigate('/music')}
          >
            <span className="nav-icon">🎵</span>
            <span>Music</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>@2025 MovieGo</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

