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
      const bookData = await getBookById(gutenbergId)
      setBook(bookData)
      
      // Get reading URL - try multiple sources and formats
      let url = bookData.reading_url
      
      // Fallback to HTML download link if available
      if (!url && bookData.download_links?.html) {
        url = bookData.download_links.html
      }
      
      // If still no URL, construct Gutenberg reading URL - try standard format
      if (!url && bookData.gutenberg_id) {
        const bookId = bookData.gutenberg_id
        // Standard format: https://www.gutenberg.org/files/{id}/{id}-h/{id}-h.htm
        url = `https://www.gutenberg.org/files/${bookId}/${bookId}-h/${bookId}-h.htm`
      }
      
      setReadingUrl(url)
    } catch (error) {
      console.error('Error loading book:', error)
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
        <button onClick={() => navigate('/manga')}>Go Back</button>
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
          <iframe
            src={readingUrl}
            className="book-iframe"
            title={book.Title}
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onError={(e) => {
              console.error('Iframe load error, trying alternative URL')
              // Try alternative URL format if iframe fails
              if (book.gutenberg_id) {
                const bookId = book.gutenberg_id
                const altUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}/${bookId}-h.htm`
                e.target.src = altUrl
              }
            }}
          />
        ) : (
          <div className="book-reader-error">
            <p>Reading URL not available for this book.</p>
            {book.download_links?.html && (
              <a 
                href={book.download_links.html} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link-btn"
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

