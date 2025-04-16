import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Products from '../pages/Products';
import Orders from '../pages/Orders';
import AdminOrders from '../pages/AdminOrders';
import ProductFormAdmin from '../pages/ProductFormAdmin';
import Register from '../pages/Register';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import { isAuthenticated, getUserRole } from '../utils/auth';
import ClientDashboard from '../pages/ClientDashboard';

// Componente para redirecionar a rota inicial baseado no estado de autenticação
const HomeRedirect = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Redirecionar usuários comuns para o dashboard e admins para a lista de produtos
  const userRole = getUserRole()?.toLowerCase();
  if (userRole === 'admin') {
    return <Navigate to="/admin-orders" />;
  }

  return <Navigate to="/dashboard" />;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas - redireciona para /products se já estiver logado */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* A rota de redefinição de senha não usa PublicRoute porque precisamos
            permitir acesso mesmo se o usuário estiver logado */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Rota do Dashboard do Cliente */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ClientDashboard />
            </PrivateRoute>
          }
        />

        {/* Rotas protegidas para usuários autenticados */}
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />

        {/* Rotas exclusivas para administradores */}
        <Route
          path="/admin-orders"
          element={
            <PrivateRoute adminOnly>
              <AdminOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <PrivateRoute adminOnly>
              <ProductFormAdmin />
            </PrivateRoute>
          }
        />

        {/* Página inicial redireciona com base na autenticação */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Qualquer outra rota não encontrada */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
