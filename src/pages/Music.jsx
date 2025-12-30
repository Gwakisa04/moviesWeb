import React, { useState } from 'react'
import { searchMusicVideos } from '../services/api'
import './Music.css'

const Music = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const data = await searchMusicVideos(searchQuery, 50)
      if (data?.videos) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('Error searching music videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setShowPlayer(true)
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
      ) : (
        <div className="empty-state">
          <p>Search for music videos to get started</p>
        </div>
      )}

      {/* Video Player Modal */}
      {showPlayer && selectedVideo && (
        <div className="video-modal" onClick={() => setShowPlayer(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowPlayer(false)}>×</button>
            {selectedVideo.embed_url ? (
              <iframe
                src={selectedVideo.embed_url}
                title={selectedVideo.title || 'Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              />
            ) : (
              <div className="video-fallback">
                <a href={selectedVideo.url} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Music

