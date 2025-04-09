import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../services/userService';
import { BackgroundLoginSVG } from '../assets/svgs/backgroundLoginSVG';
import { IoEye } from 'react-icons/io5';
import { IoEyeOff } from 'react-icons/io5';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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
      await createUser({ ...form, role: 'user' });
      alert('Conta criada com sucesso!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Erro ao criar conta.');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex flex-1 items-center justify-center px-4 ">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-md"
        >
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            Criar sua conta
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Já tem uma conta?{' '}
            <a href="/login" className="text-indigo-600 font-semibold hover:underline">
              Faça login
            </a>
          </p>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 caret-gray-900">
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            {form.password &&  <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-800"
            >
              {showPassword ? <IoEye size={18} className='text-gray-800'  /> : <IoEyeOff size={18} />}
            </button>}
           
          </div>

          {error && <p className="text-red-600 text-sm mb-4">❌ {error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold mt-5 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Criar Conta
          </button>
        </form>
      </div>
       <div className="hidden md:flex flex-1 relative overflow-hidden">
          <BackgroundLoginSVG className="w-full h-full object-cover" />
        </div>
    </div>
  );
}
