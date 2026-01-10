/**
 * Simple logger utility
 */

const levels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };

  const color = {
    ERROR: '\x1b[31m',
    WARN: '\x1b[33m',
    INFO: '\x1b[36m',
    DEBUG: '\x1b[90m'
  };

  console.log(
    `${color[level]}[${timestamp}] ${level}\x1b[0m: ${message}`,
    Object.keys(meta).length > 0 ? meta : ''
  );
};

const logger = {
  error: (message, meta) => log(levels.ERROR, message, meta),
  warn: (message, meta) => log(levels.WARN, message, meta),
  info: (message, meta) => log(levels.INFO, message, meta),
  debug: (message, meta) => log(levels.DEBUG, message, meta),
};

export default logger;
