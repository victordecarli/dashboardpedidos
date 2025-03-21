import React from 'react';

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
