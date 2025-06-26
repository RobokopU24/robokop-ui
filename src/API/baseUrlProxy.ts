import axios from 'axios';

export const api = axios.create({
  //TODO: replace with your actual base URL
  baseURL: 'http://localhost:5173/',
});

export const authApi = axios.create({
  baseURL: 'https://localhost:4000/api',
  withCredentials: true,
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
