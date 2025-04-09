import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
// react-icons
import { ImExit } from 'react-icons/im';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = (path) =>
    `px-3 py-1.5 rounded-md transition ${
      location.pathname === path
        ? 'bg-indigo-600 text-white hover:bg-indigo-500'
        : 'text-slate-300 hover:text-white hover:bg-gray-800'
    }`;

  return (
    <nav className="bg-[#0f172a] text-white flex justify-between items-center px-6 py-3 mb-6">
      <div className="font-bold text-lg">
        <span className="font-bold text-lg ">{role === 'admin' ? 'Admin' : 'User'}</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/products" className={navItemClass('/products')}>
          Produtos
        </Link>
        <Link to="/orders" className={navItemClass('/orders')}>
          Meus Pedidos
        </Link>
        {role === 'admin' && (
          <>
            <Link to="/admin-orders" className={navItemClass('/admin-orders')}>
              Pedidos (Admin)
            </Link>
            <Link to="/products/new" className={navItemClass('/products/new')}>
              + Novo Produto
            </Link>
          </>
        )}
        <button onClick={handleLogout} className="bg-red-500 cursor-pointer text-white font-bold px-3 py-1 rounded hover:bg-red-400 ml-2 flex gap-2 items-center">
          <ImExit />
          Sair
        </button>
      </div>
    </nav>
  );
}
