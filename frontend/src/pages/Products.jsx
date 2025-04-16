import { useEffect, useState } from 'react';
import { getProducts as fetchAllProducts, updateProduct } from '../services/productService';
import { createOrder } from '../services/orderService';
import { currencyFormat } from '../utils/currencyFormat';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import ConfirmDialog from '../components/ConfirmDialog';
import { getUserRole } from '../utils/auth';
import EditProductModal from '../components/EditProductModal';
import { Switch } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState();
  const [editProduct, setEditProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [viewMode, setViewMode] = useState('grid');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const navigate = useNavigate();
  const isAdmin = getUserRole()?.toLowerCase() === 'admin';

  const fetchProducts = () => {
    const url = isAdmin ? '/products?all=true' : '/products';
    fetchAllProducts(url)
      .then((res) => setProducts(res.data))
      .catch(() => toast.error('Erro ao carregar produtos'));
  };

  useEffect(() => {
    fetchProducts();
  }, [isAdmin]);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item._id === produto._id);
      const quantidadeAtual = existe ? existe.quantity : 0;

      if (quantidadeAtual >= produto.stock) {
        toast.error(`❌ Estoque máximo atingido para: ${produto.name}`);
        return prev;
      }

      const novoCarrinho = existe
        ? prev.map((item) => (item._id === produto._id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...prev, { ...produto, quantity: 1 }];

      const novaQuantidadeTotal = quantidadeAtual + 1;
      const novoEstoqueRestante = produto.stock - novaQuantidadeTotal;

      if (novoEstoqueRestante === 0) {
        updateProduct(produto._id, { active: false }).then(() => {
          fetchProducts();
        });
      }

      toast.success(`Adicionado ao carrinho: ${produto.name}`);
      return novoCarrinho;
    });
  };

  const salvarEdicaoProduto = async (dadosAtualizados) => {
    try {
      await updateProduct(editProduct._id, dadosAtualizados);
      fetchProducts();
      setEditModalOpen(false);
      setEditProduct(null);
      toast.success('Produto atualizado com sucesso!');
    } catch (err) {
      toast.error('Erro ao atualizar produto');
      console.error(err);
    }
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho((prev) => {
      const produtoNoCarrinho = prev.find((item) => item._id === produtoId);
      if (!produtoNoCarrinho) return prev;

      const novaQuantidade = produtoNoCarrinho.quantity - 1;
      const novoCarrinho = prev
        .map((item) => (item._id === produtoId ? { ...item, quantity: novaQuantidade } : item))
        .filter((item) => item.quantity > 0);

      const novoEstoque = produtoNoCarrinho.stock - novaQuantidade;

      if (novoEstoque >= 1 && produtoNoCarrinho.status === 'inativo') {
        updateProduct(produtoId, { status: 'ativo' }).then(() => {
          fetchProducts();
        });
      }

      toast('Produto removido do carrinho', { icon: '🗑' });
      return novoCarrinho;
    });
  };

  const finalizarPedido = async () => {
    const payload = {
      products: carrinho.map((item) => ({ product: item._id, quantity: item.quantity })),
      total: carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0),
    };

    try {
      await createOrder(payload);
      toast.success('✅ Pedido enviado com sucesso!');
      setCarrinho([]);
      navigate('/orders');
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
      toast.error('❌ Erro ao enviar pedido. Tente novamente.');
    }
  };

  const desativarProduto = async (produtoId) => {
    try {
      await updateProduct(produtoId, { status: 'inativo' });
      fetchProducts();
      toast.success('Produto desativado!');
    } catch (err) {
      console.error('Erro ao desativar produto:', err);
      toast.error('❌ Não foi possível desativar o produto.');
    }
  };

  const ativarProduto = async (produtoId) => {
    try {
      await updateProduct(produtoId, { status: 'ativo' });
      fetchProducts();
      toast.success('Produto ativado!');
    } catch (err) {
      console.error('Erro ao ativar produto:', err);
      toast.error('❌ Não foi possível ativar o produto.');
    }
  };

  // Filtro de produtos
  const produtosFiltrados = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || product.status === statusFilter || !isAdmin;
    const matchMin = minPrice === '' || product.price >= parseFloat(minPrice);
    const matchMax = maxPrice === '' || product.price <= parseFloat(maxPrice);
    return matchSearch && matchStatus && matchMin && matchMax;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <Toaster position="top-right" />
      <AdminNavbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">Cardápio</h1>
          <div className="flex gap-2 items-center">
            <button
              className={`p-2 rounded-lg border ${
                viewMode === 'grid' ? 'bg-indigo-100 border-indigo-400' : 'bg-white border-gray-300'
              }`}
              onClick={() => setViewMode('grid')}
              title="Visualização em grade"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg border ${
                viewMode === 'list' ? 'bg-indigo-100 border-indigo-400' : 'bg-white border-gray-300'
              }`}
              onClick={() => setViewMode('list')}
              title="Visualização em lista"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="🔍 Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Preço mín."
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-28 px-2 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Preço máx."
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-28 px-2 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {isAdmin && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Somente Ativos</option>
                <option value="inativo">Somente Inativos</option>
              </select>
            )}
          </div>
        </div>

        {/* Visualização em grid ou lista */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosFiltrados.map((product) => {
              const inativo = product.status === 'inativo';
              return (
                <div
                  key={product._id}
                  className={`border rounded-xl p-6 transition shadow-sm hover:shadow-md ${
                    inativo ? 'bg-gray-100 opacity-60' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                    {inativo && <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded">Inativo</span>}
                  </div>
                  <p className="text-sm text-gray-600">{currencyFormat(product.price)}</p>
                  <p className="text-sm text-gray-500 mb-4">Estoque: {product.stock} Unidades</p>
                  <div className="flex flex-wrap gap-2">
                    {!inativo && (
                      <button
                        className="bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-md hover:opacity-90 transition text-sm"
                        onClick={() => adicionarAoCarrinho(product)}
                      >
                        Adicionar
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setModalOpen(true);
                          }}
                          className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition text-sm"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => {
                            setEditProduct(product);
                            setEditModalOpen(true);
                          }}
                          className="bg-yellow-500 text-white px-4 py-1.5 rounded-md hover:bg-yellow-600 transition text-sm"
                        >
                          Editar
                        </button>
                        {inativo && (
                          <button
                            onClick={() => ativarProduto(product._id)}
                            className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 transition text-sm"
                          >
                            Ativar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {produtosFiltrados.map((product) => {
              const inativo = product.status === 'inativo';
              return (
                <div
                  key={product._id}
                  className={`flex flex-col md:flex-row md:items-center justify-between border rounded-xl p-4 transition shadow-sm hover:shadow-md ${
                    inativo ? 'bg-gray-100 opacity-60' : 'bg-white'
                  }`}
                >
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                      <p className="text-sm text-gray-600">{currencyFormat(product.price)}</p>
                      <p className="text-sm text-gray-500">Estoque: {product.stock} Unidades</p>
                    </div>
                    {inativo && (
                      <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded self-start">Inativo</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    {!inativo && (
                      <button
                        className="bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-md hover:opacity-90 transition text-sm"
                        onClick={() => adicionarAoCarrinho(product)}
                      >
                        Adicionar
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setModalOpen(true);
                          }}
                          className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition text-sm"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => {
                            setEditProduct(product);
                            setEditModalOpen(true);
                          }}
                          className="bg-yellow-500 text-white px-4 py-1.5 rounded-md hover:bg-yellow-600 transition text-sm"
                        >
                          Editar
                        </button>
                        {inativo && (
                          <button
                            onClick={() => ativarProduto(product._id)}
                            className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 transition text-sm"
                          >
                            Ativar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Carrinho moderno */}
        {carrinho.length > 0 && (
          <div className="mt-10 bg-white rounded-xl p-6 shadow border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Resumo do Pedido</h2>
            <ul className="space-y-4 mb-6">
              {carrinho.map((item) => (
                <li key={item._id} className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <button
                      onClick={() => removerDoCarrinho(item._id)}
                      className="bg-gray-200 text-black px-2 py-1 rounded hover:bg-gray-400"
                    >
                      🗑 Excluir
                    </button>
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">{item.quantity}</span>
                    <button
                      onClick={() => adicionarAoCarrinho(item)}
                      disabled={item.quantity >= item.stock}
                      className="bg-gray-200 text-black px-2 py-1 rounded hover:bg-gray-400 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold text-gray-900">{currencyFormat(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-lg font-bold">
                {currencyFormat(carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0))}
              </span>
            </div>
            <button
              onClick={finalizarPedido}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full font-semibold text-lg"
            >
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

      <EditProductModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditProduct(null);
        }}
        onSave={salvarEdicaoProduto}
        product={editProduct}
      />
    </div>
  );
}
