import { useEffect, useState } from 'react';
import { getOrders, updateOrder } from '../services/index';
import { currencyFormat } from '../utils/currencyFormat';
import AdminNavbar from '../components/AdminNavbar';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    getOrders()
      .then((res) => {
        setOrders(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        alert('Erro ao carregar pedidos.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('Erro ao atualizar pedido', err);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <AdminNavbar />
      <h1 className="text-2xl font-bold mb-4">Todos os Pedidos</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="border p-4 rounded mb-4 shadow">
            <div className="flex justify-between mb-2">
              <div>
                <p className="text-sm font-medium">
                  Cliente: {order.user.name} ({order.user.email})
                </p>
                <p className="text-xs text-gray-600">{order.data_pedido}</p>
              </div>
              <div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="processando">Processando</option>
                  <option value="finalizado">Concluído</option>
                </select>
              </div>
            </div>

            <ul className="text-sm mb-2">
              {order.products.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    {item.product_name} x{item.quantity}
                  </span>
                  <span>{currencyFormat(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total:</span>
              <span className="text-base font-bold">
                {currencyFormat(order.total)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
