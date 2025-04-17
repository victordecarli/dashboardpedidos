const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

let transporter = null;

/**
 * Configura o serviço de email
 * @returns {Object} Objeto transporter do Nodemailer
 */
const configureEmail = () => {
  if (!config.email.auth.user || !config.email.auth.pass) {
    logger.warn('Credenciais de email não configuradas');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465, // true para 465, false para outras portas
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      },
      // Configurações adicionais para lidar com erros de SSL
      tls: {
        // Não falha em certificados inválidos
        rejectUnauthorized: false,
        // Usa versões modernas do protocolo
        minVersion: 'TLSv1.2'
      }
    });

    logger.info('Serviço de email configurado com sucesso');
    
    // Verificar a conexão com o servidor de email
    transporter.verify((error) => {
      if (error) {
        logger.error('Erro na verificação do email:', error);
      } else {
        logger.info('Servidor de email pronto para enviar mensagens');
      }
    });

    return transporter;
  } catch (error) {
    logger.error('Erro ao configurar serviço de email:', error);
    return null;
  }
};

/**
 * Envia um email
 * @param {Object} options Opções do email (to, subject, text, html)
 * @returns {Promise} Promessa que resolve quando o email é enviado
 */
const sendEmail = async (options) => {
  if (!transporter) {
    throw new Error('Serviço de email não configurado');
  }

  const mailOptions = {
    from: options.from || config.email.defaultFrom,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email enviado:', info.messageId);
    return info;
  } catch (error) {
    logger.error('Erro ao enviar email:', error);
    throw error;
  }
};

/**
 * Envia um email para redefinição de senha
 * @param {string} email Email do destinatário
 * @param {string} token Token de redefinição de senha
 * @returns {Promise} Resultado do envio do email
 */
const sendPasswordResetEmail = async (email, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${token}`;
  
  const emailOptions = {
    to: email,
    subject: 'Redefinição de Senha - Dashboard de Pedidos',
    text: `
      Você solicitou a redefinição de senha.
      
      Por favor, clique no link abaixo para redefinir sua senha:
      ${resetUrl}
      
      Este link expira em 1 hora.
      
      Se você não solicitou a redefinição de senha, por favor ignore este email.
    `,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <h2 style="color: #4A5568; text-align: center;">Redefinição de Senha</h2>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Redefinir Minha Senha
          </a>
        </div>
        <p>Se o botão acima não funcionar, você pode copiar e colar o link abaixo no seu navegador:</p>
        <p style="word-break: break-all; background-color: #F7FAFC; padding: 10px; border-radius: 5px;">
          ${resetUrl}
        </p>
        <p><strong>Atenção:</strong> Este link expira em 1 hora.</p>
        <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 20px 0;">
        <p style="color: #718096; font-size: 12px; text-align: center;">
          Se você não solicitou esta redefinição de senha, por favor ignore este email.
        </p>
      </div>
    `
  };

  return await sendEmail(emailOptions);
};

module.exports = {
  configureEmail,
  sendEmail,
  sendPasswordResetEmail
}; 