import { useEffect, useState } from 'react';
import { getProducts, toggleProductStatus } from '../services/productService';
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

      if (novoEstoque >= 1) {
        updateProduct(produtoId, { active: true }).then(() => {
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p._id === produtoId ? { ...p, active: true } : p,
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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <AdminNavbar />
      <h1 className="text-2xl font-bold mb-4">Cardápio</h1>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">
              {currencyFormat(product.price)}
            </p>
            <p>Estoque: {product.stock} Unidades</p>
            <button
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => adicionarAoCarrinho(product)}
            >
              Adicionar
            </button>
            <button
              className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              style={{ marginLeft: '15px' }}
            >
              Excluir
            </button>
          </div>
        ))}
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products
          .filter((product) => product.active !== false) // ❌ oculta os inativos
          .map((product) => (
            <div key={product._id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-500">
                {currencyFormat(product.price)}
              </p>
              <p>Estoque: {product.stock} Unidades</p>
              <button
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => adicionarAoCarrinho(product)}
              >
                Adicionar
              </button>
              <button
                className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                style={{ marginLeft: '15px' }}
                onClick={() => {
                  toggleProductStatus;
                }}
              >
                Excluir
              </button>
            </div>
          ))}
      </div>

      {carrinho.length > 0 && (
        <div className="mt-8 border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Resumo do Pedido</h2>
          <ul className="mb-4">
            {carrinho.map((item) => (
              <li
                key={item._id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="ml-4">{item.name}</span>
                  <button
                    onClick={() => removerDoCarrinho(item._id)}
                    className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-500"
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() => adicionarAoCarrinho(item)}
                    disabled={item.quantity >= item.stock}
                    className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-500"
                  >
                    +
                  </button>
                </div>
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
