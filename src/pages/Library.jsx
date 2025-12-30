import React from 'react'
import './Library.css'

const Library = () => {
  // TODO: Implement watchlist functionality with backend
  const watchlist = []
  const favoriteActors = []
  const collections = []

  return (
    <div className="library-page">
      <h1>Library</h1>
      
      <section className="library-section">
        <h2>Watchlist</h2>
        {watchlist.length > 0 ? (
          <div className="movies-grid">
            {watchlist.map((movie, index) => (
              <div key={index} className="movie-item">
                {/* Movie cards will be rendered here */}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">Your watchlist is empty</p>
        )}
      </section>

      <section className="library-section">
        <h2>Favorite Actors</h2>
        {favoriteActors.length > 0 ? (
          <div className="actors-grid">
            {favoriteActors.map((actor, index) => (
              <div key={index} className="actor-item">
                <div className="actor-avatar">{actor.charAt(0)}</div>
                <span>{actor}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No favorite actors yet</p>
        )}
      </section>

      <section className="library-section">
        <h2>My Collections</h2>
        {collections.length > 0 ? (
          <div className="collections-grid">
            {collections.map((collection, index) => (
              <div key={index} className="collection-card">
                <h3>{collection.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No collections yet</p>
        )}
      </section>
    </div>
  )
}

export default Library

