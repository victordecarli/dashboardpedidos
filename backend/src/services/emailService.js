const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Configuração do transportador de e-mail
let transporter;

// Inicializa o transportador de e-mail
const initializeTransporter = () => {
  // Em ambiente de desenvolvimento, usamos o serviço Ethereal (fake SMTP)
  // Em produção, você deve usar um serviço real como Gmail, SendGrid, etc.
  if (process.env.NODE_ENV === 'production') {
    // Configuração de produção (exemplo com Gmail)
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Configuração de desenvolvimento com Ethereal (emails de teste)
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        logger.error('Falha ao criar conta de teste Ethereal', err);
        return;
      }
      
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass
        }
      });
      
      logger.info('Serviço de email de teste configurado com Ethereal');
    });
  }
};

// Envia email de redefinição de senha
const sendPasswordResetEmail = async (email, resetToken) => {
  if (!transporter) {
    logger.error('Transportador de email não inicializado');
    throw new Error('Serviço de email não configurado');
  }

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3030'}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Sistema de Pedidos" <${process.env.EMAIL_USER || 'noreply@sistema.com'}>`,
    to: email,
    subject: 'Redefinição de senha',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Redefinição de Senha</h2>
        <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha:</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" 
             style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Redefinir Senha
          </a>
        </p>
        <p>O link é válido por 1 hora. Se você não solicitou esta redefinição, ignore este e-mail.</p>
        <p style="color: #666; font-size: 0.8em; margin-top: 30px;">
          Este é um e-mail automático, por favor não responda.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    // Para Ethereal (desenvolvimento), exibimos o URL para visualizar o email
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`URL para visualizar o email: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    logger.error('Erro ao enviar email de redefinição', error);
    throw new Error('Falha ao enviar email de redefinição');
  }
};

module.exports = {
  initializeTransporter,
  sendPasswordResetEmail
}; 