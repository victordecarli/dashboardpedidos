import { api } from "./api";

// Listar produtos (visível para todos)
export const getProducts = () => {
  return api.get("/products");
};

// Listar produtos por ID (visível para todos)
export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

// Criar produto (admin)
export const createProduct = async (productData) => {
  return api.post("/products", productData);
};

// Atualizar produto (admin)
export const updateProduct = (id, productData) => {
  return api.patch(`/products/${id}`, productData);
};

// Deletar produto (admin)
export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

// Alternar status do produto (admin)
export const toggleProductStatus = (id) => {
  return api.patch(`/products/${id}/status`);
};