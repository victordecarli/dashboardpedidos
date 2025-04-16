// src/services/orderService.js
import { api } from './api';

// Criar pedido
export const createOrder = async (data) => {
  return await api.post('/orders', data);
};

// Buscar pedidos do usuário autenticado
export const getOrdersByUser = () => {
  return api.get('/orders/user');
};

// Buscar pedido por ID (admin ou usuário)
export const getOrderById = (id) => {
  return api.get(`/orders/${id}`);
};

// Buscar todos os pedidos (admin)
export const getAllOrders = () => {
  return api.get('/orders');
};

// Atualizar pedido (admin)
export const updateOrder = (orderId, data) => {
  return api.patch(`/orders/${orderId}`, data);
};

// Deletar pedido (admin)
export const deleteOrder = (id) => {
  return api.delete(`/orders/${id}`);
};
