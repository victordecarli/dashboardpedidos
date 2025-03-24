import { useState } from 'react';
import { createProduct } from '../services/productService';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

import { getUserRole } from '../utils/auth';

export default function ProductFormAdmin() {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    status: 'ativo',
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🚫 Verifica se o usuário é admin
  if (getUserRole() !== 'admin') {
    return (
      <div className="p-10 text-center text-red-600 font-semibold text-lg">
        ⛔ Acesso restrito para administradores.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      };
      await createProduct(payload);
      alert('Produto cadastrado com sucesso!');
      navigate('/products');
    } catch (err) {
      console.error(err);
      setError('Erro ao cadastrar produto. Verifique os dados ou permissão.');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <AdminNavbar />
      <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Cadastrar Novo Produto
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nome do produto"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Preço"
            type="number"
            step="0.01"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Estoque"
            type="number"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descrição (opcional)"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white w-full px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Cadastrar Produto
          </button>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
