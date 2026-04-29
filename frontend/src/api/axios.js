import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  // withCredentials tells the browser to include httpOnly cookies on every
  // request to the backend — the frontend never reads the token itself.
  // This replaces the old Authorization header interceptor that read
  // the JWT from localStorage (which was vulnerable to XSS).
  withCredentials: true
});

export default api;
