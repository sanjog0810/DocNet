export const getAuthToken = () => localStorage.getItem('docnet_token');

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};
