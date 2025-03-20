const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica se JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.error("⚠️ ERRO: JWT_SECRET não está definido no .env!");
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    // Verifica se o usuário existe
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Verifica se a senha está correta
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Senha incorreta' });

    // Gera o token JWT
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Expira em 7 dias
    );

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro ao fazer login. Tente novamente." });
  }

};
