import { useEffect, useState } from 'react';
import { getOrders } from '../services/index';
import { currencyFormat } from '../utils/currencyFormat';
import AdminNavbar from '../components/AdminNavbar';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
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
    <div className="p-4 max-w-4xl mx-auto">
      <AdminNavbar />
      <h1 className="text-2xl font-bold mb-4">Meus Pedidos</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="border p-4 rounded mb-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Pedido #{order.id.slice(-6)}</h2>
              <span className="text-sm text-gray-600">{order.data_pedido}</span>
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

            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span className="text-lg font-bold">
                {currencyFormat(order.total)}
              </span>
            </div>

            <div className="mt-1 text-sm">
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                {order.status}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
