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
        setOrders(res.data?.data || []);
      })
      .catch((err) => {
        console.error(err);
        alert('Erro ao carregar pedidos.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
        });
      }

      // Se a string tiver o formato ISO ou algo semelhante, tenta extrair partes
      if (typeof dateString === 'string') {
        // Tenta extrair data usando regex
        const dataParts = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dataParts) {
          const [_, ano, mes, dia] = dataParts;
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
    <>
      <AdminNavbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">Meus Pedidos</h1>

        {loading ? (
          <p className="text-gray-500">Carregando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">Nenhum pedido encontrado.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border p-4 rounded mb-4 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Pedido #{order.id.slice(-6)}</h2>
                <span className="text-sm text-gray-600">{formatDate(order.data_pedido)}</span>
              </div>

              <ul className="text-sm mb-2">
                {order.products?.map((item, idx) => (
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
                <span className="text-lg font-bold">{currencyFormat(order.total)}</span>
              </div>

              <div className="mt-1 text-sm">
                <span
                  className={`px-2 py-1 rounded font-medium ${
                    order.status === 'pendente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'concluído'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
