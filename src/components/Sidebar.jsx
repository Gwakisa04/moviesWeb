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
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="nav-label">Home</span>
          </div>
          <div 
            className={`nav-item ${isActive('/browse') ? 'active' : ''}`}
            onClick={() => navigate('/browse')}
            title="Browse"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span className="nav-label">Browse</span>
          </div>
          <div 
            className={`nav-item ${isActive('/library') ? 'active' : ''}`}
            onClick={() => navigate('/library')}
            title="Library"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span className="nav-label">Library</span>
          </div>
          <div 
            className={`nav-item ${isActive('/manga') ? 'active' : ''}`}
            onClick={() => navigate('/manga')}
            title="Manga"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 0 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <line x1="8" y1="7" x2="16" y2="7"></line>
              <line x1="8" y1="11" x2="16" y2="11"></line>
            </svg>
            <span className="nav-label">Manga</span>
          </div>
          <div 
            className={`nav-item ${isActive('/music') ? 'active' : ''}`}
            onClick={() => navigate('/music')}
            title="Music"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
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

