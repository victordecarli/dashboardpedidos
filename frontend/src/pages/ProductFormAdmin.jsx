import { useState, useEffect } from 'react';
import { createProduct } from '../services/productService';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import Modal from '../components/Modal';
import { getUserRole } from '../utils/auth';
import { PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { currencyFormat } from '../utils/currencyFormat';

export default function ProductFormAdmin() {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    status: 'ativo',
  });

  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = getUserRole();
    if (role !== 'admin') {
      setShowModal(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    };

    if (payload.price < 0 || payload.stock < 0) {
      setError('Preço e estoque não podem ser negativos.');
      toast.error('Preço e estoque não podem ser negativos.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createProduct(payload);
      toast.success(' Produto cadastrado com sucesso!');
      navigate('/products');
    } catch (err) {
      console.error(err);
      setError('Erro ao cadastrar produto. Verifique os dados ou permissão.');
      toast.error('Erro ao cadastrar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            navigate('/products');
          }}
          title="Acesso Negado"
        >
          <p className="text-center text-red-600">⛔ Esta página é exclusiva para administradores.</p>
        </Modal>
      )}

      {!showModal && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Voltar para produtos
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Cadastrar Novo Produto</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ex: Pizza Margherita"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                          <input
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0,00"
                            type="number"
                            step="0.01"
                            required
                            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                        <input
                          name="stock"
                          value={form.stock}
                          onChange={handleChange}
                          placeholder="Quantidade disponível"
                          type="number"
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Descreva os detalhes do produto..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`bg-blue-600 text-white px-6 py-2.5 rounded-lg transition ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                        }`}
                      >
                        {isSubmitting ? 'Cadastrando...' : 'Cadastrar Produto'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="hidden md:block">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pré-visualização</h2>

                <div className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{form.name || 'Nome do Produto'}</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {form.price ? currencyFormat(form.price) : 'R$ 0,00'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      {form.description || 'Descrição do produto aparecerá aqui...'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Estoque: {form.stock || '0'} unidades</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        form.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {form.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
