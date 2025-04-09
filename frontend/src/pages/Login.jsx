import { useState } from 'react';
import { login } from '../services/authService';
import { setAuthToken } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
// importa SVG background
import { BackgroundLoginSVG } from '../assets/svgs/backgroundLoginSVG';
// importar icons
import { IoEye } from 'react-icons/io5';
import { IoEyeOff } from 'react-icons/io5';
import { storeAuth } from '../utils/authStorage';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(null);

    try {
      const res = await login({ email, password, rememberMe });

      const { token, user } = res.data;

      storeAuth(token, user.role, rememberMe);

      setAuthToken(token);
      navigate('/products');
    } catch (err) {
      setErro('Email ou senha inválidos');
      console.error(err);
    }
  };

  return (
    <>
      <div className="min-h-screen flex bg-white">
        <div className="flex  flex-1 items-center justify-center px-4 bg-gray-100">
          <form method="POST" onSubmit={handleLogin} className="w-full max-w-md">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Faça login na sua conta</h2>
            <p className="text-sm text-gray-500 mb-8">
              Não tem uma conta?{' '}
              <a href="/register" className="text-indigo-600 font-semibold hover:underline">
                Crie uma agora!
              </a>
            </p>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='email'
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-800 cursor-pointer transition-all"
                >
                  {showPassword ? <IoEye size={18} className='text-gray-800'  /> : <IoEyeOff size={18} />}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2 cursor-pointer"
                />
                Me manter logado
              </label>
              {/* <Link to="/forgot-password" className="text-sm text-indigo-600 font-medium hover:underline">
                Esqueceu sua senha?
              </Link> */}
            </div>

            {erro && <p className="text-red-600 text-sm mb-4">{erro}</p>}

            <button
              type="submit"
              className="w-full bg-indigo-600 cursor-pointer text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Entrar
            </button>
          </form>
        </div>
        <div className="hidden md:flex flex-1 relative overflow-hidden">
          <BackgroundLoginSVG className="w-full h-full object-cover" />
        </div>
      </div>
    </>
  );
}
