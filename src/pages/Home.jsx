import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPopularMovies, fetchNewReleases, fetchPopularManga } from '../services/api'
import MovieCard from '../components/MovieCard'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()
  const [trendingMovies, setTrendingMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'Manga') {
        // Load manga data
        const mangaData = await fetchPopularManga(20)
        if (mangaData?.Search) {
          setPopularMovies(mangaData.Search)
          setTrendingMovies(mangaData.Search.slice(0, 5))
        }
        setNewReleases([])
      } else {
        const type = activeTab === 'Movies' ? 'movie' : 
                     activeTab === 'TV shows' ? 'series' : 
                     activeTab === 'Anime' ? 'anime' : null

        const [popularData, newReleasesData] = await Promise.all([
          fetchPopularMovies(20, type),
          fetchNewReleases(6, type)
        ])

        if (popularData?.Search) {
          setPopularMovies(popularData.Search)
          setTrendingMovies(popularData.Search.slice(0, 5))
        }
        if (newReleasesData?.Search) {
          setNewReleases(newReleasesData.Search)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMovieClick = (movie) => {
    // Extract ID from different sources
    let id = movie.imdbID
    if (!id || id.startsWith('tmdb_') || id.startsWith('tvmaze_')) {
      // Try to get from other fields
      id = movie.imdbID || movie.watchmode_imdb_id || movie.anilist_id
    }
    
    // Handle AniList IDs
    if (id && id.toString().startsWith('anilist_')) {
      navigate(`/movie/${id}`)
    } else if (id && !id.toString().startsWith('tmdb_') && !id.toString().startsWith('tvmaze_')) {
      navigate(`/movie/${id}`)
    } else if (movie.anilist_id) {
      navigate(`/movie/anilist_${movie.anilist_id}`)
    }
  }

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">MovieGo</div>
            <span className="no-ads-badge">No Ads</span>
          </div>
          <button className="notification-btn">🔔</button>
        </div>
        
        {/* Tabs */}
        <div className="content-tabs">
          {['All', 'Trending', 'Movies', 'TV shows', 'Anime', 'Manga'].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="home-content">
        {/* Featured Banner */}
        {trendingMovies.length > 0 && (
          <div className="featured-banner" onClick={() => handleMovieClick(trendingMovies[0])}>
            <div className="banner-backdrop" style={{
              backgroundImage: trendingMovies[0].Poster && trendingMovies[0].Poster !== 'N/A' 
                ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${trendingMovies[0].Poster})`
                : 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))'
            }}>
              <div className="banner-content">
                <h2 className="banner-title">{trendingMovies[0].Title}</h2>
                <p className="banner-tagline">Revenge is just the beginning</p>
                <button 
                  className="banner-play-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMovieClick(trendingMovies[0])
                  }}
                >
                  ▶ Play
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Releases */}
        {newReleases.length > 0 && (
          <section className="section">
            <h3 className="section-title">New Releases</h3>
            <div className="movies-scroll">
              {newReleases.map((movie, index) => (
                <div key={index} onClick={() => handleMovieClick(movie)}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular */}
        {popularMovies.length > 0 && (
          <section className="section">
            <h3 className="section-title">Popular</h3>
            <div className="movies-grid">
              {popularMovies.map((movie, index) => (
                <div key={index} onClick={() => handleMovieClick(movie)}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home

