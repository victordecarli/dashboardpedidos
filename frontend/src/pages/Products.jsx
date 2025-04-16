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
import {
  ListBulletIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

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
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

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
    const existe = carrinho.find((item) => item._id === produto._id);
    const quantidadeAtual = existe ? existe.quantity : 0;

    if (quantidadeAtual >= produto.stock) {
      toast.error(`❌ Estoque máximo atingido para: ${produto.name}`);
      return;
    }

    const novoCarrinho = existe
      ? carrinho.map((item) => (item._id === produto._id ? { ...item, quantity: item.quantity + 1 } : item))
      : [...carrinho, { ...produto, quantity: 1 }];

    const novaQuantidadeTotal = quantidadeAtual + 1;
    const novoEstoqueRestante = produto.stock - novaQuantidadeTotal;

    setCarrinho(novoCarrinho);
    setCarrinhoAberto(true);
    toast.success(`Adicionado ao carrinho: ${produto.name}`);

    if (novoEstoqueRestante === 0) {
      updateProduct(produto._id, { active: false }).then(() => {
        fetchProducts();
      });
    }
  };

  const salvarEdicaoProduto = async (dadosAtualizados) => {
    try {
      await updateProduct(editProduct._id, dadosAtualizados);
      setEditModalOpen(false);
      setEditProduct(null);
      await fetchProducts();
      toast.success('Produto atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar produto');
    }
  };

  const removerDoCarrinho = (produtoId) => {
    const produtoNoCarrinho = carrinho.find((item) => item._id === produtoId);
    if (!produtoNoCarrinho) return;

    const novaQuantidade = produtoNoCarrinho.quantity - 1;
    const novoCarrinho = carrinho
      .map((item) => (item._id === produtoId ? { ...item, quantity: novaQuantidade } : item))
      .filter((item) => item.quantity > 0);

    const novoEstoque = produtoNoCarrinho.stock - novaQuantidade;

    setCarrinho(novoCarrinho);
    toast('Produto removido do carrinho', { icon: '🗑' });

    if (novoEstoque >= 1 && produtoNoCarrinho.status === 'inativo') {
      updateProduct(produtoId, { status: 'ativo' }).then(() => {
        fetchProducts();
      });
    }
  };

  const removerItemCompleto = (produtoId) => {
    const novoCarrinho = carrinho.filter((item) => item._id !== produtoId);
    setCarrinho(novoCarrinho);
    toast('Item removido do carrinho', { icon: '🗑' });
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
      setCarrinhoAberto(false);
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

  // Cálculo do total do carrinho
  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantity, 0);

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
            {carrinho.length > 0 && (
              <button
                className="relative p-2 rounded-lg border bg-blue-100 border-blue-400 ml-2"
                onClick={() => setCarrinhoAberto(!carrinhoAberto)}
                title="Ver carrinho"
              >
                <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItens}
                </span>
              </button>
            )}
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
        {carrinho.length > 0 && carrinhoAberto && (
          <div className="fixed inset-0 z-40 overflow-y-auto md:inset-auto md:top-20 md:right-6 md:left-auto md:bottom-auto md:w-96">
            <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 max-h-[calc(100vh-40px)] md:max-h-[calc(100vh-120px)] flex flex-col">
              <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Seu Carrinho
                </h2>
                <button onClick={() => setCarrinhoAberto(false)} className="text-gray-500 hover:text-gray-700 p-1">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                {carrinho.length === 0 ? (
                  <p className="text-center text-gray-500">Seu carrinho está vazio</p>
                ) : (
                  <ul className="space-y-5">
                    {carrinho.map((item) => (
                      <li key={item._id} className="flex flex-col border-b border-gray-100 pb-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-gray-800">{item.name}</span>
                          <span className="font-semibold text-gray-900">
                            {currencyFormat(item.price * item.quantity)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => removerDoCarrinho(item._id)}
                              disabled={item.quantity <= 1}
                              className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-40"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="px-2 py-1 min-w-[30px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => adicionarAoCarrinho(item)}
                              disabled={item.quantity >= item.stock}
                              className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-40"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removerItemCompleto(item._id)}
                            className="text-red-600 p-1 hover:bg-red-50 rounded"
                            title="Remover item"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="sticky bottom-0 bg-white z-10 px-6 py-4 border-t border-gray-200 rounded-b-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    Subtotal ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
                  </span>
                  <span className="text-lg font-bold text-gray-900">{currencyFormat(totalCarrinho)}</span>
                </div>
                <button
                  onClick={finalizarPedido}
                  className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 w-full font-semibold text-base flex items-center justify-center"
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contador flutuante do carrinho para móveis */}
        {!carrinhoAberto && carrinho.length > 0 && (
          <div className="md:hidden fixed bottom-4 right-4 z-30">
            <button
              onClick={() => setCarrinhoAberto(true)}
              className="bg-blue-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {totalItens}
              </span>
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
