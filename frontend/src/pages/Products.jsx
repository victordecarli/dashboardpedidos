import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import { createOrder } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { updateProduct } from '../services/productService';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => alert('Erro ao carregar produtos'));
  }, []);

  // const adicionarAoCarrinho = (produto) => {
  //   setCarrinho((prev) => {
  //     const existe = prev.find((item) => item._id === produto._id);
  //     if (existe) {
  //       return prev.map((item) =>
  //         item._id === produto._id
  //           ? { ...item, quantity: item.quantity + 1 }
  //           : item,
  //       );
  //     }
  //     return [...prev, { ...produto, quantity: 1 }];
  //   });
  // };

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item._id === produto._id);
      const quantidadeAtual = existe ? existe.quantity : 0;

      if (quantidadeAtual >= produto.stock) {
        alert(`❌ Estoque máximo atingido para: ${produto.name}`);
        return prev;
      }

      const novoCarrinho = existe
        ? prev.map((item) =>
            item._id === produto._id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...prev, { ...produto, quantity: 1 }];

      const novaQuantidadeTotal = quantidadeAtual + 1;
      const novoEstoqueRestante = produto.stock - novaQuantidadeTotal;

      // Se estoque chegou a 0, atualiza no backend
      if (novoEstoqueRestante === 0) {
        updateProduct(produto._id, { active: false }).then(() => {
          // Atualiza localmente também (opcional, mas melhora UX)
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p._id === produto._id ? { ...p, active: false } : p,
            ),
          );
        });
      }

      return novoCarrinho;
    });
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho((prev) => {
      const produtoNoCarrinho = prev.find((item) => item._id === produtoId);
      if (!produtoNoCarrinho) return prev;

      const novaQuantidade = produtoNoCarrinho.quantity - 1;
      const novoCarrinho = prev
        .map((item) =>
          item._id === produtoId ? { ...item, quantity: novaQuantidade } : item,
        )
        .filter((item) => item.quantity > 0);

      // Se antes o estoque estava em 0 e agora voltou a ter (ex: 1)
      const novoEstoque = produtoNoCarrinho.stock - novaQuantidade;

      if (novoEstoque >= 1 && produtoNoCarrinho.status === 'inativo') {
        updateProduct(produtoId, { status: 'ativo' }).then(() => {
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p._id === produtoId ? { ...p, status: 'ativo' } : p,
            ),
          );
        });
      }

      return novoCarrinho;
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

  const desativarProduto = async (produtoId) => {
    try {
      await updateProduct(produtoId, { status: 'inativo' });

      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === produtoId ? { ...p, status: 'inativo' } : p,
        ),
      );
    } catch (err) {
      console.error('Erro ao desativar produto:', err);
      alert('❌ Não foi possível desativar o produto.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <AdminNavbar />
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🍔 Cardápio</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products
            .filter((product) => product.status === 'ativo')
            .map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg p-4 transition hover:shadow-2xl"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {product.name}
                </h2>
                <p className="text-green-600 font-medium mt-1">
                  {currencyFormat(product.price)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Estoque: {product.stock} unidades
                </p>

                <button
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => adicionarAoCarrinho(product)}
                >
                  ➕ Adicionar
                </button>

                {localStorage.getItem('role') === 'admin' && (
                  <button
                    onClick={() => desativarProduto(product._id)}
                    className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    🗑 Excluir
                  </button>
                )}
              </div>
            ))}
        </div>

        {carrinho.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🧾 Resumo do Pedido
            </h2>

            <ul className="divide-y divide-gray-200">
              {carrinho.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">
                      {item.name}
                    </span>
                    <button
                      onClick={() => removerDoCarrinho(item._id)}
                      className="bg-gray-200 hover:bg-gray-300 text-black px-3 py-1 rounded"
                    >
                      -
                    </button>
                    <span className="mx-2 text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => adicionarAoCarrinho(item)}
                      disabled={item.quantity >= item.stock}
                      className={`px-3 py-1 rounded ${
                        item.quantity >= item.stock
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {currencyFormat(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-end">
              <button
                onClick={finalizarPedido}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition"
              >
                ✅ Finalizar Pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
