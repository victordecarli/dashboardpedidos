const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Aplicar proteção de rota
router.use(authMiddleware); // Precisa estar logado
router.use(isAdmin); // Precisa ser admin

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
