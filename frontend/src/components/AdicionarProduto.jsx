import React, { useState, useEffect } from 'react';
import { getUserRole } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const AdicionarProduto = ({ onAdicionar }) => {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const isAdmin = getUserRole() === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setShowModal(true);
    }
  }, [isAdmin]);

  const handleFecharModal = () => {
    setShowModal(false);
    navigate('/products');
  };

  if (!isAdmin) {
    return (
      <>
        {showModal && (
          <Modal title="Acesso Negado" onClose={handleFecharModal}>
            <p className="text-red-600 text-center">
              ⛔ Este conteúdo é restrito para administradores.
            </p>
          </Modal>
        )}
      </>
    );
  }

  const handleAdicionar = () => {
    if (nome && preco && quantidade) {
      onAdicionar(nome, parseFloat(preco), parseInt(quantidade));
      setNome('');
      setPreco('');
      setQuantidade('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Adicionar Produto
        </h2>

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleAdicionar}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg w-full transition duration-200"
        >
          Adicionar Produto
        </button>
      </div>
    </div>
  );
};

export default AdicionarProduto;
