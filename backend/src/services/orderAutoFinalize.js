const Order = require('../models/Order');

// Função para finalizar pedidos automaticamente após 10 minutos
const autoFinalizeOrders = async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Busca pedidos em processamento que foram criados há mais de 10 minutos
    const orders = await Order.find({
      status: 'processando',
      createdAt: { $lte: tenMinutesAgo },
    });

    // Atualiza o status de cada pedido para finalizado
    for (const order of orders) {
      order.status = 'finalizado';
      await order.save();
      console.log(
        `Pedido ${order._id} finalizado automaticamente após 10 minutos`,
      );
    }

    return orders.length;
  } catch (error) {
    console.error('Erro ao finalizar pedidos automaticamente:', error);
    throw error;
  }
};

// Inicia o processo de verificação periódica
const startAutoFinalizeCheck = () => {
  // Verifica a cada minuto
  setInterval(async () => {
    try {
      const finalizedCount = await autoFinalizeOrders();
      if (finalizedCount > 0) {
        console.log(
          `${finalizedCount} pedido(s) finalizado(s) automaticamente`,
        );
      }
    } catch (error) {
      console.error('Erro no processo de finalização automática:', error);
    }
  }, 60 * 1000); // 60 segundos
};

module.exports = {
  autoFinalizeOrders,
  startAutoFinalizeCheck,
};
