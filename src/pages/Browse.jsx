import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPopularMovies, searchMovies } from '../services/api'
import MovieCard from '../components/MovieCard'
import './Browse.css'

const Browse = () => {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')
  const [activeType, setActiveType] = useState('movie')
  const [loading, setLoading] = useState(true)

  const genres = ['All', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 
                  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Musical', 
                  'Mystery', 'Romance', 'Science Fiction', 'Sport', 'Thriller', 'War', 'Western']

  useEffect(() => {
    loadMovies()
  }, [activeGenre, activeType])

  const loadMovies = async () => {
    try {
      setLoading(true)
      let data
      if (activeGenre === 'All') {
        data = await fetchPopularMovies(50, activeType)
      } else {
        data = await searchMovies(activeGenre, 1, null, activeType)
      }
      
      if (data?.Search) {
        setMovies(data.Search)
      }
    } catch (error) {
      console.error('Error loading movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadMovies()
      return
    }

    try {
      setLoading(true)
      const data = await searchMovies(searchQuery, 1, null, activeType)
      if (data?.Search) {
        setMovies(data.Search)
      } else {
        setMovies([])
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMovieClick = (movie) => {
    // Extract IMDb ID from different sources
    let imdbId = movie.imdbID
    if (!imdbId || imdbId.startsWith('tmdb_') || imdbId.startsWith('tvmaze_')) {
      // Try to get from other fields
      imdbId = movie.imdbID || movie.watchmode_imdb_id
    }
    if (imdbId && !imdbId.startsWith('tmdb_') && !imdbId.startsWith('tvmaze_')) {
      navigate(`/movie/${imdbId}`)
    }
  }

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1>Browse</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Q Films, serials, actors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>
      </div>

      <div className="browse-tabs">
        <button 
          className={`tab ${activeType === 'movie' ? 'active' : ''}`}
          onClick={() => setActiveType('movie')}
        >
          Movies
        </button>
        <button 
          className={`tab ${activeType === 'series' ? 'active' : ''}`}
          onClick={() => setActiveType('series')}
        >
          TV Series
        </button>
        <button 
          className={`tab ${activeType === 'anime' ? 'active' : ''}`}
          onClick={() => setActiveType('anime')}
        >
          Anime
        </button>
      </div>

      <div className="top-films-section">
        <div className="top-film-card" onClick={() => navigate('/browse?type=top250')}>
          <h2>TOP 250 BEST FILMS</h2>
        </div>
        <div className="top-film-card" onClick={() => navigate('/browse?type=popular')}>
          <h2>TOP 100 POPULAR FILMS</h2>
        </div>
      </div>

      <div className="genres-section">
        <h3>Genres</h3>
        <div className="genres-grid">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-button ${activeGenre === genre ? 'active' : ''}`}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="movies-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : movies.length > 0 ? (
          <div className="movies-grid">
            {movies.map((movie, index) => (
              <div key={index} onClick={() => handleMovieClick(movie)}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No movies found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Browse

