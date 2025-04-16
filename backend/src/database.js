// src/database.js
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./utils/logger');

/**
 * Estabelece conexão com o MongoDB
 * @returns {Promise} Promessa que resolve quando a conexão é estabelecida
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(config.db.uri, config.db.options);
    return mongoose.connection;
  } catch (error) {
    logger.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
};

/**
 * Fecha a conexão com o MongoDB
 * @returns {Promise} Promessa que resolve quando a conexão é fechada
 */
const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Desconectado do MongoDB');
  } catch (error) {
    logger.error('Erro ao desconectar do MongoDB:', error);
    throw error;
  }
};

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  getConnection: () => mongoose.connection
};