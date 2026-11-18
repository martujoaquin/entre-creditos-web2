import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:3000/api' });
api.interceptors.request.use((config) => { const token = sessionStorage.getItem('entre-creditos-token'); if (token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) config.headers.Authorization = `Bearer ${token}`; return config; });
export default api;
