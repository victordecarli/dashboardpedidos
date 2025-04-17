import { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { setAuthToken } from '../services/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BackgroundLoginSVG } from '../assets/svgs/backgroundLoginSVG';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { storeAuth } from '../utils/authStorage';
import { isAuthenticated } from '../utils/auth';
import { motion as Motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Verifique se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/products');
    }
  }, [navigate]);

  // Verifique se a sessão expirou
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('session') === 'expired') {
      setErro('Sua sessão expirou. Por favor, faça login novamente.');
    }
  }, [location]);

  // Validação básica de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(null);
    setIsSubmitting(true);

    // Validação de campos
    if (!email.trim()) {
      setErro('Por favor, informe seu email');
      setIsSubmitting(false);
      return;
    }

    if (!isValidEmail(email)) {
      setErro('Por favor, informe um email válido');
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setErro('Por favor, informe sua senha');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await login({ email, password, rememberMe });
      const { token, user } = res.data;

      storeAuth(token, user.role, rememberMe);
      setAuthToken(token);
      navigate('/products');
    } catch (err) {
      // Tratamento mais específico de erros
      if (err.error === 'Usuário não encontrado') {
        setErro('Usuário não encontrado');
      } else if (err.error === 'Senha incorreta') {
        setErro('Senha incorreta');
      } else {
        setErro('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo(a) de volta</h2>
              <p className="text-gray-500">Acesse sua conta para gerenciar seus pedidos</p>
            </div>

            {erro && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
              >
                <p className="text-red-700 text-sm flex items-center">
                  <span className="mr-2">⚠️</span> {erro}
                </p>
              </Motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <IoEyeOff size={20} className="text-gray-500" />
                    ) : (
                      <IoEye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Manter conectado
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                  } text-white`}
                >
                  {isSubmitting ? (
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
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  Criar agora
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
