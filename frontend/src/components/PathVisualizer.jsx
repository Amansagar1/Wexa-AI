import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function PathVisualizer({ pathData }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: 500
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 500
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pathData]);

  if (!pathData) return null;
  if (!pathData.nodes || pathData.nodes.length === 0) {
    return <p className="empty-state">No path found between these nodes.</p>;
  }

  // Format data for ForceGraph
  const graphData = {
    nodes: pathData.nodes.map(n => ({
      id: n.id,
      name: n.properties.name,
      group: n.type,
      val: 1.5
    })),
    links: pathData.edges.map(e => ({
      source: e.source,
      target: e.target,
      label: e.type.replace(/_/g, ' '),
    }))
  };

  const getNodeColor = (node) => {
    switch(node.group) {
      case 'Person': return '#38bdf8'; // Cyan
      case 'Company': return '#fbbf24'; // Amber
      case 'Skill': return '#f472b6'; // Pink
      default: return '#94a3b8';
    }
  };

  return (
    <div className="path-result-container animate-fade-in-up" ref={containerRef} style={{ width: '100%', height: '500px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', padding: 0, marginTop: '2rem' }}>
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeColor={getNodeColor}
        nodeRelSize={8}
        linkColor={() => 'rgba(255,255,255,0.15)'}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkWidth={1.5}
        backgroundColor="#0b0f19" // Match dark theme
        d3VelocityDecay={0.3}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `600 ${fontSize}px Inter, Sans-Serif`;
          
          // Draw Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();
          
          // Outer Glow
          ctx.shadowColor = getNodeColor(node);
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0; // Reset
          
          // Draw text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillText(label, node.x, node.y + 12 + (2/globalScale));
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
      />
    </div>
  );
}
