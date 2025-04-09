import React, { useState } from 'react';
import { getUserRole } from '../utils/auth';
import Modal from '../components/Modal';

const Estoque = ({ estoque }) => {
  const [showModal, setShowModal] = useState(true);

  // Bloqueia acesso se não for admin
  if (getUserRole() !== 'admin') {
    return (
      showModal && (
        <Modal
          title="Acesso Negado"
          onClose={() => setShowModal(false)}
          redirecionarPara="/products"
        >
          <p className="text-red-600 text-center">
            ⛔ Este conteúdo é restrito para administradores.
          </p>
        </Modal>
      )
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Estoque</h2>
      <ul>
        {estoque.map((produto, index) => (
          <li key={index}>
            {produto.nome} - R${produto.preco} - Estoque: {produto.quantidade}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Estoque;
