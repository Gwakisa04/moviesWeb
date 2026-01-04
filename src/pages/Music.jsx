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
    const iframe = document.querySelector('.video-iframe')
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen()
      } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen()
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen()
      }
    }
  }

  const handleToggleLandscape = () => {
    const modal = document.querySelector('.video-modal')
    if (modal) {
      modal.classList.toggle('landscape-mode')
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
                      <div className="video-controls">
                        <button 
                          className="control-btn" 
                          onClick={handleFullscreen}
                          title="Fullscreen"
                        >
                          ⛶ Fullscreen
                        </button>
                        <button 
                          className="control-btn" 
                          onClick={handleToggleLandscape}
                          title="Toggle Landscape"
                        >
                          🔄 Landscape
                        </button>
                        <a 
                          href={selectedVideo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="control-btn"
                          title="Open on YouTube"
                        >
                          ▶️ YouTube
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

