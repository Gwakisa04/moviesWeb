import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Library from './pages/Library'
import Manga from './pages/Manga'
import Music from './pages/Music'
import MovieDetail from './components/MovieDetail'
import BookReader from './components/BookReader'
import BottomNavigation from './components/BottomNavigation'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/library" element={<Library />} />
            <Route path="/manga" element={<Manga />} />
            <Route path="/music" element={<Music />} />
            <Route path="/movie/:imdbId" element={<MovieDetail />} />
            <Route path="/book/:gutenbergId" element={<BookReader />} />
          </Routes>
        </div>
        <BottomNavigation />
      </div>
    </Router>
  )
}

export default App

