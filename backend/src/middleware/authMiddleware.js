const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Acesso negado!' });

  try {
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET,
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Token inválido!' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'Apenas administradores podem realizar esta ação.' });
  }
  next();
};

module.exports = {
  authMiddleware,
  isAdmin,
};
