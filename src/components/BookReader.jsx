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
  const [sections, setSections] = useState([])
  const [currentSection, setCurrentSection] = useState(null)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  useEffect(() => {
    loadBook()
  }, [gutenbergId])

  const loadBook = async () => {
    try {
      setLoading(true)
      console.log(`Loading book with ID: ${gutenbergId}`)
      
      // ALWAYS construct a reading URL from the gutenbergId parameter
      // This ensures users can read the book even if the API call fails
      const defaultUrl = `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-h/${gutenbergId}-h.htm`
      setReadingUrl(defaultUrl)
      console.log('Default reading URL set:', defaultUrl)
      
      // Try to fetch book metadata, but don't fail if it doesn't work
      try {
        const bookData = await getBookById(gutenbergId)
        console.log('Book data received:', bookData)
        
        if (bookData) {
          setBook(bookData)
          
          // Prefer reading_url from API if available
          if (bookData.reading_url) {
            setReadingUrl(bookData.reading_url)
            console.log('Using API reading_url:', bookData.reading_url)
          } else if (bookData.download_links?.html) {
            // Fallback to HTML download link
            setReadingUrl(bookData.download_links.html)
            console.log('Using download_links.html:', bookData.download_links.html)
          } else if (bookData.gutenberg_id) {
            // Use gutenberg_id from API response
            const apiUrl = `https://www.gutenberg.org/files/${bookData.gutenberg_id}/${bookData.gutenberg_id}-h/${bookData.gutenberg_id}-h.htm`
            setReadingUrl(apiUrl)
            console.log('Using API gutenberg_id:', apiUrl)
          }
        } else {
          // If API returns null, create minimal book object with just the ID
          setBook({
            Title: `Book ${gutenbergId}`,
            gutenberg_id: parseInt(gutenbergId),
            source: 'gutenberg',
            Type: 'book'
          })
        }
      } catch (apiError) {
        // API call failed, but we can still show the book with default URL
        console.warn('API call failed, using default URL:', apiError)
        setBook({
          Title: `Book ${gutenbergId}`,
          gutenberg_id: parseInt(gutenbergId),
          source: 'gutenberg',
          Type: 'book'
        })
      }
    } catch (error) {
      console.error('Error in loadBook:', error)
      // Even on error, set minimal book data so user can still read
      setBook({
        Title: `Book ${gutenbergId}`,
        gutenberg_id: parseInt(gutenbergId),
        source: 'gutenberg',
        Type: 'book'
      })
      setReadingUrl(`https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-h/${gutenbergId}-h.htm`)
    } finally {
      setLoading(false)
    }
  }

  // Define displayBook for use in component - fallback to minimal object if API fails
  const displayBook = book || {
    Title: `Book ${gutenbergId}`,
    gutenberg_id: parseInt(gutenbergId),
    source: 'gutenberg',
    Type: 'book'
  }

  const handleDownload = (format) => {
    if (displayBook?.download_links?.[format]) {
      window.open(displayBook.download_links[format], '_blank')
    }
  }

  const handleSectionClick = (sectionId) => {
    const iframe = document.querySelector('.book-iframe')
    if (iframe && iframe.contentWindow) {
      try {
        // Try to scroll to section in iframe
        const element = iframe.contentDocument?.getElementById(sectionId) ||
                       iframe.contentDocument?.querySelector(`a[name="${sectionId}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          // Try to find anchor link and click it
          const link = iframe.contentDocument?.querySelector(`a[href="#${sectionId}"]`)
          if (link) {
            link.click()
          }
        }
      } catch (e) {
        // Cross-origin or other error - just update state
        console.log('Could not navigate to section in iframe:', e)
      }
    }
    setCurrentSection(sectionId)
  }

  const extractSectionsFromIframe = () => {
    const iframe = document.querySelector('.book-iframe')
    if (!iframe || !iframe.contentDocument) return

    try {
      const doc = iframe.contentDocument
      // Try to find common section/chapter patterns
      const headings = doc.querySelectorAll('h1, h2, h3, h4, .chapter, .section, [id*="chapter"], [id*="section"], [id*="Chapter"], [id*="Section"]')
      const extractedSections = []
      
      headings.forEach((heading, index) => {
        const id = heading.id || `section-${index}`
        const text = heading.textContent.trim()
        if (text && text.length < 100) { // Only include reasonable length headings
          extractedSections.push({
            id,
            title: text,
            element: heading
          })
        }
      })

      if (extractedSections.length > 0) {
        setSections(extractedSections)
      } else {
        // Create generic sections if none found
        setSections([
          { id: 'top', title: 'Top of Book' },
          { id: 'middle', title: 'Middle' },
          { id: 'end', title: 'End of Book' }
        ])
      }
    } catch (e) {
      // Cross-origin error - create generic sections
      console.log('Cannot access iframe content (CORS):', e)
      setSections([
        { id: 'top', title: 'Top' },
        { id: 'middle', title: 'Middle' },
        { id: 'end', title: 'End' }
      ])
    }
  }

  const handleQuit = () => {
    if (showQuitConfirm) {
      navigate('/manga')
    } else {
      setShowQuitConfirm(true)
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowQuitConfirm(false), 3000)
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

  // Only show error if we don't have a reading URL AND don't have book data
  if (!book && !readingUrl) {
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
          <h1>{displayBook.Title || `Book ${gutenbergId}`}</h1>
          {displayBook.author && <p className="book-author">By {displayBook.author}</p>}
        </div>
        <div className="book-actions">
          {displayBook.download_links?.epub && (
            <button 
              className="download-btn"
              onClick={() => handleDownload('epub')}
              title="Download EPUB"
            >
              📥 EPUB
            </button>
          )}
          {displayBook.download_links?.txt && (
            <button 
              className="download-btn"
              onClick={() => handleDownload('txt')}
              title="Download TXT"
            >
              📥 TXT
            </button>
          )}
          {/* Always show link to Project Gutenberg */}
          <a 
            href={`https://www.gutenberg.org/ebooks/${gutenbergId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="download-btn"
            style={{ textDecoration: 'none', marginLeft: '10px' }}
            title="View on Project Gutenberg"
          >
            📚 Gutenberg
          </a>
          <button 
            className={`quit-btn ${showQuitConfirm ? 'confirm' : ''}`}
            onClick={handleQuit}
            title={showQuitConfirm ? 'Click again to quit' : 'Quit reading'}
          >
            {showQuitConfirm ? '✓ Confirm Quit' : '✕ Quit'}
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="book-sections-nav">
        {sections.length > 0 ? (
          <div className="sections-scroll">
            {sections.map((section, index) => (
              <button
                key={section.id || index}
                className={`section-btn ${currentSection === section.id ? 'active' : ''}`}
                onClick={() => handleSectionClick(section.id)}
                title={section.title}
              >
                {section.title}
              </button>
            ))}
          </div>
        ) : (
          <div className="sections-scroll">
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', padding: '8px 0' }}>
              No sections detected. Click "Extract Sections" to find chapters.
            </span>
          </div>
        )}
        <button 
          className="extract-sections-btn"
          onClick={extractSectionsFromIframe}
          title="Extract sections from book"
        >
          📑 Extract Sections
        </button>
      </div>

      {/* Book Info Bar */}
      <div className="book-info-bar">
        {displayBook.Year && displayBook.Year !== 'N/A' && (
          <span className="info-badge">Published: {displayBook.Year}</span>
        )}
        {displayBook.download_count > 0 && (
          <span className="info-badge">Downloads: {displayBook.download_count.toLocaleString()}</span>
        )}
        {displayBook.genres && displayBook.genres.length > 0 && (
          <div className="genres-list">
            {displayBook.genres.slice(0, 3).map((genre, i) => (
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
              title={displayBook.Title || `Book ${gutenbergId}`}
            allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              onLoad={(e) => {
                console.log('Iframe loaded successfully:', readingUrl)
                // Try to extract sections after iframe loads
                setTimeout(() => {
                  extractSectionsFromIframe()
                }, 1000)
              }}
            onError={(e) => {
              console.error('Iframe load error, trying alternative URL')
              // Try alternative URL format if iframe fails
                const bookId = displayBook.gutenberg_id || gutenbergId
                const altUrl1 = `https://www.gutenberg.org/files/${bookId}/${bookId}/${bookId}-h.htm`
                const altUrl2 = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}-images.html`
                
                console.log('Trying alternative URL 1:', altUrl1)
                if (e.target.src !== altUrl1) {
                  e.target.src = altUrl1
                } else {
                  console.log('Trying alternative URL 2:', altUrl2)
                  e.target.src = altUrl2
              }
            }}
          />
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', marginTop: '10px', borderRadius: '5px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '5px 0' }}>
                If the book doesn't load in the reader above, you can:
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
                <a 
                  href={readingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#007bff', textDecoration: 'underline', fontSize: '12px' }}
                >
                  Open in new tab →
                </a>
                <a 
                  href={`https://www.gutenberg.org/ebooks/${gutenbergId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#007bff', textDecoration: 'underline', fontSize: '12px' }}
                >
                  View on Project Gutenberg →
                </a>
              </div>
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

