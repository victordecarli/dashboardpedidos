import { useEffect, useState, useCallback } from 'react';
import { getProducts as fetchAllProducts, updateProduct } from '../services/productService';
import { createOrder } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import ConfirmDialog from '../components/ConfirmDialog';
import { getUserRole } from '../utils/auth';
import EditProductModal from '../components/EditProductModal';
import { Switch } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import {
  ListBulletIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  TagIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState();
  const [editProduct, setEditProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [viewMode, setViewMode] = useState('grid');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [priceSort, setPriceSort] = useState(null);

  const navigate = useNavigate();
  const isAdmin = getUserRole()?.toLowerCase() === 'admin';

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    const url = isAdmin ? '/products?all=true' : '/products';
    fetchAllProducts(url)
      .then((res) => {
        setProducts(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar produtos');
        setIsLoading(false);
      });
  }, [isAdmin]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const adicionarAoCarrinho = (produto) => {
    const existe = carrinho.find((item) => item._id === produto._id);
    const quantidadeAtual = existe ? existe.quantity : 0;

    if (quantidadeAtual >= produto.stock) {
      toast.error(`❌ Estoque máximo atingido para: ${produto.name}`);
      return;
    }

    const novoCarrinho = existe
      ? carrinho.map((item) => (item._id === produto._id ? { ...item, quantity: item.quantity + 1 } : item))
      : [...carrinho, { ...produto, quantity: 1 }];

    const novaQuantidadeTotal = quantidadeAtual + 1;
    const novoEstoqueRestante = produto.stock - novaQuantidadeTotal;

    setCarrinho(novoCarrinho);
    setCarrinhoAberto(true);
    toast.success(`Adicionado ao carrinho: ${produto.name}`);

    if (novoEstoqueRestante === 0) {
      updateProduct(produto._id, { active: false }).then(() => {
        fetchProducts();
      });
    }
  };

  const salvarEdicaoProduto = async (dadosAtualizados) => {
    try {
      await updateProduct(editProduct._id, dadosAtualizados);
      setEditModalOpen(false);
      setEditProduct(null);
      await fetchProducts();
      toast.success('Produto atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar produto');
    }
  };

  const removerDoCarrinho = (produtoId) => {
    const produtoNoCarrinho = carrinho.find((item) => item._id === produtoId);
    if (!produtoNoCarrinho) return;

    const novaQuantidade = produtoNoCarrinho.quantity - 1;
    const novoCarrinho = carrinho
      .map((item) => (item._id === produtoId ? { ...item, quantity: novaQuantidade } : item))
      .filter((item) => item.quantity > 0);

    const novoEstoque = produtoNoCarrinho.stock - novaQuantidade;

    setCarrinho(novoCarrinho);
    toast('Produto removido do carrinho', { icon: '🗑' });

    if (novoEstoque >= 1 && produtoNoCarrinho.status === 'inativo') {
      updateProduct(produtoId, { status: 'ativo' }).then(() => {
        fetchProducts();
      });
    }
  };

  const removerItemCompleto = (produtoId) => {
    const novoCarrinho = carrinho.filter((item) => item._id !== produtoId);
    setCarrinho(novoCarrinho);
    toast('Item removido do carrinho', { icon: '🗑' });
  };

  const finalizarPedido = async () => {
    const payload = {
      products: carrinho.map((item) => ({ product: item._id, quantity: item.quantity })),
      total: carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0),
    };

    try {
      await createOrder(payload);
      toast.success('✅ Pedido enviado com sucesso!');
      setCarrinho([]);
      setCarrinhoAberto(false);
      navigate('/orders');
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
      toast.error('❌ Erro ao enviar pedido. Tente novamente.');
    }
  };

  const desativarProduto = async (produtoId) => {
    try {
      await updateProduct(produtoId, { status: 'inativo' });
      fetchProducts();
      toast.success('Produto desativado!');
    } catch (err) {
      console.error('Erro ao desativar produto:', err);
      toast.error('❌ Não foi possível desativar o produto.');
    }
  };

  const ativarProduto = async (produtoId) => {
    try {
      await updateProduct(produtoId, { status: 'ativo' });
      fetchProducts();
      toast.success('Produto ativado!');
    } catch (err) {
      console.error('Erro ao ativar produto:', err);
      toast.error('❌ Não foi possível ativar o produto.');
    }
  };

  // Filtro de produtos
  const produtosFiltrados = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || product.status === statusFilter || !isAdmin;
    const matchMin = minPrice === '' || product.price >= parseFloat(minPrice);
    const matchMax = maxPrice === '' || product.price <= parseFloat(maxPrice);
    return matchSearch && matchStatus && matchMin && matchMax;
  });

  // Ordenação de produtos
  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    if (priceSort === 'asc') {
      return a.price - b.price;
    } else if (priceSort === 'desc') {
      return b.price - a.price;
    }
    return 0;
  });

  // Cálculo do total do carrinho
  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantity, 0);

  // Animações para cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <MainNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              Cardápio
            </h1>
            {isLoading && (
              <div className="animate-pulse bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                Carregando...
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <button
              className={`p-2.5 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              } transition-all duration-200`}
              onClick={() => setViewMode('grid')}
              title="Visualização em grade"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              className={`p-2.5 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              } transition-all duration-200`}
              onClick={() => setViewMode('list')}
              title="Visualização em lista"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
            {carrinho.length > 0 && (
              <button
                className="relative p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md"
                onClick={() => setCarrinhoAberto(!carrinhoAberto)}
                title="Ver carrinho"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItens}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>

            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200"
            >
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Filtros</span>
              {(minPrice || maxPrice || statusFilter !== 'todos') && (
                <span className="flex h-5 w-5 items-center justify-center bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                  {(minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (statusFilter !== 'todos' ? 1 : 0)}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPriceSort(priceSort === 'asc' ? null : 'asc')}
                className={`p-2 rounded-lg flex items-center gap-1 ${
                  priceSort === 'asc'
                    ? 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                } transition-all duration-200`}
                title="Ordenar por menor preço"
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Menor preço</span>
              </button>
              <button
                onClick={() => setPriceSort(priceSort === 'desc' ? null : 'desc')}
                className={`p-2 rounded-lg flex items-center gap-1 ${
                  priceSort === 'desc'
                    ? 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                } transition-all duration-200`}
                title="Ordenar por maior preço"
              >
                <ArrowDownIcon className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Maior preço</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {filtersVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                      Preço mínimo
                    </label>
                    <input
                      type="number"
                      placeholder="R$ Min."
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                      Preço máximo
                    </label>
                    <input
                      type="number"
                      placeholder="R$ Máx."
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <TagIcon className="h-4 w-4 text-gray-500" />
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="todos">Todos os produtos</option>
                        <option value="ativo">Somente Ativos</option>
                        <option value="inativo">Somente Inativos</option>
                      </select>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-xl overflow-hidden bg-white shadow-sm animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p className="mt-2 text-sm text-gray-500">Tente ajustar seus filtros ou buscar por outro nome.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {produtosOrdenados.map((product) => {
              const inativo = product.status === 'inativo';
              return (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                    inativo
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-transparent hover:shadow-lg hover:border-indigo-100'
                  }`}
                >
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                      {product.image ? (
                        <div className="relative group h-full">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 transition-all duration-300 group-hover:scale-110"
                            onError={(e) => {
                              if (e.target.getAttribute('data-error-handled')) return;
                              e.target.setAttribute('data-error-handled', 'true');
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-50">
                                  <div class="flex flex-col items-center justify-center">
                                    <svg class="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p class="mt-2 text-sm text-gray-500">Imagem não disponível</p>
                                  </div>
                                </div>
                              `;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <div className="flex flex-col items-center justify-center">
                            <PhotoIcon className="w-12 h-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Sem imagem</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {inativo && (
                      <div className="absolute top-2 left-2">
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                          Inativo
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">{product.name}</h2>
                    <p className="text-xl font-bold text-indigo-600 mb-2">{currencyFormat(product.price)}</p>

                    {product.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    )}

                    <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-4">
                      <ArchiveBoxIcon className="w-4 h-4 text-gray-400" />
                      {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'} em estoque
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {!inativo && (
                        <button
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-2.5 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-200 shadow-sm text-sm font-medium flex items-center justify-center gap-1.5"
                          onClick={() => adicionarAoCarrinho(product)}
                        >
                          <ShoppingCartIcon className="w-4 h-4" />
                          Adicionar
                        </button>
                      )}
                      {isAdmin && (
                        <div className="flex gap-2 mt-2 w-full">
                          <button
                            onClick={() => {
                              setEditProduct(product);
                              setEditModalOpen(true);
                            }}
                            className="flex-1 bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 transition-all duration-200 text-sm font-medium"
                          >
                            Editar
                          </button>
                          {inativo ? (
                            <button
                              onClick={() => ativarProduto(product._id)}
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium"
                            >
                              Ativar
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setModalOpen(true);
                              }}
                              className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-medium"
                            >
                              Desativar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">
            {produtosOrdenados.map((product) => {
              const inativo = product.status === 'inativo';
              return (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  className={`flex flex-col md:flex-row justify-between border rounded-xl overflow-hidden transition-all duration-300 ${
                    inativo
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-transparent hover:shadow-lg hover:border-indigo-100'
                  }`}
                >
                  <div className="flex flex-row w-full">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 flex-shrink-0 overflow-hidden">
                      {product.image ? (
                        <div className="relative group h-full">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-contain p-3 transition-all duration-300 group-hover:scale-110"
                            onError={(e) => {
                              if (e.target.getAttribute('data-error-handled')) return;
                              e.target.setAttribute('data-error-handled', 'true');
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-50">
                                  <div class="flex flex-col items-center justify-center">
                                    <svg class="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p class="mt-2 text-sm text-gray-500">Imagem não disponível</p>
                                  </div>
                                </div>
                              `;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center bg-gray-50">
                          <PhotoIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                        {inativo ? (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                            Inativo
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                            Ativo
                          </span>
                        )}
                      </div>

                      <p className="text-xl font-bold text-indigo-600 mb-1">{currencyFormat(product.price)}</p>

                      <div className="flex items-center gap-6 mt-1">
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                          <ArchiveBoxIcon className="w-4 h-4 text-gray-400" />
                          {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {!inativo && (
                          <button
                            className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-200 shadow-sm text-sm font-medium flex items-center gap-1.5"
                            onClick={() => adicionarAoCarrinho(product)}
                          >
                            <ShoppingCartIcon className="w-4 h-4" />
                            Adicionar
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setEditProduct(product);
                                setEditModalOpen(true);
                              }}
                              className="bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 transition-all duration-200 text-sm font-medium"
                            >
                              Editar
                            </button>
                            {inativo ? (
                              <button
                                onClick={() => ativarProduto(product._id)}
                                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium"
                              >
                                Ativar
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setModalOpen(true);
                                }}
                                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-medium"
                              >
                                Desativar
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Carrinho */}
        <AnimatePresence>
          {carrinho.length > 0 && carrinhoAberto && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-0 bottom-0 z-[998] overflow-hidden flex items-end md:items-start md:inset-auto md:top-20 md:right-6 md:left-auto md:bottom-auto md:w-[30rem]"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 -z-10"
                onClick={() => setCarrinhoAberto(false)}
              />
              <div className="relative bg-white rounded-t-xl md:rounded-xl shadow-xl border border-gray-200 max-h-[80vh] md:max-h-[calc(100vh-120px)] flex flex-col w-full overflow-hidden">
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCartIcon className="w-6 h-6 text-indigo-600" />
                    Seu Carrinho
                  </h2>
                  <button
                    onClick={() => setCarrinhoAberto(false)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                  {carrinho.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Seu carrinho está vazio</p>
                    </div>
                  ) : (
                    <ul className="space-y-5">
                      {carrinho.map((item) => (
                        <motion.li
                          key={item._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex flex-col border-b border-gray-100 pb-4"
                        >
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-800">{item.name}</span>
                            <span className="font-bold text-indigo-600">
                              {currencyFormat(item.price * item.quantity)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                              <button
                                onClick={() => removerDoCarrinho(item._id)}
                                disabled={item.quantity <= 1}
                                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-40 transition-all duration-200"
                              >
                                <MinusIcon className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 py-1 min-w-[30px] text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => adicionarAoCarrinho(item)}
                                disabled={item.quantity >= item.stock}
                                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-40 transition-all duration-200"
                              >
                                <PlusIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => removerItemCompleto(item._id)}
                              className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Remover item"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="sticky bottom-0 bg-white z-10 px-6 py-5 border-t border-gray-200 rounded-b-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600 font-medium">
                      Subtotal ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
                    </span>
                    <span className="text-xl font-bold text-gray-900">{currencyFormat(totalCarrinho)}</span>
                  </div>
                  <button
                    onClick={finalizarPedido}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-sm font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Finalizar Pedido
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contador flutuante do carrinho para móveis */}
        {!carrinhoAberto && carrinho.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              onClick={() => setCarrinhoAberto(true)}
              className="bg-blue-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center relative group hover:bg-blue-700 transition-all duration-200"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-sm font-bold"
              >
                {totalItens}
              </motion.span>
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {currencyFormat(totalCarrinho)}
              </motion.div>
            </button>
          </motion.div>
        )}
      </main>

      {selectedProduct && (
        <ConfirmDialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={() => desativarProduto(selectedProduct._id)}
          title="Deseja mesmo desativar este produto?"
          message={`Essa ação desativará "${selectedProduct.name}" e ele não aparecerá para os clientes.`}
        />
      )}

      <EditProductModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditProduct(null);
        }}
        onSave={salvarEdicaoProduto}
        product={editProduct}
      />
    </div>
  );
}
