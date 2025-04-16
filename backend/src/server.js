// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const routes = require('./routes'); // index.js da pasta routes será automaticamente resolvido
const emailService = require('./services/emailService');
const logger = require('./utils/logger');

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o serviço de email
emailService.initializeTransporter();

// Inicializa o app Express
const app = express();

// Diretório de uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('Diretório de uploads criado em:', uploadsDir);
}

// Log de todas as requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Configuração do CORS
app.use(cors());

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(uploadsDir));

// Rotas da API
app.use('/api', routes);

// Rota básica
app.get('/', (req, res) => {
  res.send('Servidor rodando! 🚀');
});

const PORT = process.env.PORT || 3030;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Conectado ao MongoDB');
    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// Manipulação global de erros
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});
