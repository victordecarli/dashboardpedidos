const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware, isAdmin, productController.createProduct);
router.patch('/:id', authMiddleware, isAdmin, productController.updateProduct);
router.patch(
  '/:id/status',
  authMiddleware,
  isAdmin,
  productController.toggleProductStatus,
);
router.delete('/:id', authMiddleware, isAdmin, productController.deleteProduct);

module.exports = router;
