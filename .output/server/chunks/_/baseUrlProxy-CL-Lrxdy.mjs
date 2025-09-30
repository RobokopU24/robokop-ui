import axios from 'axios';
import { b as baseAPI, a as baseAuthURL } from './AlertProvider-wxvwEFCh.mjs';

const api = axios.create({
  //TODO: replace with your actual base URL
  baseURL: baseAPI
});
const authApi = axios.create({
  baseURL: baseAuthURL,
  withCredentials: true
});
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { authApi as a, api as b };
//# sourceMappingURL=baseUrlProxy-CL-Lrxdy.mjs.map
