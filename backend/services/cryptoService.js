const crypto = require('crypto');

class CryptoService {
  /**
   * Generate SHA256 hash
   * @param {Buffer|string} data - Data to hash
   * @returns {string} - Hexadecimal hash
   */
  generateHash(data) {
    if (typeof data === 'string') {
      data = Buffer.from(data);
    }
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate file hash
   * @param {Buffer} fileBuffer - File buffer
   * @returns {string} - Hexadecimal hash
   */
  generateFileHash(fileBuffer) {
    return this.generateHash(fileBuffer);
  }

  /**
   * Verify hash
   * @param {Buffer|string} data - Original data
   * @param {string} hash - Hash to verify against
   * @returns {boolean}
   */
  verifyHash(data, hash) {
    const computedHash = this.generateHash(data);
    return computedHash === hash;
  }

  /**
   * Generate random string
   * @param {number} length - Length of string
   * @returns {string}
   */
  generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Sign data with private key (for future use)
   * @param {string} data - Data to sign
   * @param {string} privateKey - Private key
   * @returns {string} - Signature
   */
  sign(data, privateKey) {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'hex');
  }

  /**
   * Verify signature
   * @param {string} data - Original data
   * @param {string} signature - Signature
   * @param {string} publicKey - Public key
   * @returns {boolean}
   */
  verifySignature(data, signature, publicKey) {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
  }
}

module.exports = new CryptoService();

