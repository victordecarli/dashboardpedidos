import { api } from './api';

// Login de usuário
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response;
  } catch (error) {
    // Retorna erro mais informativo, se possível
    throw error.response?.data || error;
  }
};

// Registro de novo usuário
export const register = async (data) => {
  return await api.post('/auth/register', data);
};
