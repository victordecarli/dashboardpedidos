import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';
import Modal from '../components/Modal';
import { useState } from 'react';

export default function PrivateRoute({ children, adminOnly = false }) {
  const [showModal, setShowModal] = useState(true);
  const isAuth = isAuthenticated();
  const role = getUserRole();

  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && role !== 'admin') {
    if (showModal) {
      return (
        <Modal onClose={() => setShowModal(false)} title="Acesso Restrito" redirecionarPara="/products">
          <p className="text-center text-red-600">⛔ Esta página é exclusiva para administradores.</p>
        </Modal>
      );
    }

    return <Navigate to="/products" />;
  }

  return children;
}
