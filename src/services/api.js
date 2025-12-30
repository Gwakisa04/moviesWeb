import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://moviepy-74vk.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const searchMovies = async (query, page = 1, year = null, type = null) => {
  try {
    const params = { query, page }
    if (year) params.year = year
    if (type) params.type = type
    
    const response = await api.get('/movies/search', { params })
    return response.data
  } catch (error) {
    console.error('Error searching movies:', error)
    throw error
  }
}

export const getMovieById = async (imdbId) => {
  try {
    const response = await api.get(`/movies/${imdbId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching movie:', error)
    throw error
  }
}

export const fetchPopularMovies = async (limit = 20, type = null) => {
  try {
    const params = { limit }
    if (type) params.type = type
    const response = await api.get('/movies/popular', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    throw error
  }
}

export const fetchNewReleases = async (limit = 6, type = null) => {
  try {
    const params = { limit }
    if (type) params.type = type
    const response = await api.get('/movies/new-releases', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching new releases:', error)
    throw error
  }
}

export const fetchPopularMoviesEnriched = async (limit = 20) => {
  try {
    const response = await api.get('/movies/popular', { params: { limit, enrich: true } })
    return response.data
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    throw error
  }
}

export const getMovieStreaming = async (imdbId) => {
  try {
    const response = await api.get(`/movies/${imdbId}/streaming`)
    return response.data
  } catch (error) {
    console.error('Error fetching streaming sources:', error)
    throw error
  }
}

export const getMovieYouTube = async (imdbId, includeMusic = true) => {
  try {
    const response = await api.get(`/movies/${imdbId}/youtube`, { 
      params: { include_music: includeMusic } 
    })
    return response.data
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    throw error
  }
}

