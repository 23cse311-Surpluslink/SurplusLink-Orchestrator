import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL||"https://surpluslink-9fq6.onrender.com/api/v1 ",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
