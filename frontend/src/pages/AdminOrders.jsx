import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, updateOrder } from '../services/index';
import { currencyFormat } from '../utils/currencyFormat';
import AdminNavbar from '../components/AdminNavbar';
import Modal from '../components/Modal';
import { getUserRole } from '../utils/auth';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const isAdmin = getUserRole() === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setShowModal(true);
    } else {
      fetchOrders();
    }
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('Erro ao atualizar pedido', err);
    }
  };

  const fetchOrders = () => {
    getAllOrders()
      .then((res) => {
        setOrders(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        alert('Erro ao carregar pedidos.');
        setLoading(false);
      });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/products'); // Redireciona após o modal ser fechado
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Todos os Pedidos
        </h1>

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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Cliente: {order.user.name}{' '}
                    <span className="text-xs text-gray-500">
                      ({order.user.email})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">{order.data_pedido}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="processando">Processando</option>
                  <option value="finalizado">Concluído</option>
                </select>
              </div>

              <ul className="text-sm divide-y divide-gray-100 mb-3">
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
            </div>
          ))
        )}

        {showModal && (
          <Modal title="Acesso Negado" onClose={handleCloseModal}>
            <div className="text-center p-4">
              <p className="text-red-600 font-semibold text-lg mb-2">
                ⛔ Acesso Restrito
              </p>
              <p className="text-gray-600">
                Esta página é exclusiva para administradores.
              </p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
