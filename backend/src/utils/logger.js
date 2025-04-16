/**
 * Utilitário de logging simples
 * Este módulo pode ser substituído por uma biblioteca de logging mais robusta como Winston
 */

const config = require('../config');

// Cores para o console (ANSI escape sequences)
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Níveis de log
const levels = {
  error: { color: colors.red, priority: 0 },
  warn: { color: colors.yellow, priority: 1 },
  info: { color: colors.green, priority: 2 },
  debug: { color: colors.cyan, priority: 3 }
};

// Define o nível mínimo de log baseado no ambiente
const minLevel = config.isDevelopment ? 'debug' : 'info';

/**
 * Formata a data para o formato ISO sem as frações de segundo
 * @returns {string} Data formatada
 */
const getFormattedDate = () => {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

/**
 * Gera um log com o nível, timestamp e mensagem
 * @param {string} level - Nível do log
 * @param {string} message - Mensagem principal
 * @param {...any} args - Argumentos adicionais
 */
const log = (level, message, ...args) => {
  // Verifica se este nível deve ser logado
  if (levels[level].priority > levels[minLevel].priority) {
    return;
  }

  const timestamp = getFormattedDate();
  const levelUpper = level.toUpperCase().padEnd(5, ' ');
  const prefix = `${timestamp} [${levelUpper}]`;
  
  if (config.isDevelopment) {
    // Em desenvolvimento, usamos cores
    console[level === 'error' ? 'error' : 'log'](
      `${colors.white}${prefix}${levels[level].color} ${message}${colors.reset}`,
      ...args
    );
  } else {
    // Em produção, log sem cores
    console[level === 'error' ? 'error' : 'log'](prefix, message, ...args);
  }
};

// Exporta as funções de log para cada nível
module.exports = {
  error: (message, ...args) => log('error', message, ...args),
  warn: (message, ...args) => log('warn', message, ...args),
  info: (message, ...args) => log('info', message, ...args),
  debug: (message, ...args) => log('debug', message, ...args)
}; 