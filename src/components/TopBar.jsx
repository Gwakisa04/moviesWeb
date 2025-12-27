import React from 'react'
import './TopBar.css'

const TopBar = ({ searchQuery, onSearchChange, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="logo">
          <div className="logo-icon">
            <div className="atom-icon">
              <div className="atom-core"></div>
              <div className="atom-ring ring1"></div>
              <div className="atom-ring ring2"></div>
              <div className="atom-ring ring3"></div>
            </div>
          </div>
          <div className="logo-text">
            <div className="logo-main">EVC</div>
            <div className="logo-sub">E-Video Cloud</div>
          </div>
        </div>
      </div>

      <div className="top-bar-center">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button type="submit" className="search-icon-btn">
            <span className="search-icon">🔍</span>
          </button>
          <button type="button" className="mic-icon-btn">
            <span className="mic-icon">🎤</span>
          </button>
        </form>
      </div>

      <div className="top-bar-right">
        <div className="icon-btn">
          <span className="icon">🔔</span>
        </div>
        <div className="icon-btn">
          <span className="icon">🔖</span>
        </div>
        <div className="icon-btn">
          <span className="icon">🕐</span>
        </div>
        <div className="profile-pic">
          <div className="profile-avatar">👤</div>
        </div>
      </div>
    </div>
  )
}

export default TopBar

