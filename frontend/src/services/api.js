// config/api.js

const API_URLS = [
  'http://localhost:8080/api',
  'https://melodia-backend-production-0ad4.up.railway.app/api'
];

let API_URL = null;

async function detectAPI() {
  if (API_URL) return API_URL;
  
  for (const url of API_URLS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      await fetch(`${url}/auth/check/testuser`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      API_URL = url;
      return API_URL;
      
    } catch {
      continue;
    }
  }
  
  API_URL = API_URLS[0];
  return API_URL;
}

async function apiFetch(endpoint, options = {}) {
  const baseUrl = await detectAPI();
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
}

export const api = {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  
  post: (endpoint, data) => apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  put: (endpoint, data) => apiFetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
  
  getURL: async () => await detectAPI(),
  
  reset: () => { API_URL = null; }
};

export { API_URL };
