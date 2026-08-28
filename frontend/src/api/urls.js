export const API_BASE = 'http://localhost:8000/api';

export const URLS = {
  SEARCH: `${API_BASE}/search`,
  RECOMMEND: (personId) => `${API_BASE}/recommend/${encodeURIComponent(personId)}`,
  PATH: `${API_BASE}/path`,
};
