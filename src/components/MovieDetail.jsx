import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMovieById, getMovieStreaming, getMovieYouTube, getAnimeById } from '../services/api'
import './MovieDetail.css'

const MovieDetail = () => {
  const { imdbId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [streaming, setStreaming] = useState(null)
  const [youtube, setYoutube] = useState(null)
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
        }
      }
      
      // Regular movie/TV show
      const [movieData, streamingData, youtubeData] = await Promise.all([
        getMovieById(imdbId),
        getMovieStreaming(imdbId).catch(() => null),
        getMovieYouTube(imdbId).catch(() => null)
      ])
      
      setMovie(movieData)
      setStreaming(streamingData)
      setYoutube(youtubeData)
    } catch (error) {
      console.error('Error loading movie data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStreamingClick = (source) => {
    if (source.web_url) {
      window.open(source.web_url, '_blank')
    } else if (source.ios_url) {
      window.open(source.ios_url, '_blank')
    } else if (source.android_url) {
      window.open(source.android_url, '_blank')
    }
  }

  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setShowTrailer(true)
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
        <h2>Movie not found</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    )
  }

  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null
  const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null
  const runtime = movie.Runtime && movie.Runtime !== 'N/A' ? movie.Runtime : null
  const genre = movie.Genre ? movie.Genre.split(', ') : []
  const actors = movie.Actors ? movie.Actors.split(', ') : []

  // Get trailer URL (prioritize WatchMode, fallback to YouTube)
  const trailerUrl = movie.trailer || (youtube?.youtube_trailers?.[0]?.url) || null
  const trailerEmbed = movie.trailer || (youtube?.youtube_trailers?.[0]?.embed_url) || null

  return (
    <div className="movie-detail">
      {/* Hero Section */}
      <div className="movie-hero" style={{ backgroundImage: poster ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${poster})` : 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9))' }}>
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        
        <div className="hero-content">
          <div className="hero-poster">
            {poster ? (
              <img src={poster} alt={movie.Title} />
            ) : (
              <div className="poster-placeholder">🎬</div>
            )}
          </div>
          
          <div className="hero-info">
            <div className="movie-meta">
              {movie.Rated && movie.Rated !== 'N/A' && (
                <span className="age-rating">{movie.Rated}</span>
              )}
              {runtime && <span className="runtime">{runtime}</span>}
              {movie.Year && <span className="year">{movie.Year}</span>}
            </div>
            
            <h1 className="movie-title">{movie.Title}</h1>
            
            {rating && (
              <div className="rating-section">
                <span className="rating-value">{rating}</span>
                <span className="rating-label">IMDb</span>
              </div>
            )}
            
            <div className="action-buttons">
              {trailerUrl && (
                <button 
                  className="btn-primary"
                  onClick={() => handlePlayVideo({ url: trailerUrl, embed_url: trailerEmbed })}
                >
                  ▶ Trailer
                </button>
              )}
              <button className="btn-secondary">+ Watchlist</button>
              <button className="btn-icon" title="Rate">⭐</button>
              <button className="btn-icon" title="Share">📤</button>
            </div>
          </div>
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
            {movie.Plot && movie.Plot !== 'N/A' && (
              <div className="plot-section">
                <h3>Description</h3>
                <p>{movie.Plot}</p>
              </div>
            )}
            
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
            
            {/* Regular Actors (for non-AniList items) */}
            {!movie.characters && actors.length > 0 && (
              <div className="actors-section">
                <h3>Cast</h3>
                <div className="actors-grid">
                  {actors.slice(0, 8).map((actor, i) => (
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
            {streaming?.streaming_sources && streaming.streaming_sources.length > 0 ? (
              <div className="streaming-sources">
                {streaming.streaming_sources.map((source, i) => (
                  <div key={i} className="streaming-card" onClick={() => handleStreamingClick(source)}>
                    <div className="streaming-info">
                      <h3>{source.name}</h3>
                      <div className="streaming-meta">
                        <span className={`streaming-type ${source.type}`}>{source.type}</span>
                        {source.format && <span className="streaming-format">{source.format.toUpperCase()}</span>}
                        {source.price && <span className="streaming-price">${source.price}</span>}
                      </div>
                    </div>
                    <button className="streaming-button">Watch Now →</button>
                  </div>
                ))}
              </div>
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

export default MovieDetail

