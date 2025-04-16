import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { motion as Motion } from 'framer-motion';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validação de força de senha
  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // Validação das senhas
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErro(`❌ ${passwordError}`);
      return;
    }

    if (password !== confirm) {
      setErro('❌ As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSucesso('✅ Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response?.data?.error) {
        setErro(`❌ ${err.response.data.error}`);
      } else {
        setErro('❌ Token inválido ou expirado.');
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Redefinir Senha</h2>
            <p className="text-gray-500">Crie uma nova senha segura para sua conta.</p>
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

          {sucesso && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md"
            >
              <p className="text-green-700 text-sm flex items-center">
                <span className="mr-2">✅</span> {sucesso.replace('✅ ', '')}
              </p>
            </Motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nova senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || sucesso}
                  className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
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
              <p className="mt-1 text-xs text-gray-500">A senha deve ter pelo menos 6 caracteres</p>
            </div>

            <div className="relative">
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={loading || sucesso}
                  className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                  aria-label={showConfirm ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                >
                  {showConfirm ? (
                    <IoEyeOff size={20} className="text-gray-500" />
                  ) : (
                    <IoEye size={20} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || sucesso}
                className={`w-full flex justify-center items-center rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                  loading || sucesso
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
                ) : sucesso ? (
                  'Senha redefinida!'
                ) : (
                  'Redefinir Senha'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
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
