export const API_BASE = 'https://wexa-ai-backend.vercel.app/api';

export const URLS = {
  SEARCH: `${API_BASE}/search`,
  RECOMMEND: (personId) => `${API_BASE}/recommend/${encodeURIComponent(personId)}`,
  PATH: `${API_BASE}/path`,
};
