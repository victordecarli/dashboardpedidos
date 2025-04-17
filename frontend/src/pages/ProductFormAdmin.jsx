import { useState, useEffect } from 'react';
import { createProduct } from '../services/productService';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { getUserRole } from '../utils/auth';
import { PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { currencyFormat } from '../utils/currencyFormat';
import MainNavbar from '../components/MainNavbar';
import { compressImage } from '../utils/imageCompression';

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verifica o tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de imagem não suportado. Use JPEG, PNG, GIF ou WebP.');
      return;
    }

    // Verifica o tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    try {
      // Comprime a imagem antes de salvar
      const compressedImage = await compressImage(file);
      setImageFile(compressedImage);

      // Gera uma URL temporária para preview
      const objectUrl = URL.createObjectURL(compressedImage);
      setImagePreview(objectUrl);

      // Mostra feedback do tamanho da compressão
      const reduction = (((file.size - compressedImage.size) / file.size) * 100).toFixed(1);
      if (compressedImage.size < file.size) {
        toast.success(`Imagem comprimida! Redução de ${reduction}%`);
      }

      // Limpa a URL quando o componente for desmontado
      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.price || !form.stock) {
      setError('Nome, preço e estoque são obrigatórios.');
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    if (parseFloat(form.price) < 0 || parseInt(form.stock) < 0) {
      setError('Preço e estoque não podem ser negativos.');
      toast.error('Preço e estoque não podem ser negativos.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Criar FormData para enviar arquivo
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', parseFloat(form.price));
      formData.append('stock', parseInt(form.stock));
      formData.append('description', form.description || '');
      formData.append('status', form.status);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await createProduct(formData);
      toast.success('Produto cadastrado com sucesso!');
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
      <MainNavbar />
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
          <div className="mb-8 flex items-start flex-col gap-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Preview do produto"
                                className="w-full h-full object-contain"
                                style={{ maxHeight: '200px' }}
                              />
                            ) : (
                              <>
                                <PhotoIcon className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Clique para selecionar</span> ou arraste e solte
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF ou WebP (máx. 5MB)</p>
                              </>
                            )}
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                      </div>
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

                <div className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview do produto" className="w-full h-full object-cover" />
                  ) : (
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  )}
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
