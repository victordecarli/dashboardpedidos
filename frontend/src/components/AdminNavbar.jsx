import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow flex justify-between items-center px-6 py-3 mb-6">
      <div className="text-blue-700 font-bold text-lg">Painel Admin</div>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/products" className="hover:underline">
          Produtos
        </Link>
        <Link to="/orders" className="hover:underline">
          Meus Pedidos
        </Link>
        <Link to="/admin-orders" className="hover:underline">
          Pedidos (Admin)
        </Link>
        <Link to="/products/new" className="hover:underline">
          + Novo Produto
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
