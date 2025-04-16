import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { BackgroundLoginSVG } from '../assets/svgs/backgroundLoginSVG';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { isAuthenticated } from '../utils/auth';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Verifique se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/products');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validação de campos
  const validateForm = () => {
    // Validar nome
    if (!form.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      setError('E-mail inválido');
      return false;
    }

    // Validar senha
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    // Confirmar senha
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'user',
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.error) {
        setError(err.error);
      } else {
        setError('Ocorreu um erro ao criar a conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex flex-1 items-center justify-center px-4 bg-gray-100">
        <form onSubmit={handleRegister} className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Criar sua conta</h2>
          <p className="text-sm text-gray-500 mb-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Faça login
            </Link>
          </p>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-6">
              <p className="text-green-700 text-sm">✅ Conta criada com sucesso! Redirecionando para o login...</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              disabled={loading || success}
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
              disabled={loading || success}
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
              disabled={loading || success}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-800 transition-all"
              disabled={loading || success}
            >
              {showPassword ? <IoEye size={18} /> : <IoEyeOff size={18} />}
            </button>
          </div>

          <div className="mb-6 relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading || success}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-800 transition-all"
              disabled={loading || success}
            >
              {showConfirmPassword ? <IoEye size={18} /> : <IoEyeOff size={18} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className={`w-full ${
              loading || success ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white font-semibold py-2 rounded-md transition flex justify-center items-center`}
          >
            {loading ? 'Processando...' : 'Criar Conta'}
          </button>
        </form>
      </div>
      <div className="hidden md:flex flex-1 relative overflow-hidden">
        <BackgroundLoginSVG className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
