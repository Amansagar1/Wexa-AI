import { URLS } from './urls';

export const apiControllers = {
  searchNodes: async (query) => {
    const res = await fetch(`${URLS.SEARCH}?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to fetch from backend');
    return res.json();
  },
  
  getRecommendations: async (personId, skill) => {
    const res = await fetch(`${URLS.RECOMMEND(personId)}?skill=${encodeURIComponent(skill)}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },
  
  findShortestPath: async (startId, endId) => {
    const res = await fetch(`${URLS.PATH}?start_id=${encodeURIComponent(startId)}&end_id=${encodeURIComponent(endId)}`);
    if (!res.ok) throw new Error('Failed to find path');
    return res.json();
  }
};
