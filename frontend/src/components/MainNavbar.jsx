import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getUserRole } from '../utils/auth';
import { Home, ShoppingBag, ClipboardList, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MainNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getUserRole();
  const isAdmin = role === 'admin';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detecta rolagem para mudar a aparência da navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navbarClass = `fixed top-0 w-full z-50 transition-all duration-300 ${
    scrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg py-2' : 'bg-gray-900 py-3'
  }`;

  const navItemClass = (path) =>
    `px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm ${
      location.pathname === path
        ? 'bg-indigo-600 text-white font-medium shadow-sm'
        : 'text-gray-300 hover:text-white hover:bg-gray-800'
    }`;

  const mobileNavItemClass = (path) =>
    `px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
      location.pathname === path
        ? 'bg-indigo-600 text-white font-medium'
        : 'text-gray-200 hover:text-white hover:bg-gray-800'
    }`;

  return (
    <>
      <nav className={navbarClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/products" className="flex items-center gap-2">
                <span className="text-indigo-500 font-bold text-xl">Pedidos</span>
                <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {isAdmin ? 'Admin' : 'Cliente'}
                </span>
              </Link>
            </div>

            {/* Links para desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/products" className={navItemClass('/products')}>
                <Home size={16} />
                Produtos
              </Link>
              <Link to="/orders" className={navItemClass('/orders')}>
                <ShoppingBag size={16} />
                Meus Pedidos
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin-orders" className={navItemClass('/admin-orders')}>
                    <ClipboardList size={16} />
                    Gerenciar Pedidos
                  </Link>
                  <Link to="/products/new" className={navItemClass('/products/new')}>
                    <PlusCircle size={16} />
                    Novo Produto
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white ml-1 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>

            {/* Botão para abrir menu mobile */}
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Espaço para compensar a navbar fixa */}
      <div className="h-16"></div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-sm">
          <div className="pt-20 px-4">
            <div className="flex flex-col gap-2">
              <Link to="/products" className={mobileNavItemClass('/products')} onClick={closeMobileMenu}>
                <Home size={20} />
                Produtos
              </Link>
              <Link to="/orders" className={mobileNavItemClass('/orders')} onClick={closeMobileMenu}>
                <ShoppingBag size={20} />
                Meus Pedidos
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin-orders" className={mobileNavItemClass('/admin-orders')} onClick={closeMobileMenu}>
                    <ClipboardList size={20} />
                    Gerenciar Pedidos
                  </Link>
                  <Link to="/products/new" className={mobileNavItemClass('/products/new')} onClick={closeMobileMenu}>
                    <PlusCircle size={20} />
                    Novo Produto
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-3 text-base font-medium"
              >
                <LogOut size={20} />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
