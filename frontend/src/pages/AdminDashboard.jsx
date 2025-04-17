import { useState, useEffect } from 'react';
import { getAllOrders } from '../services/orderService';
import { getProducts } from '../services/productService';
import { getAllUsers } from '../services/userService';
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
  DollarSign,
  Users,
  BarChart3,
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedUser, setSelectedUser] = useState('todos');
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalCustomers: new Set(),
    averageOrderValue: 0,
    selectedUserStats: {
      totalSpent: 0,
      orderCount: 0,
      averageOrderValue: 0,
    },
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchUsers();
  }, [selectedMonth, selectedYear, selectedUser]);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    // Formato esperado: "DD/MM/YYYY HH:mm" ou "DD/MM/YYYY"
    const [datePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(year, parseInt(month) - 1, day); // -1 no mês porque em JS os meses começam do 0
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response?.data) {
        const usersData = response.data.data || response.data;
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        } else {
          toast.error('Formato de dados inválido');
        }
      } else {
        toast.error('Não foi possível carregar a lista de usuários');
      }
    } catch (error) {
      toast.error('Não foi possível carregar a lista de usuários');
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await getAllOrders();
      const orders = response?.data?.data || [];

      // Ordena os pedidos por data (mais recentes primeiro)
      const sortedOrders = orders.sort((a, b) => {
        const dateA = parseDate(a.data_pedido);
        const dateB = parseDate(b.data_pedido);
        return dateB - dateA;
      });

      // Filtra os pedidos pelo mês, ano e usuário selecionados
      const filteredOrders = sortedOrders.filter((order) => {
        if (!order.data_pedido) return false;
        const orderDate = parseDate(order.data_pedido);
        if (!orderDate) return false;

        // Converte IDs para string para garantir comparação correta
        const orderUserId = order.user?.id_user?.toString();
        const selectedUserId = selectedUser?.toString();

        const dateMatches = orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
        const userMatches = selectedUser === 'todos' || orderUserId === selectedUserId;

        return dateMatches && userMatches;
      });

      setRecentOrders(filteredOrders.slice(0, 5));

      // Calcular estatísticas gerais
      const total = filteredOrders.length;
      const pending = filteredOrders.filter((order) => {
        const status = order.status?.toLowerCase();
        return status === 'processando' || status === 'pendente';
      }).length;
      const completed = filteredOrders.filter((order) => {
        const status = order.status?.toLowerCase();
        return status === 'finalizado' || status === 'entregue' || status === 'concluído';
      }).length;

      // Função auxiliar para processar o valor total
      const processTotal = (total) => {
        if (!total) return 0;
        if (typeof total === 'number') return total;
        // Remove qualquer caractere que não seja número, vírgula ou ponto
        const cleanValue = total
          .toString()
          .replace(/[^\d,.-]/g, '')
          .replace(',', '.');
        const value = parseFloat(cleanValue);
        return isNaN(value) ? 0 : value;
      };

      // Calcula a receita total somando o valor total de cada pedido
      const revenue = filteredOrders.reduce((acc, order) => {
        const orderTotal = processTotal(order.total);
        return acc + orderTotal;
      }, 0);

      // Coleta IDs únicos de clientes
      const customers = new Set(
        filteredOrders.filter((order) => order.user?.id_user).map((order) => order.user.id_user),
      );

      // Calcula o ticket médio
      const avgOrderValue = total > 0 ? revenue / total : 0;

      // Calcula estatísticas do usuário selecionado
      const userStats = {
        totalSpent: revenue,
        orderCount: total,
        averageOrderValue: avgOrderValue,
      };

      setStatistics({
        totalOrders: total,
        pendingOrders: pending,
        completedOrders: completed,
        totalRevenue: revenue,
        totalCustomers: customers,
        averageOrderValue: avgOrderValue,
        selectedUserStats: userStats,
      });
    } catch (error) {
      toast.error('Não foi possível carregar os pedidos');
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
    return dateString.split(' ')[0]; // Retorna apenas a parte da data (DD/MM/YYYY)
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

  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

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

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <>
      <MainNavbar />
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 min-h-screen pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Cabeçalho com filtros */}
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                  Dashboard Administrativo
                </h1>
                <p className="text-gray-600 mt-2">Visão geral das vendas, pedidos e métricas importantes</p>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                >
                  <option key="todos" value="todos">
                    Todos os usuários
                  </option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {selectedUser !== 'todos' && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Estatísticas do Usuário Selecionado</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-600 font-medium">Total Gasto</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {formatCurrency(statistics.selectedUserStats.totalSpent)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Quantidade de Pedidos</p>
                    <p className="text-2xl font-bold text-green-900">{statistics.selectedUserStats.orderCount}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Ticket Médio</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(statistics.selectedUserStats.averageOrderValue)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Motion.div>

          {/* Cards de estatísticas */}
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
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
              <div className="bg-white rounded-xl border border-green-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Receita Total</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(statistics.totalRevenue)}</h3>
                  </div>
                  <div className="bg-green-600 bg-opacity-10 p-3 rounded-full">
                    <DollarSign className="text-green-100 w-6 h-6" />
                  </div>
                </div>
              </div>
            </Motion.div>

            <Motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total de Clientes</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{statistics.totalCustomers.size}</h3>
                  </div>
                  <div className="bg-blue-600 bg-opacity-10 p-3 rounded-full">
                    <Users className="text-blue-100 w-6 h-6" />
                  </div>
                </div>
              </div>
            </Motion.div>

            <Motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                      {formatCurrency(statistics.averageOrderValue)}
                    </h3>
                  </div>
                  <div className="bg-purple-600 bg-opacity-10 p-3 rounded-full">
                    <BarChart3 className="text-purple-100 w-6 h-6" />
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
                    to="/admin-orders"
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
                      <p className="text-gray-500">Carregando pedidos...</p>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="p-10 text-center">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                      <p className="text-gray-500 mb-6">Não há pedidos registrados para o período selecionado.</p>
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
                              <h3 className="font-medium text-gray-900">#{order.id.slice(-6)}</h3>
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
                              <User size={14} className="text-gray-400" />
                              {order.user?.name || 'Cliente'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {formatDate(order.data_pedido)}
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
                                        <svg class="w-7 h-7 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <Package className="w-7 h-7 text-gray-400" />
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
