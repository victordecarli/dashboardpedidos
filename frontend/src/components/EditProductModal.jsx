import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, DialogBackdrop } from '@headlessui/react';
import toast from 'react-hot-toast';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function EditProductModal({ open, onClose, onSave, product }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    status: 'ativo',
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        status: product.status || 'ativo',
      });

      // Reset image state
      setImageFile(null);
      // Set preview from existing image
      setImagePreview(product.image || null);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
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

    setImageFile(file);

    // Gera uma URL temporária para preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    // Limpa a URL quando o componente for desmontado
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.stock) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }
    setSaving(true);
    try {
      // Criar FormData se houver arquivo de imagem
      if (imageFile) {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('price', parseFloat(form.price));
        formData.append('stock', parseInt(form.stock));
        formData.append('description', form.description || '');
        formData.append('status', form.status);
        formData.append('image', imageFile);

        await onSave(formData);
      } else {
        // Sem arquivo, envia dados normais
        await onSave({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
        });
      }
    } catch {
      toast.error('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 text-center flex items-center justify-center">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </TransitionChild>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="inline-block w-full max-w-3xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
              <div className="flex flex-col md:flex-row">
                {/* Formulário */}
                <div className="flex-1 p-8">
                  <DialogTitle as="h2" className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">
                    Editar Produto
                  </DialogTitle>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Nome"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                        <input
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="Preço"
                          type="number"
                          step="0.01"
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                        <input
                          name="stock"
                          value={form.stock}
                          onChange={handleChange}
                          placeholder="Estoque"
                          type="number"
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Descrição"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {imagePreview ? (
                              imageError ? (
                                <div className="flex flex-col items-center justify-center">
                                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">Imagem não disponível</p>
                                </div>
                              ) : (
                                <img
                                  src={imagePreview}
                                  alt="Preview do produto"
                                  className="w-full h-full object-contain"
                                  style={{ maxHeight: '150px' }}
                                  onError={() => setImageError(true)}
                                />
                              )
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold ${
                          saving ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        disabled={saving}
                      >
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </form>
                </div>
                {/* Preview do produto */}
                <div className="hidden md:block w-80 bg-gray-50 border-l border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Visualização em tempo real</h3>

                  <div className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      imageError ? (
                        <div className="flex flex-col items-center justify-center">
                          <PhotoIcon className="w-12 h-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">Imagem não disponível</p>
                        </div>
                      ) : (
                        <img
                          src={imagePreview}
                          alt="Preview do produto"
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      )
                    ) : (
                      <PhotoIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  <div className="mb-2 text-xl font-bold text-gray-900">{form.name || 'Nome do produto'}</div>
                  <div className="mb-2 text-lg text-blue-700">
                    {form.price ? `R$ ${Number(form.price).toFixed(2).replace('.', ',')}` : 'Preço'}
                  </div>
                  <div className="mb-2 text-gray-600">Estoque: {form.stock || 0} unidades</div>
                  <div className="mb-2 text-gray-500 min-h-[48px]">{form.description || 'Descrição do produto...'}</div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      form.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {form.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
