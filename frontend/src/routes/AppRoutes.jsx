import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Products from "../pages/Products";
import Orders from "../pages/Orders";
import PrivateRoute from "./PrivateRoute";
import AdminOrders from "../pages/AdminOrders";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>
         <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
