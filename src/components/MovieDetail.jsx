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
        getMovieById(imdbId).catch((err) => {
          console.error('Error fetching movie:', err)
          return null
        }),
        getMovieWatchOptions(imdbId).catch((err) => {
          console.error('Error fetching watch options:', err)
          return null
        }),
        getMovieYouTube(imdbId).catch(() => null)
      ])
      
      const movieData = results[0].status === 'fulfilled' ? results[0].value : null
      const watchOptionsData = results[1].status === 'fulfilled' ? results[1].value : null
      const youtubeData = results[2].status === 'fulfilled' ? results[2].value : { youtube_trailers: [], youtube_music_videos: [] }
      
      // Check if movie was found
      if (!movieData || movieData.Response === 'False') {
        // Try to get more info about the error
        const error = results[0].status === 'rejected' ? results[0].reason : null
        console.error('Movie not found:', {
          imdbId,
          error: error?.response?.data?.detail || error?.message || 'Unknown error',
          movieData
        })
        setMovie(null)
        return
      }
      
      // Ensure movie has at least basic data
      if (!movieData.Title) {
        console.warn('Movie data missing Title:', movieData)
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
        
        // Log watch options for debugging
        console.log('📺 Watch Options:', {
          streaming_sources_count: watchOptionsData.streaming_sources?.length || 0,
          streaming_sources: watchOptionsData.streaming_sources,
          can_watch_directly: watchOptionsData.can_watch_directly,
          primary_platform: watchOptionsData.primary_platform,
          has_youtube: watchOptionsData.streaming_sources?.some(s => 
            s.platform === 'YouTube' || s.name === 'YouTube' || s.source === 'youtube'
          ) || false
        })
        
        // If no streaming sources but we have watch options, log it
        if (!watchOptionsData.streaming_sources || watchOptionsData.streaming_sources.length === 0) {
          console.warn('⚠️ No streaming sources found for movie:', {
            imdbId,
            title: movieData?.Title,
            watchOptionsData
          })
        }
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
    // Check if it's a YouTube source - play in modal instead of opening new tab
    const isYouTube = source.platform === 'YouTube' || source.name === 'YouTube' || 
                     source.source === 'youtube' || 
                     source.youtube_embed_url || source.youtube_video_id ||
                     (source.url && (source.url.includes('youtube.com') || source.url.includes('youtu.be')))
    
    if (isYouTube) {
      // Play YouTube video in modal (like trailers)
      const embedUrl = source.youtube_embed_url || 
                      (source.youtube_video_id ? `https://www.youtube.com/embed/${source.youtube_video_id}` : null) ||
                      getYouTubeEmbedUrl(source.web_url || source.direct_watch_url || source.url)
      
      if (embedUrl) {
        setSelectedVideo({
          url: source.web_url || source.direct_watch_url || source.url,
          embed_url: embedUrl,
          title: source.youtube_title || source.name || `${movie?.Title} - Full Movie`
        })
        setShowTrailer(true)
        return
      }
    }
    
    // For non-YouTube sources, open in new tab
    if (source.web_url) {
      window.open(source.web_url, '_blank')
    } else if (source.direct_watch_url) {
      window.open(source.direct_watch_url, '_blank')
    } else if (source.url) {
      window.open(source.url, '_blank')
    } else if (source.android_url || source.playstore_url) {
      window.open(source.android_url || source.playstore_url, '_blank')
    } else if (source.ios_url) {
      window.open(source.ios_url, '_blank')
    } else if (source.platform_url) {
      window.open(source.platform_url, '_blank')
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
    // Add YouTube API parameters for better controls and quality options
    if (url.includes('youtube.com/embed/')) {
      // Extract video ID first
      let videoId = url.match(/embed\/([^?&]+)/)?.[1]
      if (!videoId) return url
      
      // Build URL with all necessary parameters for full functionality
      const params = new URLSearchParams()
      params.set('enablejsapi', '1')
      params.set('controls', '1') // Show controls
      params.set('rel', '0') // Don't show related videos
      params.set('modestbranding', '1') // Less YouTube branding
      params.set('playsinline', '1') // Play inline on mobile
      params.set('fs', '1') // Allow fullscreen
      params.set('iv_load_policy', '3') // Hide annotations
      params.set('cc_load_policy', '0') // No captions by default
      params.set('autoplay', '0') // Don't autoplay
      params.set('origin', window.location.origin) // Set origin for API
      
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
    }
    return url
  }

  const getPlatformIcon = (platformName) => {
    if (!platformName) return '🎬'
    const name = platformName.toLowerCase()
    if (name.includes('youtube') || name.includes('youtu')) return '▶️'
    if (name.includes('netflix')) return '🎬'
    if (name.includes('play') || name.includes('google') || name.includes('playstore')) return '📱'
    if (name.includes('hulu')) return '📺'
    if (name.includes('disney') || name.includes('disney+')) return '🏰'
    if (name.includes('amazon') || name.includes('prime')) return '📦'
    if (name.includes('apple') || name.includes('itunes')) return '🍎'
    if (name.includes('hbo') || name.includes('max') || name.includes('hbo max')) return '🎭'
    if (name.includes('paramount')) return '🎪'
    if (name.includes('peacock')) return '🦚'
    if (name.includes('crunchyroll')) return '🍙'
    if (name.includes('funimation')) return '🎌'
    if (name.includes('vudu')) return '📀'
    if (name.includes('fandango')) return '🎟️'
    if (name.includes('redbox')) return '📦'
    if (name.includes('tubi')) return '📺'
    if (name.includes('pluto')) return '🪐'
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
          <p>
            The movie with ID <strong>{imdbId}</strong> couldn't be loaded.
            {imdbId && (
              <>
                <br />
                <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', display: 'block', marginTop: '10px' }}>
                  This might be from a different source. Try searching for the movie instead.
                </small>
              </>
            )}
          </p>
          <div className="error-actions">
            <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
            <button className="btn-secondary" onClick={() => navigate('/browse')}>Browse Movies</button>
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

        {activeTab === 'streaming' && (
          <div className="streaming-section">
            {watchOptions?.can_watch_directly && watchOptions?.direct_watch_url && (
              <div className="watch-now-banner">
                <div className="watch-now-content">
                  <h3>Available to Watch</h3>
                  <p>Watch directly on {watchOptions.primary_platform || 'available platform'}</p>
                  <button className="btn-watch-now-banner" onClick={handleWatchNow}>
                    Watch Now →
                  </button>
                </div>
              </div>
            )}
            
            {watchOptions?.streaming_sources && watchOptions.streaming_sources.length > 0 ? (
              <>
                <h3 className="section-title">Available Platforms</h3>
                <div className="platforms-grid">
                  {watchOptions.streaming_sources.map((source, i) => {
                    // Determine the best URL to use (including YouTube)
                    const watchUrl = source.web_url || source.direct_watch_url || source.url || 
                                   source.android_url || source.playstore_url || source.ios_url || 
                                   source.platform_url || source.youtube_url || 
                                   (source.youtube_video_id ? `https://www.youtube.com/watch?v=${source.youtube_video_id}` : null) ||
                                   source.youtube_embed_url
                    
                    return (
                      <div 
                        key={i} 
                        className="platform-card" 
                        onClick={() => watchUrl && handleStreamingClick(source)}
                        style={{ cursor: watchUrl ? 'pointer' : 'default' }}
                      >
                      <div className="platform-icon">
                          {getPlatformIcon(source.platform || source.name)}
                        </div>
                        <div className="platform-info">
                          <h4>{source.platform || source.name || 'Unknown Platform'}</h4>
                          <div className="platform-meta">
                            <span className={`platform-type ${source.type || source.presentation_type || ''}`}>
                              {source.type === 'free' || source.presentation_type === 'free' ? 'Free' : 
                               source.type === 'subscription' || source.presentation_type === 'subscription' ? 'Subscription' :
                               source.type === 'rental' || source.presentation_type === 'rental' ? 'Rent' : 
                               source.type === 'buy' || source.presentation_type === 'buy' ? 'Buy' : 
                               source.type || source.presentation_type || 'Watch'}
                            </span>
                            {source.price_display && (
                              <span className="platform-price">{source.price_display}</span>
                            )}
                            {source.price && !source.price_display && (
                              <span className="platform-price">${source.price}</span>
                            )}
                            {(() => {
                              const isYouTube = source.platform === 'YouTube' || source.name === 'YouTube' || 
                                               source.source === 'youtube' || 
                                               source.youtube_embed_url || source.youtube_video_id ||
                                               (watchUrl && (watchUrl.includes('youtube.com') || watchUrl.includes('youtu.be')))
                              return isYouTube && watchUrl ? (
                                <span className="watch-here-badge">▶ Watch Here</span>
                              ) : null
                            })()}
                          </div>
                        </div>
                        {watchUrl && (
                          <div className="platform-arrow">
                            {(() => {
                              const isYouTube = source.platform === 'YouTube' || source.name === 'YouTube' || 
                                               source.source === 'youtube' || 
                                               source.youtube_embed_url || source.youtube_video_id ||
                                               (watchUrl && (watchUrl.includes('youtube.com') || watchUrl.includes('youtu.be')))
                              return isYouTube ? '▶' : '→'
                            })()}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            ) : streaming?.streaming_sources && streaming.streaming_sources.length > 0 ? (
              <>
                <h3 className="section-title">Available Platforms</h3>
                <div className="platforms-grid">
                  {streaming.streaming_sources.map((source, i) => {
                    const watchUrl = source.web_url || source.url || source.android_url || source.playstore_url ||
                                   source.youtube_url || (source.youtube_video_id ? `https://www.youtube.com/watch?v=${source.youtube_video_id}` : null)
                    
                    // Check if it's YouTube
                    const isYouTube = source.platform === 'YouTube' || source.name === 'YouTube' || 
                                     source.source === 'youtube' || 
                                     source.youtube_embed_url || source.youtube_video_id ||
                                     (watchUrl && (watchUrl.includes('youtube.com') || watchUrl.includes('youtu.be')))
                    
                    return (
                      <div 
                        key={i} 
                        className="platform-card" 
                        onClick={() => watchUrl && handleStreamingClick(source)}
                        style={{ cursor: watchUrl ? 'pointer' : 'default' }}
                      >
                        <div className="platform-icon">
                          {getPlatformIcon(source.platform || source.name)}
                      </div>
                      <div className="platform-info">
                          <h4>{source.platform || source.name || 'Unknown Platform'}</h4>
                        <div className="platform-meta">
                            <span className={`platform-type ${source.type || ''}`}>
                            {source.type === 'free' ? 'Free' : 
                             source.type === 'subscription' ? 'Subscription' :
                               source.type === 'rental' ? 'Rent' : 
                               source.type === 'buy' ? 'Buy' : 'Watch'}
                          </span>
                          {source.price_display && (
                            <span className="platform-price">{source.price_display}</span>
                          )}
                            {isYouTube && watchUrl && (
                              <span className="watch-here-badge">▶ Watch Here</span>
                            )}
                          </div>
                        </div>
                        {watchUrl && (
                          <div className="platform-arrow">
                            {isYouTube ? '▶' : '→'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="no-content">No streaming sources available. Check back later for updates.</p>
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
              let embedUrl = selectedVideo.embed_url || 
                              getYouTubeEmbedUrl(selectedVideo.url) || 
                              getYouTubeEmbedUrl(selectedVideo.trailer)
              
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
                      id={`youtube-player-${Date.now()}`}
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
                          href={selectedVideo.url || selectedVideo.trailer} 
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

