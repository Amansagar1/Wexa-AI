import { useState } from 'react';
import SearchBox from './components/SearchBox';
import NodeCard from './components/NodeCard';
import PathVisualizer from './components/PathVisualizer';
import { apiControllers } from './api/controllers';

// Default target skill for recommendations
const TARGET_SKILL = "React";

function App() {
  const [viewMode, setViewMode] = useState('explore'); // explore, path
  
  // Explore State
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Recommend State
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  
  // Path State
  const [pathStartId, setPathStartId] = useState('');
  const [pathEndId, setPathEndId] = useState('');
  const [pathData, setPathData] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedPerson(null);
    setViewMode('explore');
    
    try {
      const data = await apiControllers.searchNodes(searchQuery);
      setResults(data.results);
    } catch (err) {
      setError("Cannot connect to database. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async (person) => {
    setSelectedPerson(person);
    setRecLoading(true);
    // Smooth scroll up
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const data = await apiControllers.getRecommendations(person.id, TARGET_SKILL);
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleFindPath = async (e) => {
    e.preventDefault();
    if (!pathStartId.trim() || !pathEndId.trim()) return;
    
    setPathLoading(true);
    setPathError(null);
    setPathData(null);
    
    try {
      const data = await apiControllers.findShortestPath(pathStartId, pathEndId);
      if (data.path) {
        setPathData(data.path);
      } else {
        setPathError(data.message || "No path found.");
      }
    } catch (err) {
      setPathError("Failed to calculate path. Ensure node IDs are correct.");
    } finally {
      setPathLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container animate-fade-in-down">
        <h1 className="main-title">Six Degrees of Tech</h1>
        <p className="subtitle">Explore connections between People, Companies, and Skills in the Graph.</p>
        
        <div className="view-mode-container">
          <button 
            className={viewMode === 'explore' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setViewMode('explore')}
          >
            Explore Network
          </button>
          <button 
            className={viewMode === 'path' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => {
              setViewMode('path');
              setSelectedPerson(null);
            }}
          >
            Find Shortest Path
          </button>
        </div>
      </div>

      {viewMode === 'explore' && !selectedPerson && (
        <div className="animate-fade-in-up">
          <SearchBox 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            handleSearch={handleSearch} 
            loading={loading} 
          />
          
          {error && <p className="error-text">{error}</p>}

          {!loading && results.length > 0 && (
            <div className="grid-container">
              {results.map((node, i) => (
                <NodeCard key={node.id} node={node} onClick={loadRecommendations} index={i} />
              ))}
            </div>
          )}
          
          {!loading && results.length === 0 && searchQuery && !error && (
            <div className="glass-panel empty-state">
              <p>No results found for "{searchQuery}". Try a different term.</p>
            </div>
          )}
        </div>
      )}

      {selectedPerson && (
        <div className="animate-fade-in-up">
          <button onClick={() => setSelectedPerson(null)} className="btn-secondary mb-2rem">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Search
          </button>
          
          <div className="recommendation-header-flex">
            <div>
              <h2 className="section-title">Recommendations for {selectedPerson.name}</h2>
              <p className="subtitle">People who know <strong className="recommendation-target-text">{TARGET_SKILL}</strong> up to 2 degrees away.</p>
            </div>
            <span className="badge badge-target">Target: {TARGET_SKILL}</span>
          </div>
          
          {recLoading ? (
            <div className="loader-container"><div className="loader"></div></div>
          ) : (
            <div className="grid-container">
              {recommendations.length === 0 ? (
                <div className="glass-panel empty-state" style={{ gridColumn: '1 / -1' }}>
                  <p>No recommendations found within 2 degrees.</p>
                </div>
              ) : null}
              {recommendations.map((rec, i) => (
                <NodeCard key={rec.id} node={{ ...rec, type: 'Person' }} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'path' && (
        <div className="animate-fade-in-up path-container">
          <div className="glass-panel path-result-container mt-2rem">
            <h2 className="section-title center-text mb-2rem">Shortest Path Visualizer</h2>
            <p className="subtitle center-text mb-2rem">Enter two Node IDs to find the shortest relational path between them.</p>
            
            <form onSubmit={handleFindPath} className="path-form">
              <div className="path-inputs-row">
                <div className="path-input-group">
                  <label className="path-label">Start Node ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 4:91bd..." 
                    value={pathStartId} 
                    onChange={(e) => setPathStartId(e.target.value)}
                    required
                    className="path-input"
                  />
                </div>
                <div className="path-input-group">
                  <label className="path-label">End Node ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 4:91bd..." 
                    value={pathEndId} 
                    onChange={(e) => setPathEndId(e.target.value)}
                    required
                    className="path-input"
                  />
                </div>
              </div>
              <div className="center-text mt-2rem">
                <button type="submit" disabled={pathLoading} className="btn-primary">
                  {pathLoading ? <div className="loader small"></div> : 'Calculate Path'}
                </button>
              </div>
            </form>
          </div>

          {pathError && <p className="error-text">{pathError}</p>}
          
          <PathVisualizer pathData={pathData} />
        </div>
      )}
    </div>
  );
}

export default App;
