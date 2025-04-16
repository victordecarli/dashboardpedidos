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
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
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

module.exports = {
  configureEmail,
  sendEmail
}; 