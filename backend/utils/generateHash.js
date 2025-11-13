const cryptoService = require('../services/cryptoService');

/**
 * Generate hash for file
 * @param {Buffer} fileBuffer - File buffer
 * @returns {string} - Hexadecimal hash
 */
const generateFileHash = (fileBuffer) => {
  return cryptoService.generateFileHash(fileBuffer);
};

/**
 * Generate hash for string data
 * @param {string} data - String data
 * @returns {string} - Hexadecimal hash
 */
const generateStringHash = (data) => {
  return cryptoService.generateHash(data);
};

module.exports = {
  generateFileHash,
  generateStringHash
};

