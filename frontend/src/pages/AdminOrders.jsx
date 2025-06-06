import { useEffect, useState, Fragment } from 'react';
import { getAllOrders, updateOrder } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import MainNavbar from '../components/MainNavbar';
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCw,
  AlertTriangle,
  Search,
  Filter,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

function parseDateString(dateString) {
  if (!dateString) return null;
  // Extrai dia, mês, ano, hora e minuto
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hour = 0, minute = 0] = (timePart || '00:00').split(':');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, dateFilter, sortOrder]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllOrders();
      if (response.data?.data) {
        const ordersData = response.data.data;
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Não foi possível carregar os pedidos');
      if (error.response?.status === 403) {
        setIsAdmin(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    // Filtro por status
    if (statusFilter !== 'todos') {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Filtro por data
    if (dateFilter !== 'todos') {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      switch (dateFilter) {
        case 'hoje':
          result = result.filter((order) => {
            const orderDate = new Date(order.data_pedido);
            return orderDate.toDateString() === today.toDateString();
          });
          break;
        case 'semana':
          result = result.filter((order) => {
            const orderDate = parseDateString(order.data_pedido);
            return orderDate && orderDate >= sevenDaysAgo;
          });
          break;
        case 'mes':
          result = result.filter((order) => {
            const orderDate = new Date(order.data_pedido);
            return orderDate >= thirtyDaysAgo;
          });
          break;
        default:
          break;
      }
    }

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          (order.user?.name && order.user.name.toLowerCase().includes(term)) ||
          (order.user?.email && order.user.email.toLowerCase().includes(term)) ||
          order.products.some((item) => item.product_name.toLowerCase().includes(term)),
      );
    }

    // Ordenação
    result.sort((a, b) => {
      const dateA = new Date(a.data_pedido);
      const dateB = new Date(b.data_pedido);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(result);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setDateFilter('todos');
    setSortOrder('desc');
  };

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

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;

    setActionLoading(orderId);

    try {
      await updateOrder(orderId, { status: newStatus });

      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
      );

      toast.success(
        `Pedido #${orderId.slice(-6)} ${
          newStatus === 'processando'
            ? 'marcado como em processamento'
            : newStatus === 'finalizado'
            ? 'finalizado com sucesso'
            : 'cancelado'
        }`,
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Não foi possível atualizar o status do pedido');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processando':
        return <Clock size={20} className="text-yellow-500" />;
      case 'finalizado':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'cancelado':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'processando':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'finalizado':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 'processando':
        return 'Processando';
      case 'finalizado':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  const getOrderCount = (status) => {
    if (status === 'todos') return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    if (!orderId || newStatus === undefined) return;

    setActionLoading(orderId);

    try {
      await updateOrder(orderId, { isPaid: newStatus });

      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, isPaid: newStatus } : order)),
      );

      toast.success(
        `Status de pagamento do pedido #${orderId.slice(-6)} ${
          newStatus ? 'marcado como pago' : 'marcado como não pago'
        }`,
      );
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      toast.error('Não foi possível atualizar o status de pagamento do pedido');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <>
        <MainNavbar />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página. Esta área é exclusiva para administradores.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Pedidos</h1>
            <p className="text-gray-600 mt-1">Gerencie os pedidos dos clientes, atualize status e visualize detalhes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Filter size={16} />
              Filtros
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={loadOrders}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RotateCw size={16} />
              Atualizar Pedidos
            </button>
          </div>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 transition-all">
            <div className="mb-4">
              <div className="flex flex-wrap gap-3 items-center mb-4">
                <div className="relative flex-grow max-w-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por pedido, cliente ou produto..."
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  >
                    <option value="desc">Mais recentes</option>
                    <option value="asc">Mais antigos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <Filter size={16} />
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStatusFilter('todos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        statusFilter === 'todos'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Todos ({getOrderCount('todos')})
                    </button>
                    <button
                      onClick={() => setStatusFilter('processando')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === 'processando'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Clock size={14} />
                      Processando ({getOrderCount('processando')})
                    </button>
                    <button
                      onClick={() => setStatusFilter('finalizado')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === 'finalizado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <CheckCircle size={14} />
                      Concluídos ({getOrderCount('finalizado')})
                    </button>
                    <button
                      onClick={() => setStatusFilter('cancelado')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === 'cancelado'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <XCircle size={14} />
                      Cancelados ({getOrderCount('cancelado')})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <SlidersHorizontal size={16} />
                    Período
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDateFilter('todos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        dateFilter === 'todos'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setDateFilter('hoje')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        dateFilter === 'hoje'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => setDateFilter('semana')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        dateFilter === 'semana'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Últimos 7 dias
                    </button>
                    <button
                      onClick={() => setDateFilter('mes')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        dateFilter === 'mes'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Últimos 30 dias
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-3">
              <button onClick={resetFilters} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                Limpar filtros
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="animate-pulse flex space-x-2 justify-center mb-3">
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
            </div>
            <p className="text-gray-500 font-medium">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            {searchTerm || statusFilter !== 'todos' || dateFilter !== 'todos' ? (
              <>
                <p className="text-gray-700 font-medium mb-2">Nenhum pedido corresponde aos filtros aplicados</p>
                <p className="text-gray-500 mb-4">Tente ajustar os critérios de filtro ou limpar os filtros</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Limpar todos os filtros
                </button>
              </>
            ) : (
              <p className="text-gray-500 font-medium">Nenhum pedido encontrado</p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-3 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Exibindo <span className="font-medium">{filteredOrders.length}</span> de{' '}
                <span className="font-medium">{orders.length}</span> pedidos
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Pedido
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                      >
                        Cliente
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Data
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Pagamento
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40"
                      >
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <Fragment key={order.id}>
                        <tr className={`hover:bg-gray-50 ${expandedOrder === order.id ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 whitespace-nowrap">#{order.id.slice(-6)}</div>
                            <div className="text-sm text-gray-500 whitespace-nowrap">
                              {order.products?.length || 0} itens
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 whitespace-normal">
                              <User size={14} className="text-gray-400" />
                              <div className="text-sm text-gray-900 font-medium">{order.user?.name || 'Cliente'}</div>
                            </div>
                            <div className="text-sm text-gray-500 ml-5 whitespace-normal">
                              {order.user?.email || 'Email não disponível'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(order.data_pedido)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(
                                order.status,
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              {getStatusName(order.status)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">{currencyFormat(order.total)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                order.isPaid
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}
                            >
                              {order.isPaid ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              {order.isPaid ? 'Pago' : 'Não Pago'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm w-40">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              {order.status !== 'processando' && (
                                <button
                                  onClick={() => handleStatusChange(order.id, 'processando')}
                                  disabled={actionLoading === order.id}
                                  className="text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-2 py-1 rounded border border-yellow-200 transition-colors"
                                >
                                  Processar
                                </button>
                              )}

                              {order.status !== 'finalizado' && (
                                <button
                                  onClick={() => handleStatusChange(order.id, 'finalizado')}
                                  disabled={actionLoading === order.id}
                                  className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded border border-green-200 transition-colors"
                                >
                                  Finalizar
                                </button>
                              )}

                              {order.status !== 'cancelado' && (
                                <button
                                  onClick={() => handleStatusChange(order.id, 'cancelado')}
                                  disabled={actionLoading === order.id}
                                  className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded border border-red-200 transition-colors"
                                >
                                  Cancelar
                                </button>
                              )}

                              <button
                                onClick={() => handlePaymentStatusChange(order.id, !order.isPaid)}
                                disabled={actionLoading === order.id}
                                className={`text-xs px-2 py-1 rounded border transition-colors ${
                                  order.isPaid
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                                }`}
                              >
                                {order.isPaid ? 'Não Pago' : 'Pago'}
                              </button>

                              <button
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded border border-gray-200 transition-colors ml-1"
                              >
                                {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expandedOrder === order.id && (
                          <tr>
                            <td colSpan="7" className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                              <div className="text-sm font-medium text-gray-900 mb-2">Detalhes do Pedido</div>
                              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2"
                                    >
                                      Produto
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Quantidade
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Preço Unitário
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Subtotal
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {order.products?.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-normal">
                                        {item.product_name}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                                        {item.quantity}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                                        {currencyFormat(item.price)}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                                        {currencyFormat(item.price * item.quantity)}
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="bg-gray-50">
                                    <td colSpan="3" className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                      Total:
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-blue-600 text-right">
                                      {currencyFormat(order.total)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
