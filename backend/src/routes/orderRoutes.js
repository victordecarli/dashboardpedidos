const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// 📌 Rotas públicas (listar produtos ativos)
router.post('/', authMiddleware, orderController.createOrder);
router.get('/user', authMiddleware, orderController.getOrdersByUser);
// 📌 Rotas protegidas (apenas adms podem acessar)
router.get('/', authMiddleware, isAdmin, orderController.getAllOrders);
router.patch('/:id', authMiddleware, isAdmin, orderController.updateOrder);
router.get('/:id', authMiddleware, isAdmin, orderController.getOrderById);
router.delete('/:id', authMiddleware, isAdmin, orderController.deleteOrder);

module.exports = router;
