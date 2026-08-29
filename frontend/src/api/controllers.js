import { URLS } from './urls';

export const apiControllers = {
  searchNodes: async (query) => {
    const res = await fetch(`${URLS.SEARCH}?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to fetch from backend');
    return res.json();
  },
  
  getRecommendations: async (personId, skill) => {
    try {
      const response = await fetch(`${URLS.RECOMMEND(personId)}?skill=${encodeURIComponent(skill)}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },
  
  findShortestPath: async (startId, endId) => {
    const res = await fetch(`${URLS.PATH}?start_id=${encodeURIComponent(startId)}&end_id=${encodeURIComponent(endId)}`);
    if (!res.ok) throw new Error('Failed to find path');
    return res.json();
  },

  createNode: async (nodeData) => {
    try {
      const response = await fetch(URLS.CREATE_NODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nodeData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create node');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating node:', error);
      throw error;
    }
  }
};
