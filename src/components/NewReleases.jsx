import React from 'react'
import MovieCard from './MovieCard'
import './NewReleases.css'

const NewReleases = ({ movies, loading }) => {
  if (loading && movies.length === 0) {
    return (
      <div className="new-releases">
        <h2 className="section-title">New Releases</h2>
        <div className="new-releases-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-card large"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="new-releases">
      <h2 className="section-title">New Releases</h2>
      <div className="new-releases-grid">
        {movies.slice(0, 3).map((movie) => (
          <MovieCard key={movie.imdbID} movie={movie} large />
        ))}
      </div>
    </div>
  )
}

export default NewReleases

