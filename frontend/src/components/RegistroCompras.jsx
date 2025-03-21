import React from 'react';

const RegistroCompras = ({ registros }) => {
  return (
    <div>
      <h2>Registros de Compras</h2>
      <ul>
        {registros.map((registro, index) => (
          <li key={index}>
            {registro.cliente} comprou {registro.quantidade}x{' '}
            {registro.nomeProduto} - Total: R${registro.valorTotal}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RegistroCompras;
