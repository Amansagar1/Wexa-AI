import React from 'react';
import { toast } from 'react-hot-toast';

export default function NodeCard({ node, onClick, index, customStyle = {} }) {
  const isPerson = node.type === 'Person';
  
  // Badge styling logic
  let badgeClass = "badge-person";
  if (node.type === 'Skill') badgeClass = "badge-skill";
  if (node.type === 'Company') badgeClass = "badge-company";
  
  return (
    <div 
      className={`glass-panel node-card animate-fade-in-up ${isPerson ? 'clickable' : ''}`}
      style={{ 
        animationDelay: `${index * 0.05}s`,
        ...customStyle
      }} 
      onClick={() => isPerson && onClick && onClick(node)}
    >
      <div className="node-header">
        <div>
          <h3 className="node-title">
            {node.name}
          </h3>
          <p className="node-subtitle">
            {node.role || node.industry || 'Tech Skill'}
          </p>
        </div>
        <span className={`badge ${badgeClass}`}>
          {node.type}
        </span>
      </div>
      
      {isPerson && onClick && (
        <div className="view-connections-link">
          <span>View connections</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      )}

      {/* Node ID display for Path Visualizer */}
      <div 
        className="node-id-tag" 
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(node.id);
          toast.success('ID copied to clipboard!', { style: { background: '#1e293b', color: '#f8fafc' }});
        }}
        title="Click to copy ID"
      >
        <span className="id-label">ID:</span> {node.id}
      </div>
      
      {/* Show mutual connections if available */}
      {node.mutual_connections !== undefined && (
        <div className="mutual-connections-badge">
          {node.mutual_connections} mutual connection{node.mutual_connections !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
