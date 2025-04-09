import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Products from '../pages/Products';
import Orders from '../pages/Orders';
import AdminOrders from '../pages/AdminOrders';
import ProductFormAdmin from '../pages/ProductFormAdmin';
import Register from '../pages/Register';
import PrivateRoute from './PrivateRoute';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
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

        {/* Qualquer outra rota leva para login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
