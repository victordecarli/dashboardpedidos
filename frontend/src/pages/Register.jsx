import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { BackgroundLoginSVG } from '../assets/svgs/backgroundLoginSVG';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { isAuthenticated } from '../utils/auth';
import { motion as Motion } from 'framer-motion';

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
    <div className="min-h-screen flex overflow-hidden bg-gray-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl bg-white shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar sua conta</h2>
              <p className="text-gray-500">Registre-se para começar a fazer pedidos</p>
            </div>

            {error && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
              >
                <p className="text-red-700 text-sm flex items-center">
                  <span className="mr-2">⚠️</span> {error}
                </p>
              </Motion.div>
            )}

            {success && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md"
              >
                <p className="text-green-700 text-sm flex items-center">
                  <span className="mr-2">✅</span> Conta criada com sucesso! Redirecionando para o login...
                </p>
              </Motion.div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
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
                  className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
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
                  className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={loading || success}
                    className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                    disabled={loading || success}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <IoEyeOff size={20} className="text-gray-500" />
                    ) : (
                      <IoEye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">A senha deve ter pelo menos 6 caracteres</p>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading || success}
                    className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                    disabled={loading || success}
                    aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  >
                    {showConfirmPassword ? (
                      <IoEyeOff size={20} className="text-gray-500" />
                    ) : (
                      <IoEye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`w-full flex justify-center items-center rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                    loading || success
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processando...
                    </>
                  ) : success ? (
                    'Conta criada!'
                  ) : (
                    'Criar Conta'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </Motion.div>
      </div>

      <div className="hidden lg:block relative flex-1 overflow-hidden">
        <BackgroundLoginSVG className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  );
}
