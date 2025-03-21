import React, { useState } from 'react';

const RegistrarCompra = ({ estoque, onRegistrar }) => {
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState(
    estoque.length > 0 ? estoque[0].nome : '',
  );
  const [quantidade, setQuantidade] = useState('');

  const handleRegistrar = () => {
    if (cliente && produto && quantidade) {
      onRegistrar(cliente, produto, parseInt(quantidade));
      setCliente('');
      setQuantidade('');
    }
  };

  return (
    <div>
      <h2>Registrar Compra</h2>
      <input
        type="text"
        placeholder="Nome do cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />
      <select value={produto} onChange={(e) => setProduto(e.target.value)}>
        {estoque.map((item, index) => (
          <option key={index} value={item.nome}>
            {item.nome} (R${item.preco})
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Quantidade"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />
      <button onClick={handleRegistrar}>Registrar Compra</button>
    </div>
  );
};

export default RegistrarCompra;
