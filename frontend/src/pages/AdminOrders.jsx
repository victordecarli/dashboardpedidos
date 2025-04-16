import { useEffect, useState, Fragment } from 'react';
import { getAllOrders, updateOrder } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import AdminNavbar from '../components/AdminNavbar';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllOrders();
      if (response.data?.data) {
        setOrders(response.data.data);
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
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'finalizado':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'cancelado':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
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

  if (!isAdmin) {
    return (
      <>
        <AdminNavbar />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Pedidos</h1>
            <p className="text-gray-600 mt-1">Gerencie os pedidos dos clientes, atualize status e visualize detalhes</p>
          </div>
          <button
            onClick={loadOrders}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Atualizar Pedidos
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="animate-pulse flex space-x-2 justify-center mb-3">
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
            </div>
            <p className="text-gray-500 font-medium">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-500 font-medium">Nenhum pedido encontrado</p>
          </div>
        ) : (
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <Fragment key={order.id}>
                      <tr className={`hover:bg-gray-50 ${expandedOrder === order.id ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">#{order.id.slice(-6)}</div>
                          <div className="text-sm text-gray-500">{order.products?.length || 0} itens</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.user?.name || 'Cliente'}</div>
                          <div className="text-sm text-gray-500">{order.user?.email || 'Email não disponível'}</div>
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
                            {order.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">{currencyFormat(order.total)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex items-center justify-center gap-2">
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
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded border border-gray-200 transition-colors ml-1"
                            >
                              {expandedOrder === order.id ? (
                                <ChevronUpIcon className="w-4 h-4" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedOrder === order.id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="text-sm font-medium text-gray-900 mb-2">Detalhes do Pedido</div>
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {item.product_name}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center">{item.quantity}</td>
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
        )}
      </div>
    </>
  );
}
