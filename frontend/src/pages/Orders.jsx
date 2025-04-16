import { useEffect, useState } from 'react';
import { getOrdersByUser } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import MainNavbar from '../components/MainNavbar';
import { Clock, CheckCircle, XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrdersByUser();
      setOrders(response.data?.data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Não foi possível carregar seus pedidos');
    } finally {
      setLoading(false);
    }
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

  return (
    <>
      <MainNavbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
          <Link to="/products" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5">
            <ArrowLeft size={16} />
            Voltar às compras
          </Link>
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
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
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
                          {order.status}
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
      </div>
    </>
  );
}
