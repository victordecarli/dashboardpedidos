// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const emailService = require('./services/emailService');
const logger = require('./utils/logger');
const config = require('./config');

// Inicializa o serviço de email
emailService.initializeTransporter();

// Inicializa o app Express
const app = express();

// Diretório de uploads
if (!fs.existsSync(config.upload.directory)) {
  fs.mkdirSync(config.upload.directory, { recursive: true });
  logger.info('Diretório de uploads criado em:', config.upload.directory);
}

// Log de todas as requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Configuração do CORS
app.use(cors(config.cors));
logger.info(`CORS configurado para: ${JSON.stringify(config.cors.origin)}`);

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(config.upload.directory));

// Rotas da API
app.use('/api', routes);

// Rota básica
app.get('/', (req, res) => {
  res.send(`API do Dashboard de Pedidos rodando! 🚀 (${config.env})`);
});

// Verificação de saúde para AWS
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

mongoose
  .connect(config.db.uri, config.db.options)
  .then(() => {
    logger.info('Conectado ao MongoDB');
    app.listen(config.port, () => {
      logger.info(`Servidor rodando na porta ${config.port}`);
    });
  })
  .catch((err) => {
    logger.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// Manipulação global de erros
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);
  
  // Em produção, não enviamos detalhes do erro para o cliente
  if (config.isProduction) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
  
  // Em desenvolvimento, podemos enviar mais detalhes
  return res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message,
    stack: err.stack
  });
});
