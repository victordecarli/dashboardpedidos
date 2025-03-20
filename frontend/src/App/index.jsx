import React, { useState } from 'react';
import AdicionarProduto from './components/AdicionarProduto.jsx';
import Estoque from './components/Estoque';
import RegistrarCompra from './components/RegistrarCompra.jsx';
import RegistroCompras from './components/RegistroCompras.jsx';

const App = () => {
  const [estoque, setEstoque] = useState([]);
  const [registros, setRegistros] = useState([]);

  const adicionarProduto = (nome, preco, quantidade) => {
    setEstoque([...estoque, { nome, preco, quantidade }]);
  };

  const registrarCompra = (cliente, nomeProduto, quantidade) => {
    const produtoIndex = estoque.findIndex((p) => p.nome === nomeProduto);
    if (produtoIndex === -1) return alert('Produto não encontrado');

    const produto = estoque[produtoIndex];
    if (produto.quantidade < quantidade) return alert('Estoque insuficiente');

    const valorTotal = (produto.preco * quantidade).toFixed(2);
    const novoEstoque = [...estoque];
    novoEstoque[produtoIndex].quantidade -= quantidade;

    setEstoque(novoEstoque);
    setRegistros([
      ...registros,
      { cliente, nomeProduto, quantidade, valorTotal },
    ]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Loja Virtual</h1>
      <AdicionarProduto onAdicionar={adicionarProduto} />
      <Estoque estoque={estoque} />
      <RegistrarCompra estoque={estoque} onRegistrar={registrarCompra} />
      <RegistroCompras registros={registros} />
    </div>
  );
};

export default App;
