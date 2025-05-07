import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import useProductStore from './useProductStore';
import { toast } from 'react-hot-toast';

const cartStore = (set, get) => ({
  carrinho: [],

  addToCart: (produto) => {
    const { carrinho } = get();

    const productsFromStore = useProductStore.getState().products;
    const produtoOriginal = productsFromStore.find((p) => p._id === produto._id);

    if (!produtoOriginal) {
      toast.error(`Tentativa de adicionar produto não encontrado no store: ${produto._id}`);
      return;
    }

    if (produtoOriginal.status !== 'ativo') {
      toast.error(`Produto "${produto.name}" está inativo.`);
      return;
    }

    if (produtoOriginal.stock <= 0) {
      toast.error(`Produto "${produto.name}" está esgotado.`);
      return;
    }
    const itemExistente = carrinho.find((item) => item._id === produto._id);
    const quantidadeNoCarrinho = itemExistente ? itemExistente.quantity : 0;

    if (quantidadeNoCarrinho >= produtoOriginal.stock) {
      toast.error(`Quantidade máxima em estoque atingida para o produto "${produto.name}".`);
      return;
    }

    let novoCarrinho;
    if (itemExistente) {
      novoCarrinho = carrinho.map((item) =>
        item._id === produto._id ? { ...item, quantity: item.quantity + 1 } : item,
      );
    } else {
      const { _id, name, price, image } = produtoOriginal;
      novoCarrinho = [...carrinho, { _id, name, price, image, quantity: 1 }];
    }

    set({ carrinho: novoCarrinho });

    useProductStore.getState().decrementStock(produto._id);
  },

  removeFromCart: (produtoId) => {
    const { carrinho } = get();
    const itemExistente = carrinho.find((item) => item._id === produtoId);
    if (!itemExistente) return;

    let novoCarrinho;
    if (itemExistente.quantity > 1) {
      novoCarrinho = carrinho.map((item) => (item._id === produtoId ? { ...item, quantity: item.quantity - 1 } : item));
    } else {
      novoCarrinho = carrinho.filter((item) => item._id !== produtoId);
    }

    set({ carrinho: novoCarrinho });
    useProductStore.getState().incrementStock(produtoId);
  },

  removeCartItem: (produtoId) => {
    const itemRemovido = get().carrinho.find((item) => item._id === produtoId);
    set((state) => ({
      carrinho: state.carrinho.filter((item) => item._id !== produtoId),
    }));

    if (itemRemovido) {
      useProductStore.getState().incrementStock(produtoId);
    }
  },

  clearCart: () => {
    set({ carrinho: [] });
  },

  getTotalItens: () => get().carrinho.reduce((acc, item) => acc + item.quantity, 0),
  getTotalCarrinho: () => get().carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0),
});

const useCartStore = create(
  devtools(
    persist(cartStore, {
      name: 'cart-storage',
    }),
    { name: 'Cart Store' },
  ),
);

export default useCartStore;
