// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const routes = require('./routes');
const logger = require('./utils/logger');
const config = require('./config');
const morgan = require('morgan');
const { connectToDatabase } = require('./database');
const { configureEmail } = require('./services/emailService');
const { startAutoFinalizeCheck } = require('./services/orderAutoFinalize');

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

// Configuração do CORS
app.use(cors(config.cors));

// Responder a preflight requests para todas as rotas
app.options('*', cors(config.cors));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos
app.use('/uploads', express.static(uploadsDir));

// Rotas da API
app.use('/api', routes);

// Tratamento de erro global
app.use((err, res) => {
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

// Conecta ao banco de dados e inicia o servidor
connectToDatabase()
  .then(() => {
    app.listen(config.port, () => {
      logger.info(`Servidor rodando na porta ${config.port}`);
      configureEmail();
      // Inicia o serviço de finalização automática de pedidos
      startAutoFinalizeCheck();
      logger.info('Serviço de finalização automática de pedidos iniciado');
    });
  })
  .catch((error) => {
    logger.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  });

// Exporta para testes
module.exports = app;
