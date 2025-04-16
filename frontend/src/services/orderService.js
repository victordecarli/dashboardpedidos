// src/services/orderService.js
import { api } from './api';

// Configuração de timeout para requisições
const TIMEOUT = 10000; // 10 segundos

// Função helper para tratamento de erros
const handleRequestError = (error) => {
  // Log do erro para debugging
  console.error('Erro na requisição:', error);

  // Personaliza a mensagem de erro baseado no tipo
  if (error.code === 'ECONNABORTED') {
    throw new Error('A requisição excedeu o tempo limite. Tente novamente.');
  }

  if (!error.response) {
    throw new Error('Erro de conexão com o servidor. Verifique sua internet.');
  }

  // Retorna o erro da API se disponível, ou um erro genérico
  const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao processar sua solicitação';
  throw new Error(errorMessage);
};

// Criar pedido
export const createOrder = async (data) => {
  try {
    return await api.post('/orders', data, { timeout: TIMEOUT });
  } catch (error) {
    handleRequestError(error);
  }
};

// Buscar pedidos do usuário autenticado
export const getOrdersByUser = async () => {
  try {
    return await api.get('/orders/user', { timeout: TIMEOUT });
  } catch (error) {
    handleRequestError(error);
  }
};

// Buscar pedido por ID (admin ou usuário)
export const getOrderById = async (id) => {
  try {
    return await api.get(`/orders/${id}`, { timeout: TIMEOUT });
  } catch (error) {
    handleRequestError(error);
  }
};

// Buscar todos os pedidos (admin)
export const getAllOrders = async () => {
  try {
    return await api.get('/orders', { timeout: TIMEOUT });
  } catch (error) {
    handleRequestError(error);
  }
};

// Atualizar pedido (admin)
export const updateOrder = async (orderId, data) => {
  try {
    return await api.patch(`/orders/${orderId}`, data, { timeout: TIMEOUT });
  } catch (error) {
    handleRequestError(error);
  }
};

// Deletar pedido (admin)
export const deleteOrder = async (id) => {
  try {
    return await api.delete(`/orders/${id}`, { timeout: TIMEOUT });
  } catch (error) {
    handleRequestError(error);
  }
};
