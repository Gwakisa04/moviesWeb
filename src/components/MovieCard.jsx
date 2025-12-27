import React, { useState } from 'react'
import './MovieCard.css'

const MovieCard = ({ movie, large = false }) => {
  const [imageError, setImageError] = useState(false)
  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null
  const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null
  const rottenTomatoes = movie.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={`movie-card ${large ? 'large' : ''}`}>
      <div className="movie-poster-container">
        {!imageError && poster ? (
          <img
            src={poster}
            alt={movie.Title}
            className="movie-poster"
            onError={handleImageError}
          />
        ) : (
          <div className="movie-poster-placeholder">
            <span className="placeholder-icon">🎬</span>
            <span className="placeholder-text">{movie.Title}</span>
          </div>
        )}
        <div className="movie-overlay">
          <button className="watch-btn">Watch</button>
        </div>
        {rating && (
          <div className="rating-badge">
            <span className="rating-icon">⭐</span>
            <span className="rating-value">{rating}</span>
          </div>
        )}
        {rottenTomatoes && (
          <div className="tomato-badge">
            <span className="tomato-icon">🍅</span>
            <span className="tomato-value">{rottenTomatoes}</span>
          </div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.Title}</h3>
        {movie.Year && <p className="movie-year">{movie.Year}</p>}
      </div>
    </div>
  )
}

export default MovieCard

