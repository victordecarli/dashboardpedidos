import { useEffect, useState } from 'react';
import { getOrdersByUser } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import MainNavbar from '../components/MainNavbar';
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ShoppingBag,
  Search,
  RotateCw,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, sortOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrdersByUser();
      const ordersData = response.data?.data || [];
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Não foi possível carregar seus pedidos');
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

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          order.products.some((item) => item.product_name.toLowerCase().includes(term)),
      );
    }

    // Ordenação por data
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
    setSortOrder('desc');
    setIsFilterOpen(false);
  };

  const loadOrderDetails = (orderId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
      return;
    }
    setSelectedOrder(orderId);
  };

  // Formata data de forma segura
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';

    try {
      // Attempt to parse DD/MM/YYYY HH:mm format explicitly
      const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);

      if (parts) {
        // parts[1] = day, parts[2] = month, parts[3] = year, parts[4] = hour, parts[5] = minute
        // Note: Month is 0-indexed in JavaScript Date object
        const year = parseInt(parts[3], 10);
        const month = parseInt(parts[2], 10) - 1; // Subtract 1 for 0-indexed month
        const day = parseInt(parts[1], 10);
        const hours = parseInt(parts[4], 10);
        const minutes = parseInt(parts[5], 10);

        const date = new Date(year, month, day, hours, minutes);

        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR', {
            // Formatting to DD/MM/YYYY
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
        }
      }

      // Fallback for other potential date formats or if explicit parsing fails
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR', {
          // Formatting to DD/MM/YYYY
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }

      // Final fallback if all parsing fails
      return dateString;
    } catch {
      return dateString;
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
        return 'Concluídos';
      case 'cancelado':
        return 'Cancelados';
      default:
        return 'Todos';
    }
  };

  const getOrderCount = (status) => {
    if (status === 'todos') return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  return (
    <>
      <MainNavbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
            >
              <RotateCw size={16} />
              Atualizar
            </button>
            <Link to="/products" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5">
              <ArrowLeft size={16} />
              Voltar às compras
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-pulse flex space-x-2 mb-3">
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
            </div>
            <p className="text-gray-500 font-medium">Carregando seus pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
            <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum pedido encontrado</h2>
            <p className="text-gray-500 mb-6">Você ainda não fez nenhum pedido.</p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Começar a comprar
            </Link>
          </div>
        ) : (
          <>
            {/* Filtros e Busca */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por número do pedido ou produto..."
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Filter size={16} />
                    Filtros
                    <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  >
                    <option value="desc">Mais recentes</option>
                    <option value="asc">Mais antigos</option>
                  </select>
                </div>
              </div>

              {isFilterOpen && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => setStatusFilter('todos')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === 'todos'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Todos ({getOrderCount('todos')})
                    </button>
                    <button
                      onClick={() => setStatusFilter('processando')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === 'processando'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Clock size={16} />
                      Processando ({getOrderCount('processando')})
                    </button>
                    <button
                      onClick={() => setStatusFilter('finalizado')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === 'finalizado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <CheckCircle size={16} />
                      Concluídos ({getOrderCount('finalizado')})
                    </button>
                    <button
                      onClick={() => setStatusFilter('cancelado')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === 'cancelado'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <XCircle size={16} />
                      Cancelados ({getOrderCount('cancelado')})
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={resetFilters} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                      Limpar filtros
                    </button>
                  </div>
                </div>
              )}

              {filteredOrders.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 items-center text-yellow-800">
                  <Filter size={18} />
                  <div>
                    <p className="font-medium">Nenhum pedido encontrado com os filtros atuais</p>
                    <p className="text-sm mt-1">Tente ajustar seus filtros ou limpar a busca</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Pedidos */}
            {filteredOrders.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${
                      selectedOrder === order.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-semibold text-gray-900">Pedido #{order.id.slice(-6)}</h2>
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                order.status,
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              {getStatusName(order.status)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">Realizado em {formatDate(order.data_pedido)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-bold text-blue-600">{currencyFormat(order.total)}</p>
                          <button
                            onClick={() => loadOrderDetails(order.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              selectedOrder === order.id
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            } transition-colors`}
                          >
                            {selectedOrder === order.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                          </button>
                        </div>
                      </div>

                      {selectedOrder === order.id && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">Itens do Pedido</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Produto
                                  </th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantidade
                                  </th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Preço Unitário
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subtotal
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {order.products?.map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                                      {item.product_name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium">
                                      {item.quantity}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                      {currencyFormat(item.price)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                                      {currencyFormat(item.price * item.quantity)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-gray-50">
                                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                                    Total:
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                                    {currencyFormat(order.total)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
