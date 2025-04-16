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

  // Função para formatar datas de forma segura
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';

    try {
      // Tenta converter diretamente
      const date = new Date(dateString);

      // Se a data for válida, retorna formatada
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      // Se a string tiver o formato ISO ou algo semelhante, tenta extrair partes
      if (typeof dateString === 'string') {
        // Tenta extrair data usando regex
        const dataParts = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dataParts) {
          const [_, ano, mes, dia] = dataParts;

          // Tenta extrair hora se possível
          const horaParts = dateString.match(/T(\d{2}):(\d{2})/);
          if (horaParts) {
            const [__, hora, minuto] = horaParts;
            return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
          }

          return `${dia}/${mes}/${ano}`;
        }

        // Se tiver timestamp ou data dentro de um objeto
        if (dateString.includes('$date')) {
          try {
            const parsedObj = JSON.parse(dateString);
            if (parsedObj.$date) {
              const timestamp = new Date(parsedObj.$date);
              if (!isNaN(timestamp.getTime())) {
                return timestamp.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
            }
          } catch {
            // Ignora erro de parse JSON
          }
        }
      }

      // Se tudo falhar, retorna a string original
      return dateString;
    } catch {
      // Em caso de erro, retorna a string original em vez de mensagem de erro
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Todos os Pedidos</h1>

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum pedido encontrado.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Cliente: {order.user.name} <span className="text-xs text-gray-500">({order.user.email})</span>
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(order.data_pedido)}</p>
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
                    <span className="text-gray-600">{currencyFormat(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium text-gray-600">Total:</span>
                <span className="text-lg font-bold text-green-700">{currencyFormat(order.total)}</span>
              </div>
            </div>
          ))
        )}

        {showModal && (
          <Modal title="Acesso Negado" onClose={handleCloseModal}>
            <div className="text-center p-4">
              <p className="text-red-600 font-semibold text-lg mb-2">⛔ Acesso Restrito</p>
              <p className="text-gray-600">Esta página é exclusiva para administradores.</p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
