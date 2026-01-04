import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMovieById, getMovieStreaming, getMovieYouTube, getAnimeById, getMovieWatchOptions } from '../services/api'
import './MovieDetail.css'

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

const MovieDetail = () => {
  const { imdbId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [streaming, setStreaming] = useState(null)
  const [youtube, setYoutube] = useState(null)
  const [watchOptions, setWatchOptions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showTrailer, setShowTrailer] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    loadMovieData()
  }, [imdbId])

  const loadMovieData = async () => {
    try {
      setLoading(true)
      
      // Check if it's an AniList ID
      if (imdbId && imdbId.toString().startsWith('anilist_')) {
        const anilistId = parseInt(imdbId.toString().replace('anilist_', ''))
        if (!isNaN(anilistId)) {
          try {
            const animeData = await getAnimeById(anilistId)
            setMovie(animeData)
            setStreaming(null)
            // For AniList, use the trailer from the data
            if (animeData?.trailer) {
              const trailerId = animeData.trailer_youtube_id || animeData.trailer.split('watch?v=')[1]?.split('&')[0]
              setYoutube({
                youtube_trailers: [{
                  url: animeData.trailer,
                  embed_url: trailerId ? `https://www.youtube.com/embed/${trailerId}` : animeData.trailer.replace('watch?v=', 'embed/'),
                  title: `${animeData.Title} - Trailer`
                }],
                youtube_music_videos: []
              })
            } else {
              setYoutube({ youtube_trailers: [], youtube_music_videos: [] })
            }
            return
          } catch (error) {
            console.error('Error loading anime:', error)
            // Continue to try regular movie endpoint
          }
        }
      }
      
      // Regular movie/TV show - use new watch options API
      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        getMovieById(imdbId).catch(() => null),
        getMovieWatchOptions(imdbId).catch(() => null),
        getMovieYouTube(imdbId).catch(() => null)
      ])
      
      const movieData = results[0].status === 'fulfilled' ? results[0].value : null
      const watchOptionsData = results[1].status === 'fulfilled' ? results[1].value : null
      const youtubeData = results[2].status === 'fulfilled' ? results[2].value : { youtube_trailers: [], youtube_music_videos: [] }
      
      if (!movieData || movieData.Response === 'False') {
        // Movie not found
        setMovie(null)
        return
      }
      
      setMovie(movieData)
      setWatchOptions(watchOptionsData)
      // Keep streaming for backward compatibility
      if (watchOptionsData) {
        setStreaming({
          streaming_sources: watchOptionsData.streaming_sources || [],
          trailer: watchOptionsData.trailer
        })
      }
      setYoutube(youtubeData || { youtube_trailers: [], youtube_music_videos: [] })
    } catch (error) {
      console.error('Error loading movie data:', error)
      setMovie(null)
    } finally {
      setLoading(false)
    }
  }

  const handleStreamingClick = (source) => {
    if (source.web_url) {
      window.open(source.web_url, '_blank')
    } else if (source.android_url || source.playstore_url) {
      window.open(source.android_url || source.playstore_url, '_blank')
    } else if (source.ios_url) {
      window.open(source.ios_url, '_blank')
    }
  }

  const handleWatchNow = () => {
    if (watchOptions?.can_watch_directly && watchOptions?.direct_watch_url) {
      window.open(watchOptions.direct_watch_url, '_blank')
    } else if (watchOptions?.streaming_sources?.length > 0) {
      // Open first available streaming source
      const firstSource = watchOptions.streaming_sources[0]
      handleStreamingClick(firstSource)
    }
  }

  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setShowTrailer(true)
  }

  const getPlatformIcon = (platformName) => {
    if (!platformName) return '🎬'
    const name = platformName.toLowerCase()
    if (name.includes('netflix')) return '🎬'
    if (name.includes('youtube')) return '▶️'
    if (name.includes('play') || name.includes('google')) return '📱'
    if (name.includes('hulu')) return '📺'
    if (name.includes('disney')) return '🏰'
    if (name.includes('amazon') || name.includes('prime')) return '📦'
    if (name.includes('apple')) return '🍎'
    if (name.includes('hbo') || name.includes('max')) return '🎭'
    return '📺'
  }

  if (loading) {
    return (
      <div className="movie-detail-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="movie-detail-error">
        <div className="error-content">
          <h2>Movie not found</h2>
          <p>The movie you're looking for couldn't be loaded. It may not be available in our database.</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
            <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      </div>
    )
  }

  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null
  const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null
  const runtime = movie.Runtime && movie.Runtime !== 'N/A' ? movie.Runtime : null
  const genre = movie.Genre ? movie.Genre.split(', ') : []
  const actors = movie.Actors ? movie.Actors.split(', ') : []

  // Get trailer URL (prioritize WatchMode, fallback to YouTube) and convert to embed format
  const trailerUrl = movie.trailer || (youtube?.youtube_trailers?.[0]?.url) || null
  const trailerEmbed = getYouTubeEmbedUrl(trailerUrl) || (youtube?.youtube_trailers?.[0]?.embed_url) || null

  // Format runtime for display
  const formatRuntime = (runtimeStr) => {
    if (!runtimeStr || runtimeStr === 'N/A') return null
    const match = runtimeStr.match(/(\d+)/)
    if (!match) return runtimeStr
    const minutes = parseInt(match[1])
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours} hr ${mins > 0 ? `${mins} mins` : ''}`.trim()
    }
    return `${mins} mins`
  }

  const formattedRuntime = formatRuntime(runtime)

  return (
    <div className="movie-detail">
      {/* Hero Section - Large Banner */}
      <div className="movie-hero" style={{ backgroundImage: poster ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.85)), url(${poster})` : 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.95))' }}>
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        
        <div className="hero-content-new">
          <h1 className="movie-title-hero">{movie.Title}</h1>
          
          <div className="movie-meta-hero">
            {movie.Rated && movie.Rated !== 'N/A' && (
              <span className="meta-badge">{movie.Rated}</span>
            )}
            {formattedRuntime && (
              <span className="meta-badge">{formattedRuntime}</span>
            )}
            {movie.Year && (
              <span className="meta-badge">{movie.Year}</span>
            )}
          </div>
          
          {/* Primary Action Buttons */}
          <div className="primary-actions">
            {watchOptions?.can_watch_directly ? (
              <button className="btn-play-primary" onClick={handleWatchNow}>
                <span className="play-icon">▶</span>
                Watch Now
              </button>
            ) : (
              <button 
                className="btn-play-primary"
                onClick={() => trailerUrl ? handlePlayVideo({ url: trailerUrl, embed_url: trailerEmbed }) : handleWatchNow()}
              >
                <span className="play-icon">▶</span>
                {trailerUrl ? 'Trailer' : 'Watch'}
              </button>
            )}
            {trailerUrl && (
              <button 
                className="btn-download"
                onClick={() => handlePlayVideo({ url: trailerUrl, embed_url: trailerEmbed })}
              >
                <span className="download-icon">🎬</span>
                Trailer
              </button>
            )}
          </div>
          
          {/* Plot Summary */}
          {movie.Plot && movie.Plot !== 'N/A' && (
            <div className="plot-summary">
              <p>{movie.Plot}</p>
            </div>
          )}
          
        </div>
      </div>

      {/* Content Tabs */}
      <div className="detail-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'trailers' ? 'active' : ''}`}
          onClick={() => setActiveTab('trailers')}
        >
          Trailers
        </button>
        <button 
          className={`tab ${activeTab === 'music' ? 'active' : ''}`}
          onClick={() => setActiveTab('music')}
        >
          Music
        </button>
        <button 
          className={`tab ${activeTab === 'streaming' ? 'active' : ''}`}
          onClick={() => setActiveTab('streaming')}
        >
          Where to Watch
        </button>
      </div>

      {/* Tab Content */}
      <div className="detail-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Plot/Overview - Ensure it's always shown if available */}
            {movie.Plot && movie.Plot !== 'N/A' ? (
              <div className="plot-section">
                <h3>Overview</h3>
                <p>{movie.Plot}</p>
              </div>
            ) : movie.overview && movie.overview !== 'N/A' ? (
              <div className="plot-section">
                <h3>Overview</h3>
                <p>{movie.overview}</p>
              </div>
            ) : null}
            
            {genre.length > 0 && (
              <div className="genres-section">
                <h3>Genres</h3>
                <div className="genre-tags">
                  {genre.map((g, i) => (
                    <span key={i} className="genre-tag">{g}</span>
                  ))}
                </div>
              </div>
            )}
            
            {/* AniList Characters */}
            {movie.characters && movie.characters.length > 0 && (
              <div className="actors-section">
                <h3>Characters</h3>
                <div className="actors-grid">
                  {movie.characters.slice(0, 12).map((char, i) => (
                    <div key={i} className="actor-card">
                      {char.image ? (
                        <img src={char.image} alt={char.name} className="character-image" />
                      ) : (
                        <div className="actor-avatar">{char.name.charAt(0)}</div>
                      )}
                      <span className="actor-name">{char.name}</span>
                      {char.role && <span className="character-role">{char.role}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular Actors (for non-AniList items) - Always show if available */}
            {!movie.characters && actors.length > 0 && (
              <div className="actors-section">
                <h3>Cast</h3>
                <div className="actors-grid">
                  {actors.slice(0, 12).map((actor, i) => (
                    <div key={i} className="actor-card">
                      <div className="actor-avatar">{actor.charAt(0)}</div>
                      <span className="actor-name">{actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* AniList Studios */}
            {movie.studios && movie.studios.length > 0 && (
              <div className="info-row">
                <strong>Studios:</strong> {movie.studios.join(', ')}
              </div>
            )}
            
            {/* AniList Ratings */}
            {movie.anilist_rating && (
              <div className="info-row">
                <strong>AniList Rating:</strong> {movie.anilist_rating}/100
              </div>
            )}
            
            {movie.anilist_popularity && (
              <div className="info-row">
                <strong>Popularity:</strong> {movie.anilist_popularity.toLocaleString()}
              </div>
            )}
            
            {/* AniList Episodes/Chapters */}
            {movie.anilist_episodes && (
              <div className="info-row">
                <strong>Episodes:</strong> {movie.anilist_episodes}
              </div>
            )}
            
            {movie.anilist_chapters && (
              <div className="info-row">
                <strong>Chapters:</strong> {movie.anilist_chapters}
              </div>
            )}
            
            {movie.anilist_volumes && (
              <div className="info-row">
                <strong>Volumes:</strong> {movie.anilist_volumes}
              </div>
            )}
            
            {movie.anilist_season && (
              <div className="info-row">
                <strong>Season:</strong> {movie.anilist_season} {movie.anilist_seasonYear}
              </div>
            )}
            
            {movie.Director && movie.Director !== 'N/A' && (
              <div className="info-row">
                <strong>Director:</strong> {movie.Director}
              </div>
            )}
            
            {movie.Writer && movie.Writer !== 'N/A' && (
              <div className="info-row">
                <strong>Writer:</strong> {movie.Writer}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trailers' && (
          <div className="trailers-section">
            {youtube?.youtube_trailers && youtube.youtube_trailers.length > 0 ? (
              <div className="videos-grid">
                {youtube.youtube_trailers.map((video, i) => (
                  <div key={i} className="video-card" onClick={() => handlePlayVideo(video)}>
                    <div className="video-thumbnail">
                      {video.thumbnail && (
                        <img src={video.thumbnail} alt={video.title} />
                      )}
                      <div className="play-overlay">▶</div>
                    </div>
                    <h4>{video.title}</h4>
                    <p>{video.channel_title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-content">No trailers available</p>
            )}
          </div>
        )}

        {activeTab === 'music' && (
          <div className="music-section">
            {youtube?.youtube_music_videos && youtube.youtube_music_videos.length > 0 ? (
              <div className="videos-grid">
                {youtube.youtube_music_videos.map((video, i) => (
                  <div key={i} className="video-card" onClick={() => handlePlayVideo(video)}>
                    <div className="video-thumbnail">
                      {video.thumbnail && (
                        <img src={video.thumbnail} alt={video.title} />
                      )}
                      <div className="play-overlay">▶</div>
                    </div>
                    <h4>{video.title}</h4>
                    <p>{video.channel_title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-content">No music videos available</p>
            )}
          </div>
        )}

        {activeTab === 'streaming' && (
          <div className="streaming-section">
            {watchOptions?.can_watch_directly && watchOptions?.primary_platform && (
              <div className="watch-now-banner">
                <div className="watch-now-content">
                  <h3>Available to Watch</h3>
                  <p>Watch directly on {watchOptions.primary_platform}</p>
                  <button className="btn-watch-now-banner" onClick={handleWatchNow}>
                    Watch Now on {watchOptions.primary_platform} →
                  </button>
                </div>
              </div>
            )}
            
            {watchOptions?.streaming_sources && watchOptions.streaming_sources.length > 0 ? (
              <>
                <h3 className="section-title">Where to Watch</h3>
                <div className="platforms-grid">
                  {watchOptions.streaming_sources.map((source, i) => (
                    <div key={i} className="platform-card" onClick={() => handleStreamingClick(source)}>
                      <div className="platform-icon">
                        {getPlatformIcon(source.platform)}
                      </div>
                      <div className="platform-info">
                        <h4>{source.platform || 'Unknown'}</h4>
                        <div className="platform-meta">
                          <span className={`platform-type ${source.type}`}>
                            {source.type === 'free' ? 'Free' : 
                             source.type === 'subscription' ? 'Subscription' :
                             source.type === 'rental' ? 'Rent' : 'Buy'}
                          </span>
                          {source.price_display && (
                            <span className="platform-price">{source.price_display}</span>
                          )}
                        </div>
                      </div>
                      <div className="platform-arrow">→</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-content">No streaming sources available</p>
            )}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {showTrailer && selectedVideo && (
        <div className="video-modal" onClick={() => setShowTrailer(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowTrailer(false)}>×</button>
            {(() => {
              // Get embed URL - try embed_url first, then convert url to embed, or use trailer
              const embedUrl = selectedVideo.embed_url || 
                              getYouTubeEmbedUrl(selectedVideo.url) || 
                              getYouTubeEmbedUrl(selectedVideo.trailer)
              
              if (embedUrl) {
                return (
                  <iframe
                    src={embedUrl}
                    title={selectedVideo.title || 'Video'}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-iframe"
                  />
                )
              } else {
                return (
                  <div className="video-fallback">
                    <p>Unable to load video. Please watch on YouTube.</p>
                    <a href={selectedVideo.url || selectedVideo.trailer} target="_blank" rel="noopener noreferrer">
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

export default MovieDetail

