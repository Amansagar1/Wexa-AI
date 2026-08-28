import React from 'react';

export default function SearchBox({ searchQuery, setSearchQuery, handleSearch, loading }) {
  return (
    <form onSubmit={handleSearch} className="search-form">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search for a person, company, or skill..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button 
          type="submit" 
          disabled={loading}
          className={`search-submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <div className="loader small"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
