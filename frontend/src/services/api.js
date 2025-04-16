import axios from 'axios';
import { getAuthToken, clearAuth } from '../utils/authStorage';

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

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Verifica se é erro de token expirado ou inválido
    const isAuthError =
      error.response?.status === 401 &&
      (error.response?.data?.code === 'TOKEN_EXPIRED' || error.response?.data?.code === 'INVALID_TOKEN');

    if (isAuthError) {
      // Limpa a autenticação
      clearAuth();

      // Redireciona para a página de login se não estiver nela
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }

    return Promise.reject(error);
  },
);

// Garante que o token esteja presente no axios assim que o app inicia
setAuthToken();
