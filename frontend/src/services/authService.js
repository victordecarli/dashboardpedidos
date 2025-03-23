import { api } from './api';

export const login = async (credentials) => {
  return api.post('/auth/login', credentials);
};

// Criação de usuário
export const register = (data) => {
  return api.post('/auth/register', data); // ou /users, depende da sua API
};
