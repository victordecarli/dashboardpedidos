import { api } from './api';

// Listar todos os usuários (Admin)
export const getAllUsers = () => {
  return api.get('/users');
};

// Listar todos usuários por id (Admin)
export const getUserById = (id) => {
  return api.get(`/users/${id}`);
};

// Criar novo usuário (registro público)
export const createUser = (data) => {
  return api.post('/auth/register', data); // <-- alterado
};

// Atualizar usuário (Admin)
export const updateUser = (id, data) => {
  return api.patch(`/users/${id}`, data);
};

// Deletar usuário
export const deleteUser = async (id) => {
  return api.delete(`/users/${id}`);
};
