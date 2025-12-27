import React from 'react'
import './ContentTabs.css'

const ContentTabs = ({ activeTab, onTabChange }) => {
  const tabs = ['Movies', 'TV Series', 'Anime', 'Music Video']

  return (
    <div className="content-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export default ContentTabs

