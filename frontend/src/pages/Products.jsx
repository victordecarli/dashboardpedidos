import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import { createOrder } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { updateProduct } from '../services/productService';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => alert('Erro ao carregar produtos'));
  }, []);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item._id === produto._id);
      const quantidadeAtual = existe ? existe.quantity : 0;

      if (quantidadeAtual >= produto.stock) {
        alert(`❌ Estoque máximo atingido para: ${produto.name}`);
        return prev;
      }

      const novoCarrinho = existe
        ? prev.map((item) => (item._id === produto._id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...prev, { ...produto, quantity: 1 }];

      const novaQuantidadeTotal = quantidadeAtual + 1;
      const novoEstoqueRestante = produto.stock - novaQuantidadeTotal;

      // Se estoque chegou a 0, atualiza no backend
      if (novoEstoqueRestante === 0) {
        updateProduct(produto._id, { active: false }).then(() => {
          // Atualiza localmente também (opcional, mas melhora UX)
          setProducts((prevProducts) => prevProducts.map((p) => (p._id === produto._id ? { ...p, active: false } : p)));
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
        .map((item) => (item._id === produtoId ? { ...item, quantity: novaQuantidade } : item))
        .filter((item) => item.quantity > 0);

      // Se antes o estoque estava em 0 e agora voltou a ter (ex: 1)
      const novoEstoque = produtoNoCarrinho.stock - novaQuantidade;

      if (novoEstoque >= 1 && produtoNoCarrinho.status === 'inativo') {
        updateProduct(produtoId, { status: 'ativo' }).then(() => {
          setProducts((prevProducts) => prevProducts.map((p) => (p._id === produtoId ? { ...p, status: 'ativo' } : p)));
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
      total: carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0),
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
      setProducts((prevProducts) => prevProducts.map((p) => (p._id === produtoId ? { ...p, status: 'inativo' } : p)));
    } catch (err) {
      console.error('Erro ao desativar produto:', err);
      alert('❌ Não foi possível desativar o produto.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <AdminNavbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cardápio</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products
            .filter((product) => product.status === 'ativo')
            .map((product) => (
              <div
                key={product._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{currencyFormat(product.price)}</p>
                <p className="text-sm text-gray-500 mb-4">Estoque: {product.stock} Unidades</p>

                <div className="flex gap-2">
                  <button
                    className="bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-md hover:opacity-90 transition text-sm"
                    onClick={() => adicionarAoCarrinho(product)}
                  >
                    Adicionar
                  </button>
                  {localStorage.getItem('role') === 'admin' && (
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setModalOpen(true);
                      }}
                      className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition text-sm"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {carrinho.length > 0 && (
          <div className="mt-10 bg-white rounded-xl p-6 shadow border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Resumo do Pedido</h2>
            <ul className="space-y-4 mb-6">
              {carrinho.map((item) => (
                <li key={item._id} className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <span>{item.name}</span>
                    <button
                      onClick={() => removerDoCarrinho(item._id)}
                      className="bg-gray-200 text-black px-2 py-1 rounded hover:bg-gray-400"
                    >
                      🗑 Excluir
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => adicionarAoCarrinho(item)}
                      disabled={item.quantity >= item.stock}
                      className="bg-gray-200 text-black px-2 py-1 rounded hover:bg-gray-400 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span>{currencyFormat(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <button onClick={finalizarPedido} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Finalizar Pedido
            </button>
          </div>
        )}
      </main>
      {selectedProduct && (
        <ConfirmDialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={() => desativarProduto(selectedProduct._id)}
          title="Deseja mesmo excluir este produto?"
          message={`Essa ação desativará permanentemente "${selectedProduct.name}".`}
        />
      )}
    </div>
  );
}
