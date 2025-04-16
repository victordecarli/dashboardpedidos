import { useState, useEffect } from 'react';
import { getOrdersByUser } from '../services/orderService';
import { getProducts } from '../services/productService';
import { currencyFormat } from '../utils/currencyFormat';
import { Link, useNavigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import toast from 'react-hot-toast';
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
} from 'lucide-react';

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
      const pending = orders.filter(
        (order) => order.status === 'Pendente' || order.status === 'Em processamento',
      ).length;
      const completed = orders.filter((order) => order.status === 'Entregue' || order.status === 'Concluído').length;

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

  return (
    <>
      <MainNavbar />
      <div className="bg-gradient-to-b from-blue-50 to-gray-50 min-h-screen pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel do Cliente</h1>
            <p className="text-gray-600 mt-2">Bem-vindo(a) de volta! Confira seus pedidos e produtos recomendados.</p>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{statistics.totalOrders}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingBag className="text-blue-600 w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pedidos Pendentes</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{statistics.pendingOrders}</h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="text-yellow-600 w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pedidos Concluídos</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{statistics.completedOrders}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="text-green-600 w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pedidos Recentes */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="text-blue-600 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
                  </div>
                  <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Ver todos
                  </Link>
                </div>

                <div className="divide-y divide-gray-200">
                  {isLoadingOrders ? (
                    <div className="p-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-gray-500">Carregando seus pedidos...</p>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="p-10 text-center">
                      <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum pedido encontrado</h3>
                      <p className="text-gray-500 mb-4">Você ainda não realizou nenhum pedido.</p>
                      <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart size={16} />
                        Fazer um pedido
                      </button>
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order.id} className="p-5 hover:bg-gray-50">
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
                          <span className="text-sm font-medium text-gray-900">{currencyFormat(order.total)}</span>
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Produtos Populares */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-blue-600 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-gray-900">Produtos Populares</h2>
                  </div>
                  <Link to="/products" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Ver todos
                  </Link>
                </div>

                <div className="divide-y divide-gray-200">
                  {isLoadingProducts ? (
                    <div className="p-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-gray-500">Carregando produtos...</p>
                    </div>
                  ) : popularProducts.length === 0 ? (
                    <div className="p-6 text-center">
                      <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhum produto disponível no momento.</p>
                    </div>
                  ) : (
                    popularProducts.map((product) => (
                      <div key={product._id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-600">{currencyFormat(product.price)}</span>
                              {product.stock > 0 && (
                                <span className="text-xs text-gray-500">{product.stock} em estoque</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
