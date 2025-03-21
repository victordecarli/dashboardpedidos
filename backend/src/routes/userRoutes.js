const express = require("express");
const userController = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();


// 📌 Rotas protegidas (apenas adm podem acessar)

router.patch("/:id", authMiddleware,isAdmin, userController.updateUser);
router.post("/", authMiddleware,isAdmin, userController.createUser);
router.get("/", authMiddleware, isAdmin, userController.getAllUsers);
router.get("/:id", authMiddleware,isAdmin, userController.getUserById);
router.delete("/:id", authMiddleware,isAdmin, userController.deleteUser);

module.exports = router;
