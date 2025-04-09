import { useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    try {
      await api.post('/auth/forgot-password', { email });
      setMensagem('📩 Link de redefinição enviado para seu e-mail.');
    } catch (err) {
      setErro('❌ E-mail não encontrado ou erro no servidor.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Esqueceu sua senha?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        <input
          type="email"
          placeholder="email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {mensagem && <p className="text-green-600 text-sm mb-3">{mensagem}</p>}
        {erro && <p className="text-red-600 text-sm mb-3">{erro}</p>}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Enviar link
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
