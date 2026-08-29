import React, { useState } from 'react';
import { apiControllers } from '../api/controllers';
import { toast } from 'react-hot-toast';

export default function AddNodeForm({ onNodeAdded }) {
  const [formData, setFormData] = useState({
    type: 'Person',
    name: '',
    role: '',
    industry: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await apiControllers.createNode(formData);
      toast.success(res.message || 'Node created successfully!');
      setFormData({ type: 'Person', name: '', role: '', industry: '' }); // Reset form
      if (onNodeAdded) onNodeAdded(res.node);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create node');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel add-node-panel animate-fade-in-up" style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 600 }}>Create New Node</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'flex-start' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Type</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
            className="search-input"
            style={{ padding: '10px 16px' }}
          >
            <option value="Person">Person</option>
            <option value="Company">Company</option>
            <option value="Skill">Skill</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Name (Required)</label>
            <input 
              type="text" 
              placeholder="e.g. Aman Sagar, OpenAI, Python"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="search-input"
              style={{ padding: '10px 16px' }}
              required
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {formData.type === 'Person' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Role (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Software Engineer"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="search-input"
                  style={{ padding: '10px 16px' }}
                />
              </div>
            )}
            
            {(formData.type === 'Company' || formData.type === 'Person') && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Industry (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Technology"
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                  className="search-input"
                  style={{ padding: '10px 16px' }}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ alignSelf: 'flex-start', marginTop: '22px' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Creating...' : 'Create Node'}
          </button>
        </div>

      </form>
    </div>
  );
}
