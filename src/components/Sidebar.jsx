import React from 'react'
import './Sidebar.css'

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <div className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🔥</span>
            <span>Trending</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⏰</span>
            <span>Coming Soon</span>
          </div>
          <div className="nav-item active-category">
            <span className="nav-icon">🔍</span>
            <span>Categories</span>
            <div className="active-indicator"></div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Your Activity</div>
          <div className="nav-item">
            <span className="nav-icon">🔄</span>
            <span>History</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🔖</span>
            <span>Saved</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">📚</span>
            <span>My Library</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⬇️</span>
            <span>Downloads</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Settings & Account</div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">👤</span>
            <span>Your Account</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Help & Information</div>
          <div className="nav-item">
            <span className="nav-icon">❓</span>
            <span>Help & Information</span>
          </div>
          <div className="nav-item logout">
            <span className="nav-icon">🚪</span>
            <span>Log Out</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>@2025 EVC</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

