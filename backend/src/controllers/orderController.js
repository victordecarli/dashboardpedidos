// controllers/orderController.js
const Order = require('../models/Order');
const moment = require('moment');

function handleMongooseError(err, res) {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(422).json({
      success: false,
      message: 'Erro(s) de validação',
      error: messages
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }

  console.error('Erro:', err);
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
}

// 📌 Criar um novo pedido (CREATE)
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado.'
      });
    }

    const { products, total } = req.body;
     if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum produto selecionado.'
      });
    }
   if (total == null || total < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor total inválido ou ausente.'
      });
    }

    const order = new Order({ user: userId, products, total });
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Pedido realizado com sucesso',
      data: {
        orderId: order._id
      }
    });
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Buscar todos os pedidos  (READ)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('products.product', 'name price');
    
    const formattedOrders = orders.map(order => ({
      id: order._id,
      user: {
        id_user:order.user._id,
        name: order.user.name,
        email: order.user.email
      },
      products: order.products.map(item => ({
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: order.total,
      status: order.status,
      data_pedido: moment(order.createdAt).format('DD/MM/YYYY HH:mm')
    }));

    res.status(200).json({
      success: true,
      message: 'Lista de pedidos obtida com sucesso',
      count: formattedOrders.length,
      data: formattedOrders
    });
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Buscar pedidos por ID (READ)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('products.product', 'name price');
    
     if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado.'
      });
    }
    const formattedOrder = {
      id: order._id,
      user: {
        id_user: order.user._id,
        name: order.user.name,
        email: order.user.email
      },
      products: order.products.map((item) => ({
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: order.total,
      status: order.status,
      data_pedido: moment(order.createdAt).format('DD/MM/YYYY HH:mm')
    };
      res.status(200).json({
        success: true,
        message: 'Pedido obtido com sucesso',
        data: formattedOrder
    });
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Buscar pedidos por usuario autenticado (READ)
exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
   if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado.'
      });
    }
   const orders = await Order.find({ user: userId })
      .populate('products.product', 'name price');
    
     const formattedOrders = orders.map((order) => ({
      id: order._id,
      products: order.products.map((item) => ({
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: order.total,
      status: order.status,
      data_pedido: moment(order.createdAt).format('DD/MM/YYYY HH:mm')
     }));
    
    res.status(200).json({
      success: true,
      message: 'Pedidos dos usuários obtidos com sucesso',
      count: formattedOrders.length,
      data: formattedOrders
    });
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Alterar status do pedido
exports.updateOrder = async (req, res) => {
  try {
    const { products, total } = req.body;
      if (products && (!Array.isArray(products) || products.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum produto selecionado.'
      });
    }
      if (total != null && total < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor total inválido.'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { products, total },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('products.product', 'name price');

   if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado.'
      });
    }

      const formattedOrder = {
      id: order._id,
      user: {
        id_user: order.user._id,
        name: order.user.name,
        email: order.user.email
      },
      products: order.products.map((item) => ({
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: order.total,
      status: order.status,
      data_pedido: moment(order.createdAt).format('DD/MM/YYYY HH:mm')
    };

    res.status(200).json({
      success: true,
      message: 'Pedido atualizado com sucesso',
      data: formattedOrder
    });
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Excluir um produto (DELETE)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
     if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado.'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Pedido deletado com sucesso'
    });
  } catch (err) {
    handleMongooseError(err, res);
  }
};