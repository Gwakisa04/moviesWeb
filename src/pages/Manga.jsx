import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPopularManga, searchManga } from '../services/api'
import MovieCard from '../components/MovieCard'
import './Manga.css'

const Manga = () => {
  const navigate = useNavigate()
  const [manga, setManga] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadManga()
  }, [])

  const loadManga = async () => {
    try {
      setLoading(true)
      const data = await fetchPopularManga(200) // Increased to 200+
      if (data?.Search) {
        setManga(data.Search)
      }
    } catch (error) {
      console.error('Error loading manga:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadManga()
      return
    }

    try {
      setLoading(true)
      const data = await searchManga(searchQuery, 1, 200) // Increased to 200+
      if (data?.Search) {
        setManga(data.Search)
      } else {
        setManga([])
      }
    } catch (error) {
      console.error('Error searching manga:', error)
      setManga([])
    } finally {
      setLoading(false)
    }
  }

  const handleMangaClick = (mangaItem) => {
    if (!mangaItem) return
    
    // Check if it's a book (Gutenberg) - check multiple ways
    const isGutenberg = mangaItem.source === 'gutenberg' || 
                       mangaItem.Type === 'book' || 
                       (mangaItem.imdbID && mangaItem.imdbID.toString().startsWith('gutenberg_'))
    
    if (isGutenberg) {
      // Extract Gutenberg ID
      let gutenbergId = mangaItem.gutenberg_id
      if (!gutenbergId && mangaItem.imdbID && mangaItem.imdbID.toString().startsWith('gutenberg_')) {
        gutenbergId = mangaItem.imdbID.toString().replace('gutenberg_', '')
      }
      
      if (gutenbergId) {
        navigate(`/book/${gutenbergId}`)
        return
      }
    }
    
    // Check if it's anime/manga (AniList)
    if (mangaItem.anilist_id) {
      navigate(`/movie/anilist_${mangaItem.anilist_id}`)
      return
    }
    
    // Otherwise, try to navigate with imdbID
    if (mangaItem.imdbID && !mangaItem.imdbID.toString().startsWith('gutenberg_')) {
      navigate(`/movie/${mangaItem.imdbID}`)
    }
  }

  return (
    <div className="manga-page">
      <div className="manga-header">
        <h1>Manga</h1>
        <form className="manga-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search manga, books, comics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="manga-search-input"
          />
          <button type="submit" className="manga-search-btn">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : manga.length > 0 ? (
        <div className="manga-grid">
          {manga.map((item, index) => (
            <div key={index} onClick={() => handleMangaClick(item)}>
              <MovieCard movie={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No manga found. Try a different search.</p>
        </div>
      )}
    </div>
  )
}

export default Manga

