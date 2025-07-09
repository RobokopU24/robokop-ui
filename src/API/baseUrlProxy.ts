import axios from 'axios';
import { baseAPI, baseAuthURL } from './routes';

export const api = axios.create({
  //TODO: replace with your actual base URL
  baseURL: baseAPI,
});

export const authApi = axios.create({
  baseURL: baseAuthURL,
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
