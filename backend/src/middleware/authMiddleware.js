const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Acesso negado! Token não fornecido.' });

  try {
    const tokenValue = token.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expirado! Faça login novamente.',
          code: 'TOKEN_EXPIRED' 
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Token inválido! Faça login novamente.',
          code: 'INVALID_TOKEN' 
        });
      }
      return res.status(401).json({ error: 'Token inválido!' });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Erro ao processar o token de autenticação.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ 
        error: 'Apenas administradores podem realizar esta ação.',
        code: 'ADMIN_REQUIRED'
      });
  }
  next();
};

module.exports = {
  authMiddleware,
  isAdmin,
};
