import axios from 'axios';
import { getAuthToken } from '../utils/authStorage';

const API_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  const finalToken = token || getAuthToken();

  if (finalToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${finalToken}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Garante que o token esteja presente no axios assim que o app inicia
setAuthToken();
