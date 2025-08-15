import axios from 'axios';

const api = axios.create({
  baseURL: 'https://spliter-gr0z.onrender.com', // Adjust the base URL as needed
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
