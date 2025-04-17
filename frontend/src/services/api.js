import axios from 'axios';
import { getAuthToken, clearAuth } from '../utils/authStorage';

// Função para obter variáveis de ambiente, com fallback para as variáveis definidas em runtime
const getEnvVariable = (key) => {
  // 1. Tenta obter do import.meta.env (definido em tempo de build pelo Vite)
  if (import.meta.env[key]) {
    return import.meta.env[key];
  }

  // 2. Tenta obter do objeto ENV em runtime (definido em public/config.js)
  if (window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }

  // 3. Fallback para localhost
  return null;
};

// Determina a URL base da API dinamicamente
const getCurrentHost = () => {
  const configuredUrl = getEnvVariable('VITE_API_URL');
  if (configuredUrl) {
    return configuredUrl;
  }

  // Fallback para ambiente de desenvolvimento
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3030/api';
  }

  // Para produção - caso não haja configuração
  // assume que a API está no mesmo domínio que o frontend mas na rota /api
  return `${window.location.origin}/api`;
};

const getCurrentServerUrl = () => {
  const configuredUrl = getEnvVariable('VITE_SERVER_URL');
  if (configuredUrl) {
    return configuredUrl;
  }

  // Fallback para ambiente de desenvolvimento
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3030';
  }

  // Para produção - caso não haja configuração
  // assume que o servidor está no mesmo domínio que o frontend
  return window.location.origin;
};

const API_URL = getCurrentHost();
const SERVER_URL = getCurrentServerUrl();

// console.log('API URL:', API_URL);
// console.log('SERVER URL:', SERVER_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para obter a URL completa de uma imagem
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Remover a barra inicial se existir para evitar dupla barra
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${SERVER_URL}/${cleanPath}`;
};

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
