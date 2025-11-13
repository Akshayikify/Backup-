const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

const sanitizeBaseUrl = (url) => {
  if (!url) return DEFAULT_BACKEND_URL;
  try {
    const trimmed = url.trim();
    if (!trimmed) return DEFAULT_BACKEND_URL;
    const normalized = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
    // This will throw if the URL is not valid
    new URL(normalized);
    return normalized;
  } catch (error) {
    console.warn(`[backendApi] Invalid backend URL "${url}". Falling back to ${DEFAULT_BACKEND_URL}.`, error);
    return DEFAULT_BACKEND_URL;
  }
};

const BASE_URL = sanitizeBaseUrl(process.env.REACT_APP_BACKEND_URL);

export const backendApi = {
  /**
   * Upload a document to the backend, which will handle IPFS pinning
   * and blockchain hashing.
   *
   * @param {File} file - The file selected by the user.
   * @param {Object} options - Additional data to send (e.g. wallet address).
   * @returns {Promise<{ filename: string, ipfs_url: string, tx_hash: string }>}
   */
  async uploadDocument(file, options = {}) {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    const formData = new FormData();
    formData.append('file', file);

    if (options.walletAddress) {
      formData.append('wallet_address', options.walletAddress);
    }

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let detail = 'Unexpected error while uploading document.';
      try {
        const data = await response.json();
        detail = data.detail || JSON.stringify(data);
      } catch (error) {
        // unable to parse JSON, fall back to status text
        detail = response.statusText || detail;
      }
      throw new Error(detail);
    }

    return response.json();
  },

  async healthcheck() {
    try {
      const response = await fetch(`${BASE_URL}/`);
      if (!response.ok) return { ok: false, status: response.status };
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  getBaseUrl() {
    return BASE_URL;
  },
};

export default backendApi;

