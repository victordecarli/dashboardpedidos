import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getUserRole } from '../utils/auth';
import { Home, ShoppingBag, ClipboardList, PlusCircle, LogOut, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

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

  // Fecha o menu mobile quando a rota muda
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navbarClass = `fixed top-0 w-full z-50 transition-all duration-300 ${
    scrolled ? 'bg-indigo-950/95 backdrop-blur-sm shadow-lg py-2' : 'bg-indigo-950 py-3'
  }`;

  const navItemClass = (path) =>
    `px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm ${
      location.pathname === path
        ? 'bg-indigo-600 text-white font-medium shadow-sm'
        : 'bg-transparent text-indigo-100 hover:text-white hover:bg-indigo-800/60'
    }`;

  const mobileNavItemClass = (path) =>
    `px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
      location.pathname === path
        ? 'bg-indigo-600 text-white font-medium'
        : 'bg-transparent text-indigo-100 hover:text-white hover:bg-indigo-800/60'
    }`;

  // Animação para o menu mobile
  const menuVariants = {
    hidden: { opacity: 0, x: '-100%' },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: '-100%', transition: { duration: 0.2 } },
  };

  return (
    <>
      <nav className={navbarClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to={isAdmin ? '/admin-orders' : '/dashboard'} className="flex items-center gap-2">
                <Motion.span
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 5 }}
                  className="text-white font-bold text-xl"
                >
                  Pedidos
                </Motion.span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full border border-white/10">
                  {isAdmin ? 'Admin' : 'Cliente'}
                </span>
              </Link>
            </div>

            {/* Links para desktop */}
            <div className="hidden md:flex items-center gap-3">
              {!isAdmin && (
                <Link to="/dashboard" className={navItemClass('/dashboard')}>
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              )}
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
              <Motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="bg-red-600/90 hover:bg-red-700 text-white ml-1 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <LogOut size={16} />
                Sair
              </Motion.button>
            </div>

            {/* Botão para abrir menu mobile */}
            <Motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden text-indigo-100 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Motion.button>
          </div>
        </div>
      </nav>

      {/* Espaço para compensar a navbar fixa */}
      <div className="h-16"></div>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Motion.div
            key="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="fixed inset-0 z-40 bg-indigo-950/98 backdrop-blur-md md:hidden"
          >
            <div className="pt-20 px-4">
              <div className="flex flex-col gap-2">
                {!isAdmin && (
                  <Link to="/dashboard" className={mobileNavItemClass('/dashboard')} onClick={closeMobileMenu}>
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                )}
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
                <Motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="mt-4 bg-red-600/90 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-3 text-base font-medium"
                >
                  <LogOut size={20} />
                  Sair
                </Motion.button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
