import React from 'react';
import { getUserRole } from '../utils/auth';

if (getUserRole() !== 'admin') {
  return (
    <p className="text-center mt-10 text-red-600">
      ⛔ Acesso restrito para administradores.
    </p>
  );
}

const Estoque = ({ estoque }) => {
  return (
    <div>
      <h2>Estoque</h2>
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
