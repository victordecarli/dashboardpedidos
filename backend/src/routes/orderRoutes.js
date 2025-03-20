const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isAdmin } = require('../middleware/authMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// 📌 Rotas públicas (listar produtos ativos)
router.post('/', authMiddleware, orderController.createOrder);
router.get('/user', authMiddleware, orderController.getOrdersByUser);
// 📌 Rotas protegidas (apenas adms podem acessar)
router.get('/', authMiddleware, isAdmin,orderController.getOrders);
router.get('/:id', authMiddleware,isAdmin, orderController.getOrderById);


module.exports = router;
