const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Verifica se JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET não está definido no .env!");
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

    logger.info(`Usuário logado com sucesso: ${user.email}`);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    logger.error("Erro no login:", err);
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

    try {
      // Envio de email usando o serviço
      await emailService.sendPasswordResetEmail(email, resetToken);
      logger.info(`Email de redefinição enviado para: ${email}`);
      
      res.status(200).json({ 
        message: 'Link de redefinição enviado para seu email. Por favor, verifique sua caixa de entrada.' 
      });
    } catch (emailError) {
      logger.error('Falha ao enviar email de redefinição:', emailError);
      
      // Geramos o link, mas falhou o envio - exibimos no log para desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        const resetLink = `http://localhost:3030/reset-password/${resetToken}`;
        logger.info(`[DEV] Link de redefinição para ${email}: ${resetLink}`);
      }
      
      res.status(500).json({ 
        error: 'Falha ao enviar o email. Por favor, tente novamente mais tarde.',
        devMessage: process.env.NODE_ENV !== 'production' ? 'Verifique o console para o link' : undefined
      });
    }
  } catch (err) {
    logger.error('Erro ao solicitar redefinição:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// 2. Redefine a senha
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Validação de força de senha
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    
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
    logger.info(`Senha redefinida com sucesso para o usuário: ${user.email}`);
    res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    logger.error('Erro ao redefinir senha:', err);
    res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
  }
};
