import { Link } from 'react-router-dom';

export default function AdminNavbar() {
  return (
    <nav className="bg-white shadow p-4 mb-6">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold text-blue-700">Painel Admin</h1>
        <div className="space-x-4">
          <Link
            to="/products"
            className="text-sm text-gray-700 hover:underline"
          >
            Produtos
          </Link>
          <Link to="/orders" className="text-sm text-gray-700 hover:underline">
            Meus Pedidos
          </Link>
          <Link
            to="/admin/orders"
            className="text-sm text-gray-700 hover:underline"
          >
            Pedidos (Admin)
          </Link>
          <Link
            to="/admin/products/new"
            className="text-sm font-semibold text-blue-600"
          >
            + Novo Produto
          </Link>
        </div>
      </div>
    </nav>
  );
}
