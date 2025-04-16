// src/config.js
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Carrega o arquivo .env
dotenv.config();

// Ambiente de execução
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Verifica se existem certificados SSL
let sslOptions = null;
try {
  if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
    sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };
    // Adiciona CA certificate se estiver configurado
    if (process.env.SSL_CA_PATH) {
      sslOptions.ca = fs.readFileSync(process.env.SSL_CA_PATH);
    }
  }
} catch (error) {
  console.error('Erro ao carregar certificados SSL:', error.message);
  sslOptions = null;
}

// Configuração do servidor
const config = {
  // Ambiente
  env: NODE_ENV,
  isProduction,
  isDevelopment: NODE_ENV === 'development',
  
  // Servidor
  port: parseInt(process.env.PORT || '3031', 10),
  ssl: sslOptions,
  
  // Banco de dados
  db: {
    uri: process.env.MONGO_URI,
    options: {
      serverSelectionTimeoutMS: 30000, // Timeout após 30 segundos
      socketTimeoutMS: 45000, // Fecha sockets após 45 segundos de inatividade
    }
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // CORS
  cors: {
    origin: isProduction 
      ? [process.env.FRONTEND_URL || 'https://dashboardpedidos.vercel.app'] 
      : ['http://localhost:3031', 'http://localhost:5173', 'http://localhost:5174'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  },
  
  // Upload
  upload: {
    directory: path.join(__dirname, '../uploads'),
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    defaultFrom: process.env.EMAIL_FROM || 'Dashboard de Pedidos <no-reply@exemplo.com>'
  }
};

// Exporta a configuração
module.exports = config; 