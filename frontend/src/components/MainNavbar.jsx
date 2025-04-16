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

  // Impede a rolagem quando o menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  const menuContentVariants = {
    hidden: { x: '-100%' },
    visible: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.1,
      },
    },
    exit: {
      x: '-100%',
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
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
              className="md:hidden text-indigo-100 hover:text-white focus:outline-none"
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
            key="mobile-menu-overlay"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="fixed inset-0 z-[999] bg-indigo-950/95 backdrop-blur-sm md:hidden"
            onClick={closeMobileMenu}
          >
            <Motion.div
              key="mobile-menu-content"
              variants={menuContentVariants}
              className="fixed left-0 top-0 h-full w-[85%] max-w-xs z-[1000] bg-indigo-950 shadow-lg pt-20 px-4 overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
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

              {/* Área inferior do menu mobile */}
              <div className="mt-auto pb-8 pt-6 border-t border-indigo-900/50">
                <div className="flex items-center gap-3 px-4 py-3 text-indigo-200">
                  <User size={20} className="text-indigo-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Sua Conta</span>
                    <span className="text-xs text-indigo-400">{isAdmin ? 'Administrador' : 'Cliente'}</span>
                  </div>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
