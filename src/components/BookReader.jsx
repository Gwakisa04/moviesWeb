import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBookById } from '../services/api'
import './BookReader.css'

const BookReader = () => {
  const { gutenbergId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [readingUrl, setReadingUrl] = useState(null)

  useEffect(() => {
    loadBook()
  }, [gutenbergId])

  const loadBook = async () => {
    try {
      setLoading(true)
      console.log(`Loading book with ID: ${gutenbergId}`)
      const bookData = await getBookById(gutenbergId)
      console.log('Book data received:', bookData)
      
      if (!bookData) {
        console.error('Book data is null or undefined')
        setBook(null)
        return
      }
      
      setBook(bookData)
      
      // Get reading URL - try multiple sources and formats
      let url = bookData.reading_url
      console.log('Initial reading_url:', url)
      
      // Fallback to HTML download link if available
      if (!url && bookData.download_links?.html) {
        url = bookData.download_links.html
        console.log('Using download_links.html:', url)
      }
      
      // If still no URL, construct Gutenberg reading URL - try standard format
      if (!url && bookData.gutenberg_id) {
        const bookId = bookData.gutenberg_id
        // Standard format: https://www.gutenberg.org/files/{id}/{id}-h/{id}-h.htm
        url = `https://www.gutenberg.org/files/${bookId}/${bookId}-h/${bookId}-h.htm`
        console.log('Constructed reading URL:', url)
      }
      
      // If we still don't have a URL, try using the gutenbergId from params
      if (!url && gutenbergId) {
        url = `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-h/${gutenbergId}-h.htm`
        console.log('Using gutenbergId from params:', url)
      }
      
      setReadingUrl(url)
      console.log('Final reading URL:', url)
    } catch (error) {
      console.error('Error loading book:', error)
      console.error('Error details:', error.response?.data || error.message)
      setBook(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (format) => {
    if (book?.download_links?.[format]) {
      window.open(book.download_links[format], '_blank')
    }
  }

  if (loading) {
    return (
      <div className="book-reader-loading">
        <div className="loading-spinner"></div>
        <p>Loading book...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="book-reader-error">
        <h2>Book not found</h2>
        <p>Unable to load book with ID: {gutenbergId}</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/manga')}>Go Back to Manga</button>
          <a 
            href={`https://www.gutenberg.org/ebooks/${gutenbergId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link-btn"
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px' 
            }}
          >
            Open on Project Gutenberg →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="book-reader">
      {/* Header */}
      <div className="book-reader-header">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        <div className="book-title-header">
          <h1>{book.Title}</h1>
          {book.author && <p className="book-author">By {book.author}</p>}
        </div>
        <div className="book-actions">
          {book.download_links?.epub && (
            <button 
              className="download-btn"
              onClick={() => handleDownload('epub')}
              title="Download EPUB"
            >
              📥 EPUB
            </button>
          )}
          {book.download_links?.txt && (
            <button 
              className="download-btn"
              onClick={() => handleDownload('txt')}
              title="Download TXT"
            >
              📥 TXT
            </button>
          )}
        </div>
      </div>

      {/* Book Info Bar */}
      <div className="book-info-bar">
        {book.Year && book.Year !== 'N/A' && (
          <span className="info-badge">Published: {book.Year}</span>
        )}
        {book.download_count > 0 && (
          <span className="info-badge">Downloads: {book.download_count.toLocaleString()}</span>
        )}
        {book.genres && book.genres.length > 0 && (
          <div className="genres-list">
            {book.genres.slice(0, 3).map((genre, i) => (
              <span key={i} className="genre-badge">{genre}</span>
            ))}
          </div>
        )}
      </div>

      {/* Reading Iframe */}
      <div className="book-reader-container">
        {readingUrl ? (
          <>
            <iframe
              src={readingUrl}
              className="book-iframe"
              title={book.Title}
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              onLoad={(e) => {
                console.log('Iframe loaded successfully:', readingUrl)
              }}
              onError={(e) => {
                console.error('Iframe load error, trying alternative URL')
                // Try alternative URL format if iframe fails
                if (book.gutenberg_id) {
                  const bookId = book.gutenberg_id
                  const altUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}/${bookId}-h.htm`
                  console.log('Trying alternative URL:', altUrl)
                  e.target.src = altUrl
                }
              }}
            />
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', marginTop: '10px', borderRadius: '5px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '5px 0' }}>
                If the book doesn't load, try opening it directly:
              </p>
              <a 
                href={readingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'underline' }}
              >
                {readingUrl}
              </a>
            </div>
          </>
        ) : (
          <div className="book-reader-error">
            <p>Reading URL not available for this book.</p>
            {book.download_links?.html && (
              <a 
                href={book.download_links.html} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link-btn"
                style={{ 
                  display: 'inline-block',
                  margin: '10px 5px',
                  padding: '10px 20px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '5px' 
                }}
              >
                Read on Gutenberg.org →
              </a>
            )}
            {book.gutenberg_id && (
              <a 
                href={`https://www.gutenberg.org/ebooks/${book.gutenberg_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link-btn"
                style={{ 
                  display: 'inline-block',
                  margin: '10px 5px',
                  padding: '10px 20px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '5px' 
                }}
              >
                View on Project Gutenberg →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookReader

