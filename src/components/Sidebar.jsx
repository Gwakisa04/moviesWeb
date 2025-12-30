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
            title="Home"
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </div>
          <div 
            className={`nav-item ${isActive('/browse') ? 'active' : ''}`}
            onClick={() => navigate('/browse')}
            title="Browse"
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-label">Browse</span>
          </div>
          <div 
            className={`nav-item ${isActive('/library') ? 'active' : ''}`}
            onClick={() => navigate('/library')}
            title="Library"
          >
            <span className="nav-icon">📚</span>
            <span className="nav-label">Library</span>
          </div>
          <div 
            className={`nav-item ${isActive('/manga') ? 'active' : ''}`}
            onClick={() => navigate('/manga')}
            title="Manga"
          >
            <span className="nav-icon">📖</span>
            <span className="nav-label">Manga</span>
          </div>
          <div 
            className={`nav-item ${isActive('/music') ? 'active' : ''}`}
            onClick={() => navigate('/music')}
            title="Music"
          >
            <span className="nav-icon">🎵</span>
            <span className="nav-label">Music</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>MG</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

