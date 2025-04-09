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
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Adicionar Produto</h2>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <input
        type="number"
        placeholder="Preço"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <input
        type="number"
        placeholder="Quantidade"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
      />
      <button
        onClick={handleAdicionar}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Adicionar Produto
      </button>
    </div>
  );
};

export default AdicionarProduto;
