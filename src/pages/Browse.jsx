import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPopularMovies, searchMovies, fetchPopularManga, searchManga } from '../services/api'
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
      
      if (activeType === 'manga') {
        // Load manga data
        if (activeGenre === 'All') {
          data = await fetchPopularManga(60)
        } else {
          data = await searchManga(activeGenre, 1, 60)
        }
      } else {
        // Load movies/TV/anime data
        if (activeGenre === 'All') {
          data = await fetchPopularMovies(60, activeType)
        } else {
          data = await searchMovies(activeGenre, 1, null, activeType)
        }
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
      let data
      if (activeType === 'manga') {
        data = await searchManga(searchQuery, 1, 50)
      } else {
        data = await searchMovies(searchQuery, 1, null, activeType)
      }
      
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
    
    // Extract ID from different sources
    let id = movie.imdbID
    
    // Handle different ID formats
    if (id && id.toString().startsWith('anilist_')) {
      navigate(`/movie/${id}`)
    } else if (id && !id.toString().startsWith('tmdb_') && !id.toString().startsWith('tvmaze_') && !id.toString().startsWith('kitsu_')) {
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
        <button 
          className={`tab ${activeType === 'manga' ? 'active' : ''}`}
          onClick={() => setActiveType('manga')}
        >
          Manga
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

