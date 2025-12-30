import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPopularActors, getActorDetails, searchActors } from '../services/api'
import './Library.css'

const Library = () => {
  const navigate = useNavigate()
  const [watchlist, setWatchlist] = useState([])
  const [actors, setActors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [selectedActor, setSelectedActor] = useState(null)
  const [showActorDetail, setShowActorDetail] = useState(false)

  useEffect(() => {
    if (!searchQuery) {
      loadActors()
    }
  }, [searchQuery])

  const loadActors = async () => {
    try {
      setLoading(true)
      const data = await getPopularActors(1)
      if (data?.results) {
        setActors(data.results.slice(0, 20))
      }
    } catch (error) {
      console.error('Error loading actors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadActors()
      return
    }

    try {
      setSearching(true)
      const data = await searchActors(searchQuery, 1)
      if (data?.results) {
        setActors(data.results)
      } else {
        setActors([])
      }
    } catch (error) {
      console.error('Error searching actors:', error)
      setActors([])
    } finally {
      setSearching(false)
    }
  }

  const handleActorClick = async (actor) => {
    try {
      const details = await getActorDetails(actor.id)
      setSelectedActor(details)
      setShowActorDetail(true)
    } catch (error) {
      console.error('Error loading actor details:', error)
    }
  }

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
        <div className="section-header">
          <h2>Actors</h2>
          <form className="actor-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="actor-search-input"
            />
            <button type="submit" className="actor-search-btn">
              {searching ? '...' : '🔍'}
            </button>
          </form>
        </div>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : actors.length > 0 ? (
          <div className="actors-grid">
            {actors.map((actor, index) => (
              <div 
                key={index} 
                className="actor-item" 
                onClick={() => handleActorClick(actor)}
              >
                {actor.profile_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                    alt={actor.name}
                    className="actor-image"
                  />
                ) : (
                  <div className="actor-avatar">{actor.name?.charAt(0) || '?'}</div>
                )}
                <div className="actor-info">
                  <span className="actor-name">{actor.name}</span>
                  {actor.known_for_department && (
                    <span className="actor-department">{actor.known_for_department}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No actors found. {searchQuery ? 'Try a different search.' : 'Loading...'}</p>
        )}
      </section>

      <section className="library-section">
        <h2>My Collections</h2>
        <p className="empty-state">No collections yet</p>
      </section>

      <section className="library-section">
        <h2>Music Videos</h2>
        <div className="music-link-section">
          <p>Search and watch music videos from YouTube</p>
          <button 
            className="music-link-btn"
            onClick={() => navigate('/music')}
          >
            Go to Music Videos →
          </button>
        </div>
      </section>

      {/* Actor Detail Modal */}
      {showActorDetail && selectedActor && (
        <div className="actor-modal" onClick={() => setShowActorDetail(false)}>
          <div className="actor-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowActorDetail(false)}>×</button>
            <div className="actor-detail-header">
              {selectedActor.profile_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w300${selectedActor.profile_path}`} 
                  alt={selectedActor.name}
                  className="actor-detail-image"
                />
              ) : (
                <div className="actor-detail-avatar">{selectedActor.name?.charAt(0) || '?'}</div>
              )}
              <div className="actor-detail-info">
                <h2>{selectedActor.name}</h2>
                {selectedActor.biography && (
                  <p className="actor-biography">{selectedActor.biography}</p>
                )}
                {selectedActor.place_of_birth && (
                  <p className="actor-birthplace">📍 {selectedActor.place_of_birth}</p>
                )}
                {selectedActor.birthday && (
                  <p className="actor-birthday">🎂 {selectedActor.birthday}</p>
                )}
              </div>
            </div>
            {selectedActor.combined_credits?.cast && selectedActor.combined_credits.cast.length > 0 && (
              <div className="actor-filmography">
                <h3>Filmography</h3>
                <div className="filmography-grid">
                  {selectedActor.combined_credits.cast.slice(0, 12).map((credit, i) => (
                    <div key={i} className="filmography-item">
                      {credit.poster_path && (
                        <img 
                          src={`https://image.tmdb.org/t/p/w154${credit.poster_path}`} 
                          alt={credit.title || credit.name}
                        />
                      )}
                      <p>{credit.title || credit.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Library

