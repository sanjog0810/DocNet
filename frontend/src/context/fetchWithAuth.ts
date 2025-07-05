// 
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const getAuthToken = () => localStorage.getItem('docnet_token');

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};
