import React, { useState, useEffect } from 'react'
import { searchMusicVideos, getTrendingMusicVideos } from '../services/api'
import './Music.css'

// Utility function to extract YouTube video ID and convert to embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null
  
  // If it's already an embed URL, return as is
  if (url.includes('youtube.com/embed/')) {
    return url
  }
  
  // Extract video ID from various YouTube URL formats
  let videoId = null
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (watchMatch) {
    videoId = watchMatch[1]
  }
  
  // Format: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^&\s]+)/)
  if (embedMatch) {
    videoId = embedMatch[1]
  }
  
  // Format: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^&\s]+)/)
  if (shortMatch) {
    videoId = shortMatch[1]
  }
  
  // If we found a video ID, return embed URL
  if (videoId) {
    // Remove any query parameters from video ID
    videoId = videoId.split('&')[0].split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  return null
}

const Music = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadTrendingVideos()
  }, [])

  const loadTrendingVideos = async () => {
    try {
      setLoading(true)
      setIsSearching(false)
      const data = await getTrendingMusicVideos(50)
      if (data?.videos) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('Error loading trending videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadTrendingVideos()
      return
    }

    try {
      setLoading(true)
      setIsSearching(true)
      const data = await searchMusicVideos(searchQuery, 50)
      if (data?.videos) {
        setVideos(data.videos)
      } else {
        setVideos([])
      }
    } catch (error) {
      console.error('Error searching music videos:', error)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setShowPlayer(true)
  }

  const handleFullscreen = () => {
    const modal = document.querySelector('.video-modal-content')
    if (modal) {
      if (modal.requestFullscreen) {
        modal.requestFullscreen()
      } else if (modal.webkitRequestFullscreen) {
        modal.webkitRequestFullscreen()
      } else if (modal.mozRequestFullScreen) {
        modal.mozRequestFullScreen()
      } else if (modal.msRequestFullscreen) {
        modal.msRequestFullscreen()
      }
    }
  }

  const handleToggleLandscape = () => {
    const modal = document.querySelector('.video-modal')
    if (modal) {
      const isLandscape = modal.classList.contains('landscape-mode')
      if (isLandscape) {
        modal.classList.remove('landscape-mode')
        // Try to lock orientation back to portrait
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('portrait').catch(() => {})
        }
      } else {
        modal.classList.add('landscape-mode')
        // Try to lock orientation to landscape
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {})
        }
      }
    }
  }

  const enhanceYouTubeUrl = (url) => {
    if (!url) return url
    // Add YouTube API parameters for better controls
    if (url.includes('youtube.com/embed/')) {
      // Check if parameters already exist
      if (!url.includes('?')) {
        return `${url}?enablejsapi=1&controls=1&rel=0&modestbranding=1`
      } else if (!url.includes('enablejsapi')) {
        return `${url}&enablejsapi=1&controls=1&rel=0&modestbranding=1`
      }
    }
    return url
  }

  return (
    <div className="music-page">
      <div className="music-header">
        <h1>Music Videos</h1>
        <form className="music-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for music videos, artists, songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="music-search-input"
          />
          <button type="submit" className="music-search-btn">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : videos.length > 0 ? (
        <>
          {!isSearching && (
            <div className="section-header">
              <h2>Trending Music Videos</h2>
            </div>
          )}
          <div className="videos-grid">
            {videos.map((video, i) => (
              <div key={i} className="video-card" onClick={() => handlePlayVideo(video)}>
                <div className="video-thumbnail">
                  {video.thumbnail && (
                    <img src={video.thumbnail} alt={video.title} />
                  )}
                  <div className="play-overlay">▶</div>
                </div>
                <div className="video-info">
                  <h4>{video.title}</h4>
                  <p>{video.channel_title}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>No videos found. Try a different search.</p>
        </div>
      )}

      {/* Video Player Modal */}
      {showPlayer && selectedVideo && (
        <div className="video-modal" onClick={() => setShowPlayer(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowPlayer(false)}>×</button>
            {(() => {
              // Get embed URL - try embed_url first, then convert url to embed
              let embedUrl = selectedVideo.embed_url || getYouTubeEmbedUrl(selectedVideo.url)
              
              // Enhance YouTube URL with better controls
              embedUrl = enhanceYouTubeUrl(embedUrl)
              
              if (embedUrl) {
                return (
                  <div className="video-player-container">
                    <iframe
                      src={embedUrl}
                      title={selectedVideo.title || 'Video'}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="video-iframe"
                    />
                    <div className="video-controls-overlay">
                      <div className="video-controls-bar">
                        <button 
                          className="control-icon-btn" 
                          onClick={handleToggleLandscape}
                          title="Toggle Landscape/Portrait"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="5" width="18" height="14" rx="2"/>
                            <path d="M7 9h10M7 15h10"/>
                          </svg>
                        </button>
                        <button 
                          className="control-icon-btn" 
                          onClick={handleFullscreen}
                          title="Fullscreen"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                          </svg>
                        </button>
                        <a 
                          href={selectedVideo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="control-icon-btn"
                          title="Open on YouTube"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                )
              } else {
                return (
                  <div className="video-fallback">
                    <p>Unable to load video. Please watch on YouTube.</p>
                    <a href={selectedVideo.url} target="_blank" rel="noopener noreferrer">
                      Watch on YouTube →
                    </a>
                  </div>
                )
              }
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default Music

