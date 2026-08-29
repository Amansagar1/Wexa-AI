import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function PathVisualizer({ pathData }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: 600
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 600
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
      properties: n.properties,
      val: 1.5
    })),
    links: pathData.edges.map(e => ({
      source: e.source,
      target: e.target,
      label: e.type.replace(/_/g, ' '),
    }))
  };

  const getNodeColor = (group) => {
    switch(group) {
      case 'Person': return { main: '#3b82f6', light: '#93c5fd' }; // Blue (like screenshot)
      case 'Company': return { main: '#10b981', light: '#6ee7b7' }; // Green
      case 'Skill': return { main: '#ef4444', light: '#fca5a5' }; // Red
      default: return { main: '#64748b', light: '#cbd5e1' };
    }
  };

  return (
    <div className="path-result-container animate-fade-in-up" ref={containerRef} style={{ width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', padding: 0, marginTop: '2rem', position: 'relative' }}>
      
      {/* Legend Overlay (Like Neo4j Browser) */}
      <div style={{ position: 'absolute', top: 15, left: 15, zIndex: 10, background: 'rgba(20,25,40,0.85)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', color: 'white', minWidth: '180px' }}>
        <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: '600' }}>Node Labels</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.5)' }}></div>
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Person</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.5)' }}></div>
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Skill</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.5)' }}></div>
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Company</span>
        </div>
        
        <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: '600' }}>Relationships</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.4)' }}></div>
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>KNOWS_PERSON</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.4)' }}></div>
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>KNOWS_SKILL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.4)' }}></div>
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>WORKED_AT</span>
        </div>
      </div>

      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeRelSize={8}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkWidth={1.5}
        backgroundColor="#0b0f19"
        d3VelocityDecay={0.3}
        
        // Rich Tooltip on Hover
        nodeLabel={(node) => `
          <div style="background: rgba(15,20,30,0.95); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-family: Inter, sans-serif; color: white;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${node.name || 'Unknown'}</div>
            <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Type: <span style="color: #38bdf8;">${node.group || 'Unknown'}</span></div>
            ${Object.entries(node.properties || {}).filter(([k]) => k !== 'name').map(([k, v]) => 
              `<div style="font-size: 11px; margin-top: 2px;"><strong style="color: #cbd5e1;">${k}:</strong> ${v}</div>`
            ).join('')}
          </div>
        `}
        
        // Draw Text on Links
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={(link, ctx, globalScale) => {
          if (!link.source || !link.target || typeof link.source !== 'object' || typeof link.target !== 'object' || typeof link.source.x !== 'number') return;
          
          const MAX_FONT_SIZE = 4;
          const label = link.label;
          const fontSize = Math.min(MAX_FONT_SIZE, 12 / globalScale);
          ctx.font = `${fontSize}px Inter, Sans-Serif`;
          
          const textPos = {
            x: link.source.x + (link.target.x - link.source.x) / 2,
            y: link.source.y + (link.target.y - link.source.y) / 2
          };
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText(label, textPos.x, textPos.y);
        }}
        
        // Custom 3D Nodes and Labels
        nodeCanvasObject={(node, ctx, globalScale) => {
          if (!node || typeof node.x !== 'number' || typeof node.y !== 'number') return;
          
          const label = node.name || '';
          const fontSize = 12 / globalScale;
          const colors = getNodeColor(node.group);
          const r = 8;
          
          // Draw 3D Sphere Node
          const gradient = ctx.createRadialGradient(node.x - r/3, node.y - r/3, r/10, node.x, node.y, r);
          gradient.addColorStop(0, colors.light);
          gradient.addColorStop(1, colors.main);
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = gradient;
          
          // Outer Glow
          ctx.shadowColor = colors.main;
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0; // Reset
          
          // Draw Text below node
          ctx.font = `600 ${fontSize}px Inter, Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillText(label, node.x, node.y + r + (4/globalScale));
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          if (!node || typeof node.x !== 'number' || typeof node.y !== 'number') return;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
      />
    </div>
  );
}
