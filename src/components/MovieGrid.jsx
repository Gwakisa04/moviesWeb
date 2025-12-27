import React from 'react'
import MovieCard from './MovieCard'
import './MovieGrid.css'

const MovieGrid = ({ movies, loading }) => {
  if (loading && movies.length === 0) {
    return (
      <div className="movie-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-card"></div>
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="no-movies">
        <p>No movies found. Try a different search or genre.</p>
      </div>
    )
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.imdbID} movie={movie} />
      ))}
    </div>
  )
}

export default MovieGrid

