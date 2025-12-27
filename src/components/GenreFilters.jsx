import React from 'react'
import './GenreFilters.css'

const GenreFilters = ({ activeGenre, onGenreChange }) => {
  const genres = ['All', 'Action', 'Comedy', 'DC', 'Disney', 'Drama', 'Family', 'Horror', 'Marvel', 'Romance']

  return (
    <div className="genre-filters">
      {genres.map((genre) => (
        <button
          key={genre}
          className={`genre-btn ${activeGenre === genre ? 'active' : ''}`}
          onClick={() => onGenreChange(genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  )
}

export default GenreFilters

