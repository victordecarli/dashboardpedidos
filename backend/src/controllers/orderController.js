// controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const moment = require('moment');

// Função auxiliar para formatar datas de forma segura
function formatDate(date) {
  if (!date) return 'Data não disponível';
  const formattedDate = moment(date).format('DD/MM/YYYY HH:mm');
  return formattedDate !== 'Invalid date'
    ? formattedDate
    : 'Data não disponível';
}

function handleMongooseError(err, res) {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(422).json({
      success: false,
      message: 'Erro(s) de validação',
      error: messages,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
    });
  }

  console.error('Erro:', err);
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
}

// 📌 Criar um novo pedido (CREATE)
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado.',
      });
    }

    const { products, total } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum produto selecionado.',
      });
    }
    if (total == null || total < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor total inválido ou ausente.',
      });
    }

    // Verificar cada produto individualmente
    for (const item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(422).json({
          success: false,
          message: `Produto não encontrado: ${item.product}`,
        });
      }

      if (product.status !== 'ativo') {
        return res.status(422).json({
          success: false,
          message: `Produto "${product.name}" está inativo.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(422).json({
          success: false,
          message: `Estoque insuficiente para "${product.name}". Estoque atual: ${product.stock}`,
        });
      }
    }

    const order = new Order({ user: userId, products, total });
    await order.save();

    for (const item of products) {
      try {
        const product = await Product.findById(item.product);
        if (!product) continue; // segurança

        const novoEstoque = product.stock - item.quantity;
        const novoStatus = novoEstoque <= 0 ? 'inativo' : product.status;

        await Product.findByIdAndUpdate(
          item.product,
          {
            stock: novoEstoque,
            status: novoStatus,
          },
          { new: true },
        );
      } catch (updateError) {
        console.error('Erro ao atualizar estoque do produto:', updateError);
        // Continuamos o processo mesmo com erro no update de estoque
      }
    }

    res.status(201).json({
      success: true,
      message: 'Pedido realizado com sucesso',
      data: {
        orderId: order._id,
      },
    });
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    handleMongooseError(err, res);
  }
};

// 📌 Buscar todos os pedidos  (READ)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .lean();

    if (!orders) {
      return res.status(200).json({
        success: true,
        message: 'Nenhum pedido encontrado',
        count: 0,
        data: [],
      });
    }

    const formattedOrders = orders.map((order) => {
      // Verificar se o usuário existe
      if (!order.user) {
        order.user = {
          _id: 'Usuário removido',
          name: 'Usuário removido',
          email: 'N/A',
        };
      }

      return {
        id: order._id,
        user: {
          id_user: order.user._id,
          name: order.user.name || 'Nome indisponível',
          email: order.user.email || 'Email indisponível',
        },
        products: order.products.map((item) => ({
          product_name: item.product?.name || 'Produto removido',
          price: item.product?.price || 0,
          quantity: item.quantity || 0,
        })),
        total: order.total || 0,
        status: order.status || 'processando',
        data_pedido: formatDate(order.createdAt),
        isPaid: order.isPaid,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Lista de pedidos obtida com sucesso',
      count: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (err) {
    console.error('Erro ao buscar todos os pedidos:', err);
    handleMongooseError(err, res);
  }
};

// 📌 Buscar pedidos por ID (READ)
exports.getOrderById = async (req, res) => {
  try {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de pedido inválido',
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado.',
      });
    }

    // Verificar se o usuário existe
    if (!order.user) {
      order.user = {
        _id: 'Usuário removido',
        name: 'Usuário removido',
        email: 'N/A',
      };
    }

    const formattedOrder = {
      id: order._id,
      user: {
        id_user: order.user._id,
        name: order.user.name || 'Nome indisponível',
        email: order.user.email || 'Email indisponível',
      },
      products: order.products.map((item) => ({
        product_name: item.product?.name || 'Produto removido',
        price: item.product?.price || 0,
        quantity: item.quantity || 0,
      })),
      total: order.total || 0,
      status: order.status || 'processando',
      data_pedido: formatDate(order.createdAt),
      isPaid: order.isPaid,
    };

    res.status(200).json({
      success: true,
      message: 'Pedido obtido com sucesso',
      data: formattedOrder,
    });
  } catch (err) {
    console.error('Erro ao buscar pedido por ID:', err);
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
        message: 'Usuário não autenticado.',
      });
    }

    // Adicionando tratamento de erros para a consulta
    let orders;
    try {
      orders = await Order.find({ user: userId })
        .populate('products.product', 'name price')
        .lean() // usando lean() para melhor performance
        .exec();
    } catch (dbError) {
      console.error('Erro na consulta de pedidos:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao consultar pedidos no banco de dados',
      });
    }

    // Verificar se orders é um array válido
    if (!orders || !Array.isArray(orders)) {
      return res.status(200).json({
        success: true,
        message: 'Nenhum pedido encontrado',
        count: 0,
        data: [],
      });
    }

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      products: order.products.map((item) => ({
        product_name: item.product?.name || 'Produto removido',
        price: item.product?.price || 0,
        quantity: item.quantity || 0,
      })),
      total: order.total || 0,
      status: order.status || 'processando',
      data_pedido: formatDate(order.createdAt),
      isPaid: order.isPaid,
    }));

    res.status(200).json({
      success: true,
      message: 'Pedidos dos usuários obtidos com sucesso',
      count: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (err) {
    console.error('Erro geral em getOrdersByUser:', err);
    handleMongooseError(err, res);
  }
};

// 📌 Alterar status do pedido
exports.updateOrder = async (req, res) => {
  try {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de pedido inválido',
      });
    }

    const { products, total, status, isPaid } = req.body;
    const updateData = {};

    if (products) {
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum produto selecionado.',
        });
      }
      updateData.products = products;
    }
    if (total != null) {
      if (total < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor total inválido.',
        });
      }
      updateData.total = total;
    }

    // Atualizar status (se enviado)
    if (status) {
      const allowedStatuses = ['processando', 'finalizado', 'cancelado'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status inválido. Use: ${allowedStatuses.join(', ')}`,
        });
      }
      updateData.status = status;
    }

    // Atualizar status de pagamento (se enviado)
    if (isPaid !== undefined) {
      updateData.isPaid = isPaid;
    }

    // Verificar se o pedido existe antes de tentar atualizar
    const orderExists = await Order.findById(req.params.id);
    if (!orderExists) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado.',
      });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado após atualização.',
      });
    }

    // Verificar se o usuário existe
    if (!order.user) {
      order.user = {
        _id: 'Usuário removido',
        name: 'Usuário removido',
        email: 'N/A',
      };
    }

    const formattedOrder = {
      id: order._id,
      user: {
        id_user: order.user._id,
        name: order.user.name || 'Nome indisponível',
        email: order.user.email || 'Email indisponível',
      },
      products: order.products.map((item) => ({
        product_name: item.product?.name || 'Produto removido',
        price: item.product?.price || 0,
        quantity: item.quantity || 0,
      })),
      total: order.total || 0,
      status: order.status || 'processando',
      data_pedido: formatDate(order.createdAt),
      isPaid: order.isPaid,
    };

    res.status(200).json({
      success: true,
      message: 'Pedido atualizado com sucesso',
      data: formattedOrder,
    });
  } catch (err) {
    console.error('Erro ao atualizar pedido:', err);
    handleMongooseError(err, res);
  }
};

// 📌 Excluir um produto (DELETE)
exports.deleteOrder = async (req, res) => {
  try {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de pedido inválido',
      });
    }

    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado.',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Pedido deletado com sucesso',
    });
  } catch (err) {
    console.error('Erro ao excluir pedido:', err);
    handleMongooseError(err, res);
  }
};
