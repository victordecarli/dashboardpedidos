import { useState, useEffect } from 'react';
import { getOrdersByUser } from '../services/orderService';
import { getProducts } from '../services/productService';
import { currencyFormat } from '../utils/currencyFormat';
import { Link, useNavigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import toast from 'react-hot-toast';
import { getImageUrl } from '../services/api';
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  ShoppingCart,
  User,
  Calendar,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { NoImageIcon, ImageErrorIcon } from '../components/icons/NoImageIcon';

export default function ClientDashboard() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await getOrdersByUser();
      const orders = response?.data?.data || [];
      setRecentOrders(orders.slice(0, 5)); // Mostrar apenas os 5 pedidos mais recentes

      // Calcular estatísticas
      const total = orders.length;
      const pending = orders.filter((order) => order.status === 'processando').length;
      const completed = orders.filter((order) => order.status === 'finalizado').length;

      setStatistics({
        totalOrders: total,
        pendingOrders: pending,
        completedOrders: completed,
      });
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Não foi possível carregar seus pedidos');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await getProducts();
      const products = response?.data || [];
      // Filtrando apenas produtos ativos e ordenando por popularidade (simulada)
      const activeProducts = products
        .filter((product) => product.status === 'ativo')
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 4); // Mostrar 4 produtos populares

      setPopularProducts(activeProducts);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Não foi possível carregar os produtos populares');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Formata data de forma segura
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';

    try {
      const date = new Date(dateString);

      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }

      // Tenta extrair data usando regex se a string tiver formato ISO
      if (typeof dateString === 'string') {
        const dataParts = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dataParts) {
          const [_, ano, mes, dia] = dataParts;
          return `${dia}/${mes}/${ano}`;
        }
      }

      return dateString;
    } catch {
      return dateString;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'em processamento':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'enviado':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'entregue':
      case 'concluído':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelado':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return <Clock size={14} />;
      case 'em processamento':
        return <Package size={14} />;
      case 'enviado':
        return <ShoppingBag size={14} />;
      case 'entregue':
      case 'concluído':
        return <CheckCircle size={14} />;
      case 'cancelado':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  // Variantes de animação
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
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      <MainNavbar />
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 min-h-screen pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Cabeçalho */}
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Bem-vindo(a) ao seu Painel
            </h1>
            <p className="text-gray-600 mt-2">
              Aqui você pode acompanhar seus pedidos recentes e encontrar produtos populares.
            </p>
          </Motion.div>

          {/* Cards de estatísticas */}
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          >
            <Motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{statistics.totalOrders}</h3>
                  </div>
                  <div className="bg-indigo-600 bg-opacity-10 p-3 rounded-full">
                    <ShoppingBag className="text-indigo-100 w-6 h-6" />
                  </div>
                </div>
              </div>
            </Motion.div>

            <Motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl border border-yellow-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pedidos Pendentes</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{statistics.pendingOrders}</h3>
                  </div>
                  <div className="bg-yellow-600 bg-opacity-10 p-3 rounded-full">
                    <Clock className="text-yellow-100 w-6 h-6" />
                  </div>
                </div>
              </div>
            </Motion.div>

            <Motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl border border-green-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pedidos Concluídos</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{statistics.completedOrders}</h3>
                  </div>
                  <div className="bg-green-600 bg-opacity-10 p-3 rounded-full">
                    <CheckCircle className="text-green-100 w-6 h-6" />
                  </div>
                </div>
              </div>
            </Motion.div>
          </Motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pedidos Recentes */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="text-indigo-600 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
                  </div>
                  <Link
                    to="/orders"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    Ver todos
                    <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="divide-y divide-gray-200">
                  {isLoadingOrders ? (
                    <div className="p-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                      <p className="text-gray-500">Carregando seus pedidos...</p>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="p-10 text-center">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Você ainda não realizou nenhum pedido. Comece explorando nossos produtos disponíveis.
                      </p>
                      <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <ShoppingCart size={18} />
                        Fazer um pedido
                      </button>
                    </div>
                  ) : (
                    <div>
                      {recentOrders.map((order, index) => (
                        <Motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">Pedido #{order.id.slice(-6)}</h3>
                              <div
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(
                                  order.status,
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status}
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-indigo-700">{currencyFormat(order.total)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {formatDate(order.data_pedido)}
                            </div>
                            <div>
                              {order.products?.length} {order.products?.length === 1 ? 'item' : 'itens'}
                            </div>
                          </div>
                        </Motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Motion.div>

            {/* Produtos Populares */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-indigo-600 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-gray-900">Produtos Populares</h2>
                  </div>
                  <Link
                    to="/products"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    Ver todos
                    <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="divide-y divide-gray-200">
                  {isLoadingProducts ? (
                    <div className="p-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                      <p className="text-gray-500">Carregando produtos...</p>
                    </div>
                  ) : popularProducts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum produto disponível no momento.</p>
                    </div>
                  ) : (
                    <div>
                      {popularProducts.map((product, index) => (
                        <Motion.div
                          key={product._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate('/products')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center p-1">
                              {product.image ? (
                                <img
                                  src={getImageUrl(product.image)}
                                  alt={product.name}
                                  className="w-12 h-12 object-contain"
                                  onError={(e) => {
                                    if (e.target.getAttribute('data-error-handled')) return;
                                    e.target.setAttribute('data-error-handled', 'true');
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center">
                                        <div class="flex flex-col items-center justify-center">
                                          <ImageErrorIcon />
                                          <p class="mt-2 text-sm text-gray-500">Erro ao carregar imagem</p>
                                        </div>
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                  <div className="flex flex-col items-center justify-center">
                                    <NoImageIcon />
                                    <p className="mt-2 text-sm text-gray-500">Sem imagem</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-indigo-700">
                                  {currencyFormat(product.price)}
                                </span>
                                {product.stock > 0 && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {product.stock} em estoque
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
