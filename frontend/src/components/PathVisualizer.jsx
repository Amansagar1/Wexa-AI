import React from 'react';

export default function PathVisualizer({ pathData }) {
  if (!pathData) return null;
  if (!pathData.nodes || pathData.nodes.length === 0) {
    return <p className="empty-state">No path found between these nodes.</p>;
  }

  return (
    <div className="path-result-container animate-fade-in-up">
      <h3 className="path-result-title">Connection Path</h3>
      <div className="path-nodes-list">
        {pathData.nodes.map((node, index) => {
          const edgeToNext = pathData.edges.find(
            e => e.source === node.id && (pathData.nodes[index + 1] && e.target === pathData.nodes[index + 1].id) ||
                 e.target === node.id && (pathData.nodes[index + 1] && e.source === pathData.nodes[index + 1].id)
          );
          
          const isPerson = node.type === 'Person';
          const isCompany = node.type === 'Company';
          
          const avatarClass = isPerson ? 'avatar-person' : 
                              isCompany ? 'avatar-company' : 'avatar-skill';
                               
          return (
            <React.Fragment key={`path-${node.id}`}>
              {/* Node Representation */}
              <div className="path-node-item">
                <div className={`path-avatar ${avatarClass}`}>
                  {node.properties.name ? node.properties.name.charAt(0) : '?'}
                </div>
                <div>
                  <h4 className="path-node-title">{node.properties.name}</h4>
                  <span className="path-node-subtitle">{node.type}</span>
                </div>
              </div>

              {/* Edge Representation */}
              {index < pathData.nodes.length - 1 && edgeToNext && (
                <div className="path-edge-item">
                  <div className="path-edge-line"></div>
                  <div className="path-edge-label">
                    {edgeToNext.type.replace(/_/g, ' ')}
                  </div>
                  <div className="path-edge-line"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
