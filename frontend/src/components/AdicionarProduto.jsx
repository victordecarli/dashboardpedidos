import React, { useState } from 'react';
import { getUserRole } from '../utils/auth';

if (getUserRole() !== 'admin') {
  return (
    <p className="text-center mt-10 text-red-600">
      ⛔ Acesso restrito para administradores.
    </p>
  );
}

const AdicionarProduto = ({ onAdicionar }) => {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const handleAdicionar = () => {
    if (nome && preco && quantidade) {
      onAdicionar(nome, parseFloat(preco), parseInt(quantidade));
      setNome('');
      setPreco('');
      setQuantidade('');
    }
  };

  return (
    <div>
      <h2>Adicionar Produto</h2>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        type="number"
        placeholder="Preço"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
      />
      <input
        type="number"
        placeholder="Quantidade"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />
      <button onClick={handleAdicionar}>Adicionar Produto</button>
    </div>
  );
};

export default AdicionarProduto;
