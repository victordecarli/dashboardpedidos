const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin } = require('../middleware/authMiddleware');
const authMiddleware = require('../middleware/authMiddleware')

// 📌 Rotas públicas (listar produtos ativos)
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// 📌 Rotas protegidas (apenas usuários autenticados podem acessar)
router.post('/', authMiddleware,isAdmin, productController.createProduct);
router.patch('/:id', authMiddleware, isAdmin, productController.updateProduct); 
router.patch('/:id/status', authMiddleware, isAdmin, productController.toggleProductStatus);
router.delete('/:id', authMiddleware,isAdmin, productController.deleteProduct);

module.exports = router;
