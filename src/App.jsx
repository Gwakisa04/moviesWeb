import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Library from './pages/Library'
import Profile from './pages/Profile'
import MovieDetail from './components/MovieDetail'
import BottomNavigation from './components/BottomNavigation'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/movie/:imdbId" element={<MovieDetail />} />
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  )
}

export default App

