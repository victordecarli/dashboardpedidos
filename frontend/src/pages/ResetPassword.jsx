import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { IoEye, IoEyeOff } from 'react-icons/io5';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Redefinir Senha</h2>
        <p className="text-sm text-gray-500 mb-6">Crie uma nova senha para sua conta.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-800 transition-all"
            >
              {showPassword ? <IoEye size={18} /> : <IoEyeOff size={18} />}
            </button>
          </div>

          <div className="mb-6 relative">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirme sua nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-800 transition-all"
            >
              {showConfirm ? <IoEye size={18} /> : <IoEyeOff size={18} />}
            </button>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-700 text-sm">{erro}</p>
            </div>
          )}

          {sucesso && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
              <p className="text-green-700 text-sm">{sucesso}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white py-2 rounded transition flex justify-center items-center`}
          >
            {loading ? 'Processando...' : 'Redefinir Senha'}
          </button>

          <p className="mt-4 text-sm text-center">
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
              Voltar ao login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
