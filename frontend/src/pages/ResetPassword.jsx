import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (password !== confirm) {
      return setErro('❌ As senhas não coincidem.');
    }

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSucesso('✅ Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      setErro('❌ Token inválido ou expirado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Redefinir Senha</h2>

        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {erro && <p className="text-red-600 text-sm mb-3">{erro}</p>}
        {sucesso && <p className="text-green-600 text-sm mb-3">{sucesso}</p>}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Redefinir Senha
        </button>
      </form>
    </div>
  );
}
