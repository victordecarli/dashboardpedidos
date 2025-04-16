import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditProductModal({ open, onClose, onSave, product }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    status: 'ativo',
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        status: product.status || 'ativo',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    });
  };

  return (
    <AnimatePresence>
      {open && product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-xl shadow-xl p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Editar Produto</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nome"
                required
                className="w-full border rounded-lg px-4 py-2 text-sm"
              />
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Preço"
                type="number"
                step="0.01"
                required
                className="w-full border rounded-lg px-4 py-2 text-sm"
              />
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Estoque"
                type="number"
                required
                className="w-full border rounded-lg px-4 py-2 text-sm"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descrição"
                className="w-full border rounded-lg px-4 py-2 text-sm"
              />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 text-sm"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
