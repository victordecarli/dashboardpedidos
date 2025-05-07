import { api } from './api';

// Listar produtos (visível para todos ou todos os produtos se admin)
export const getProducts = async (all = false) => {
  try {
    const url = all ? '/products?all=true' : '/products';
    const res = await api.get(url);
    return res;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

// Listar produtos por ID (visível para todos)
export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

// Criar produto (admin)
export const createProduct = async (productData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return api.post('/products', productData, config);
};

// Atualizar produto (admin)
export const updateProduct = async (id, productData) => {
  // Se productData for um FormData, significa que estamos enviando um arquivo
  const isFormData = productData instanceof FormData;

  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

  return api.patch(`/products/${id}`, productData, config);
};

// Visualizar produto (visível para todos)
export const viewProduct = async (id) => {
  return api.get(`/products/${id}`);
};

// Produtos mais vendidos
export const getMostSoldProducts = async () => {
  return api.get('/products/most-sold');
};

// Deletar produto (admin)
export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

// Alternar status do produto (admin)
export const toggleProductStatus = (id) => {
  return api.patch(`/products/${id}/status`);
};
