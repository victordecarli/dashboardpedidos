// src/services/orderService.js
import { api } from "./api";

export const createOrder = async (data) => {
  return api.post("/orders", data);
};

export const getOrders = async () => {
  return api.get("/orders");
};

export const getOrderById = async (id) => {
  return api.get(`/orders/${id}`);
};

export const getUserOrders = async () => {
  return api.get("/orders/user");
};


export const getAllOrders = async () => {
  return api.get("/orders");
};

export const updateOrder = async (orderId, data) => {
  return api.patch(`/orders/${orderId}`, data);
};