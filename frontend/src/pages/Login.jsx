import { useState } from 'react';
import { login } from '../services/authService';
import { setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(null);

    try {
      const res = await login({ email, password });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);

      setAuthToken(token);
      navigate('/products');
    } catch (err) {
      setErro('Email ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm animate-fade-in"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Bem-vindo de volta
        </h2>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {erro && (
          <p className="text-red-500 text-sm mb-4 text-center">{erro}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white font-medium py-2 rounded-xl shadow-md"
        >
          Entrar
        </button>

        <p className="mt-6 text-sm text-center text-gray-600">
          Não tem uma conta?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Criar agora
          </a>
        </p>
      </form>
    </div>
  );
}
