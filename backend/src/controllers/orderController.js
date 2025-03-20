// controllers/orderController.js
const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    // Supondo que o middleware de autenticação coloque o usuário em req.user
    const userId = req.user.id;
    const { products, total } = req.body;
    const order = new Order({ user: userId, products, total });
    await order.save();
    res.status(201).json({ message: 'Pedido realizado com sucesso', orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao realizar pedido' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    // Para o admin: lista todos os pedidos
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('products.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    // Para que o próprio usuário visualize seus pedidos
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate('products.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar seus pedidos' });
  }
};
