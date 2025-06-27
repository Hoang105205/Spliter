import axios from 'axios';

const baseURL = 'https://spliter-gr0z.onrender.com' // URL production trên Render

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;