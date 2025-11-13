const cryptoService = require('../services/cryptoService');

/**
 * Verify signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} publicKey - Public key
 * @returns {boolean}
 */
const verifySignature = (data, signature, publicKey) => {
  return cryptoService.verifySignature(data, signature, publicKey);
};

module.exports = {
  verifySignature
};

