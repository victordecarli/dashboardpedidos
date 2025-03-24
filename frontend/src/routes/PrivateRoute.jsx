import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

export default function PrivateRoute({ children, adminOnly = false }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && getUserRole() !== 'admin') {
    return (
      <p className="text-center mt-10 text-red-600">
        ⛔ Acesso restrito para administradores.
      </p>
    );
  }

  return children;
}
