import React from 'react'
import './Profile.css'

const Profile = () => {
  // TODO: Implement user profile with backend
  const user = {
    name: 'Alex Johnson',
    username: '@alex12',
    stats: {
      movies: 12,
      shows: 35,
      episodes: 3
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name.charAt(0)}
        </div>
        <h1>{user.name}</h1>
        <p className="username">{user.username}</p>
      </div>

      <div className="watch-history">
        <h2>My watch history</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{user.stats.movies}</span>
            <span className="stat-label">Movies</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{user.stats.shows}</span>
            <span className="stat-label">Shows</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{user.stats.episodes}</span>
            <span className="stat-label">Episodes</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Main settings</h2>
        <div className="settings-list">
          <button className="setting-item">
            <span>Profile settings</span>
            <span>→</span>
          </button>
          <button className="setting-item">
            <span>Notifications</span>
            <span>→</span>
          </button>
          <button className="setting-item">
            <span>Audio subtitles</span>
            <span>→</span>
          </button>
          <button className="setting-item">
            <span>Appearance</span>
            <span>→</span>
          </button>
          <button className="setting-item">
            <span>Language</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile

