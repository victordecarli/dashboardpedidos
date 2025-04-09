import { useEffect, useState } from 'react';
import { getOrdersByUser } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import AdminNavbar from '../components/AdminNavbar';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrdersByUser()
      .then((res) => {
        setOrders(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        alert('Erro ao carregar pedidos');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Meus Pedidos</h1>

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum pedido encontrado.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Pedido #{order.id.slice(-6)}
                </h2>
                <span className="text-sm text-gray-500">
                  {order.data_pedido}
                </span>
              </div>

              <ul className="text-sm divide-y divide-gray-100 mb-4">
                {order.products.map((item, idx) => (
                  <li key={idx} className="flex justify-between py-2">
                    <span className="text-gray-700">
                      {item.product_name} x{item.quantity}
                    </span>
                    <span className="text-gray-600">
                      {currencyFormat(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium text-gray-600">
                  Total:
                </span>
                <span className="text-lg font-bold text-green-700">
                  {currencyFormat(order.total)}
                </span>
              </div>

              <div className="mt-3">
                <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 capitalize">
                  {order.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
