import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getProducts as FetchAllProducts } from '../services/productService';
import { viewProduct as FetchProductById } from '../services/productService';
import { getMostSoldProducts as FetchMostSoldProducts } from '../services/productService';
import { toast } from 'react-hot-toast';

const store = (set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  mostSoldProducts: [],

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

  viewProduct: async (productId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await FetchProductById(productId);
      set({ product: response.data || [], isLoading: false });
    } catch (err) {
      toast.error('Erro ao buscar produto no store:', err);
      const errorMessage = 'Erro ao carregar produto.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  calculateMostSoldProducts: (orders) => {
    const { products } = get();
    const productSales = new Map();

    orders.forEach((order) => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach((product) => {
          if (product && product.product_name) {
            const productName = product.product_name.trim();
            const quantity = product.quantity || 1;
            const currentCount = productSales.get(productName) || 0;
            productSales.set(productName, currentCount + quantity);
          }
        });
      }
    });

    const productsWithSales = Array.from(productSales.entries())
      .map(([productName, quantity]) => {
        const product = products.find((p) => p.name.trim() === productName);
        if (!product) {
          console.warn(`Produto não encontrado: ${productName}`);
          return null;
        }
        return {
          ...product,
          quantitySold: quantity,
        };
      })
      .filter(Boolean);

    const topProducts = productsWithSales.sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);

    set({ mostSoldProducts: topProducts });
    return topProducts;
  },

  setMostSoldProducts: (products) => {
    set({ mostSoldProducts: products });
  },
});

const useProductStore = import.meta.env.DEV ? create(devtools(store, { name: 'Product Store' })) : create(store);

export default useProductStore;
