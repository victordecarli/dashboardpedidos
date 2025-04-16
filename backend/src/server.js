// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes'); // index.js da pasta routes será automaticamente resolvido
const emailService = require('./services/emailService');
const logger = require('./utils/logger');

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o serviço de email
emailService.initializeTransporter();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes); // Isso vai montar /api/auth, /api/users, etc.

const PORT = process.env.PORT || 3030; // Atualizado para 3030 para coincidir com o front
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info('Conectado ao MongoDB'))
  .catch((err) => logger.error('Erro ao conectar ao MongoDB:', err));

app.listen(PORT, () => logger.info(`Servidor rodando na porta ${PORT}`));

app.get('/', (req, res) => {
  res.send('Servidor rodando! 🚀');
});

// Manipulação global de erros
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});
