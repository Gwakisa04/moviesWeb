import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import MovieGrid from './components/MovieGrid'
import NewReleases from './components/NewReleases'
import GenreFilters from './components/GenreFilters'
import ContentTabs from './components/ContentTabs'
import { fetchPopularMovies, fetchNewReleases, searchMovies } from './services/api'
import './App.css'

function App() {
  const [movies, setMovies] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Movies')
  const [activeGenre, setActiveGenre] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery)
    } else {
      loadMoviesByGenre()
    }
  }, [activeGenre, activeTab, searchQuery])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [popularData, newReleasesData] = await Promise.all([
        fetchPopularMovies(20),
        fetchNewReleases(6)
      ])
      
      if (popularData?.Search) {
        setMovies(popularData.Search)
      }
      if (newReleasesData?.Search) {
        setNewReleases(newReleasesData.Search)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoviesByGenre = async () => {
    if (activeGenre === 'All') {
      try {
        const data = await fetchPopularMovies(20)
        if (data?.Search) {
          setMovies(data.Search)
        }
      } catch (error) {
        console.error('Error loading movies:', error)
      }
    } else {
      try {
        const data = await searchMovies(activeGenre, 1)
        if (data?.Search) {
          setMovies(data.Search)
        } else {
          setMovies([])
        }
      } catch (error) {
        console.error('Error loading genre movies:', error)
        setMovies([])
      }
    }
  }

  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadMoviesByGenre()
      return
    }

    try {
      setLoading(true)
      const data = await searchMovies(query, 1)
      if (data?.Search) {
        setMovies(data.Search)
      } else {
        setMovies([])
      }
    } catch (error) {
      console.error('Error searching movies:', error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <TopBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />
        <div className="content-area">
          <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <NewReleases movies={newReleases} loading={loading} />
          <GenreFilters 
            activeGenre={activeGenre} 
            onGenreChange={setActiveGenre} 
          />
          <MovieGrid movies={movies} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default App

