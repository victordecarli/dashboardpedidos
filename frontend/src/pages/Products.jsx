import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import { createOrder } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => alert('Erro ao carregar produtos'));
  }, []);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item._id === produto._id);
      if (existe) {
        return prev.map((item) =>
          item._id === produto._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...produto, quantity: 1 }];
    });
  };

  const finalizarPedido = async () => {
    const payload = {
      products: carrinho.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),
      total: carrinho.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      ),
    };

    try {
      await createOrder(payload);
      alert('✅ Pedido enviado com sucesso!');
      setCarrinho([]);
      navigate('/orders'); // redireciona para tela de pedidos
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
      alert('❌ Erro ao enviar pedido. Tente novamente.');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <AdminNavbar />
      <h1 className="text-2xl font-bold mb-4">Cardápio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">
              {currencyFormat(product.price)}
            </p>
            <button
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => adicionarAoCarrinho(product)}
            >
              Adicionar
            </button>
          </div>
        ))}
      </div>

      {carrinho.length > 0 && (
        <div className="mt-8 border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Resumo do Pedido</h2>
          <ul className="mb-4">
            {carrinho.map((item) => (
              <li key={item._id} className="flex justify-between">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>{currencyFormat(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={finalizarPedido}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Finalizar Pedido
          </button>
        </div>
      )}
    </div>
  );
}
