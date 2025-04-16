// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const logger = require('./utils/logger');
const config = require('./config');
const morgan = require('morgan');
const http = require('http');
const https = require('https');
const { connectToDatabase } = require('./database');
const { configureEmail } = require('./services/emailService');

// Inicializa o app Express
const app = express();

// Diretório para uploads
const uploadsDir = config.upload.directory;
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    logger.info('Diretório de uploads criado com sucesso');
  } catch (error) {
    logger.error('Erro ao criar diretório de uploads:', error);
  }
}

// Middlewares
app.use(morgan('dev'));
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos
app.use('/uploads', express.static(uploadsDir));

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api', routes);

// Tratamento de erro global
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);
  
  // Retorna um erro mais detalhado em desenvolvimento
  if (config.isDevelopment) {
    return res.status(err.status || 500).json({
      message: err.message,
      stack: err.stack,
    });
  }
  
  // Retorna um erro genérico em produção
  return res.status(err.status || 500).json({
    message: 'Ocorreu um erro no servidor.',
  });
});

// Inicia o servidor HTTP ou HTTPS
let server;
if (config.ssl) {
  server = https.createServer(config.ssl, app);
  logger.info('Servidor HTTPS iniciado');
} else {
  server = http.createServer(app);
  logger.info('Servidor HTTP iniciado (sem SSL)');
}

// Conecta ao banco de dados e inicia o servidor
connectToDatabase()
  .then(() => {
    server.listen(config.port, () => {
      logger.info(`Servidor rodando na porta ${config.port}`);
      logger.info(`API URL: http${config.ssl ? 's' : ''}://localhost:${config.port}/api`);
      configureEmail();
    });
  })
  .catch((error) => {
    logger.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  });

// Exporta para testes
module.exports = app;
