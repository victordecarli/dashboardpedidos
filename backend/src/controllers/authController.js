const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

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
    const expiresIn = rememberMe ? '24d' : '12h';
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn}
    );

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro ao fazer login. Tente novamente." });
  }

};

// 1. Solicita redefinição de senha
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: 'Usuário não encontrado com esse e-mail.' });

    // Gera token temporário
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = Date.now() + 3600000; // 1 hora

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = tokenExpiration;
    await user.save();

    // Aqui você simuladamente "envia o e-mail" (substitua por serviço real depois)
    console.log(`🔐 Link de redefinição: http://localhost:3030/reset-password/${resetToken}`);

    res.status(200).json({ message: 'Token de redefinição gerado. Verifique seu e-mail.' });
  } catch (err) {
    console.error('Erro ao solicitar redefinição:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

// 2. Redefine a senha
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: 'Token inválido ou expirado.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
  }
};
