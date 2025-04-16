import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { motion as Motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verifique se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/products');
    }
  }, [navigate]);

  // Validação básica de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    // Validação do email
    if (!email.trim()) {
      setErro('Por favor, informe seu email');
      return;
    }

    if (!isValidEmail(email)) {
      setErro('Por favor, informe um email válido');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setMensagem('📩 Link de redefinição enviado para seu e-mail.');
    } catch (err) {
      if (err.response?.status === 404) {
        setErro('❌ Email não encontrado no sistema.');
      } else {
        setErro('❌ Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl bg-white shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Esqueceu sua senha?</h2>
            <p className="text-gray-500">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
          </div>

          {erro && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
            >
              <p className="text-red-700 text-sm flex items-center">
                <span className="mr-2">⚠️</span> {erro.replace('❌ ', '')}
              </p>
            </Motion.div>
          )}

          {mensagem && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md"
            >
              <p className="text-green-700 text-sm flex items-center">
                <span className="mr-2">✅</span> {mensagem.replace('📩 ', '')}
              </p>
            </Motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                  loading
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
                    Enviando...
                  </>
                ) : (
                  'Enviar link'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Lembrou da senha?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                Voltar ao login
              </Link>
            </p>
          </div>
        </div>
      </Motion.div>
    </div>
  );
}
