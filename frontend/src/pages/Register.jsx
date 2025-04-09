import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../services/userService';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await createUser({
        ...form,
        role: 'user',
      });

      alert('Conta criada com sucesso!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Erro ao criar conta.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm animate-fade-in"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Criar Conta
        </h2>

        <div className="mb-4">
          <input
            type="text"
            name="name"
            placeholder="Seu nome"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="email@email.com"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white font-medium py-2 rounded-xl shadow-md"
        >
          Criar Conta
        </button>

        <p className="mt-6 text-sm text-center text-gray-600">
          Já tem uma conta?{' '}
          <a href="/login" className="text-green-600 hover:underline">
            Entrar
          </a>
        </p>
      </form>
    </div>
  );
}
