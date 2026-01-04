import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MovieCard.css'

const MovieCard = ({ movie, large = false, onClick }) => {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null
  // Get rating from multiple possible sources
  const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 
                 movie.tmdb_vote_average ? movie.tmdb_vote_average.toFixed(1) :
                 movie.Ratings && movie.Ratings.length > 0 && movie.Ratings[0].Value ? movie.Ratings[0].Value :
                 movie.rating ? movie.rating :
                 null

  const handleImageError = () => {
    setImageError(true)
  }

  const handleClick = (e) => {
    e.stopPropagation() // Prevent parent onClick from firing
    
    if (onClick) {
      onClick(movie)
    } else {
      // Default click handler - navigate to movie detail
      if (!movie) return
      
      // Handle Gutenberg books
      if (movie.source === 'gutenberg' && movie.gutenberg_id) {
        navigate(`/book/${movie.gutenberg_id}`)
        return
      }
      
      // Handle AniList IDs
      if (movie.anilist_id) {
        navigate(`/movie/anilist_${movie.anilist_id}`)
        return
      }
      
      let id = movie.imdbID
      
      // Handle different ID formats
      if (id && id.toString().startsWith('anilist_')) {
        navigate(`/movie/${id}`)
      } else if (id && !id.toString().startsWith('tmdb_') && !id.toString().startsWith('tvmaze_') && !id.toString().startsWith('kitsu_') && !id.toString().startsWith('gutenberg_')) {
        // Regular IMDb ID or other valid ID
        navigate(`/movie/${id}`)
      } else if (movie.tmdb_id) {
        navigate(`/movie/tmdb_${movie.tmdb_id}`)
      } else if (movie.tvmaze_id) {
        navigate(`/movie/tvmaze_${movie.tvmaze_id}`)
      } else if (movie.kitsu_id) {
        navigate(`/movie/kitsu_${movie.kitsu_id}`)
      } else if (id) {
        // Fallback: try with whatever ID we have
        navigate(`/movie/${id}`)
      }
    }
  }

  return (
    <div className={`movie-card ${large ? 'large' : ''}`} onClick={handleClick} style={{ cursor: 'pointer' }}>
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

