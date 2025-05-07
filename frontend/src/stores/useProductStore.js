import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getProducts as FetchAllProducts } from '../services/productService';
import { toast } from 'react-hot-toast';

const store = (set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (includeAll = false) => {
    set({ isLoading: true, error: null });

    try {
      const response = await FetchAllProducts(includeAll);
      set({ products: response.data || [], isLoading: false });
    } catch (err) {
      toast.error('Erro ao buscar produtos no store:', err);
      const errorMessage = 'Erro ao carregar produtos.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateProductInList: (updatedProduct) => {
    set((state) => ({
      products: state.products.map((p) => (p._id === updatedProduct._id ? { ...p, ...updatedProduct } : p)),
    }));
  },
});

const useProductStore = import.meta.env.DEV ? create(devtools(store, { name: 'Product Store' })) : create(store);

export default useProductStore;
