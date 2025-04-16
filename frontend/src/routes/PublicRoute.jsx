import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

// Componente para rotas públicas (login, registro, etc.)
// Se o usuário já estiver autenticado, redireciona para a página de produtos
export default function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/products" />;
  }

  return children;
}
