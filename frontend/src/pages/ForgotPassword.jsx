import { useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Esqueceu sua senha?</h2>
        <p className="text-sm text-gray-500 mb-6">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-md mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {erro && <p className="text-red-600 text-sm mt-1">{erro}</p>}
        </div>

        {mensagem && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
            <p className="text-green-700 text-sm">{mensagem}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white py-2 rounded transition flex justify-center items-center`}
        >
          {loading ? 'Enviando...' : 'Enviar link'}
        </button>

        <p className="mt-4 text-sm text-center">
          Lembrou da senha?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Voltar ao login
          </Link>
        </p>
      </form>
    </div>
  );
}
