import React, { useState } from 'react'
import './MovieCard.css'

const MovieCard = ({ movie, large = false }) => {
  const [imageError, setImageError] = useState(false)
  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null
  const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 
                 movie.tmdb_vote_average ? movie.tmdb_vote_average.toFixed(1) : null

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
          </div>
        )}
        {rating && (
          <div className="rating-badge">
            <span className="rating-value">{rating}</span>
          </div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.Title}</h3>
        {movie.Year && movie.Year !== 'N/A' && (
          <p className="movie-year">{movie.Year}</p>
        )}
      </div>
    </div>
  )
}

export default MovieCard

