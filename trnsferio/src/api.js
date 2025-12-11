// src/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let _token = null;

/**
 * Set the token for future API calls.
 * Pass null to clear token (on signout).
 */
export function setApiToken(token) {
  _token = token || null;
  if (_token) {
    console.log('API: token set (in-memory)');
  } else {
    console.log('API: token cleared');
  }
}

/**
 * Internal helper to build headers including Authorization when token exists.
 */
function getHeaders(extra = {}) {
  const base = {
    'Content-Type': 'application/json',
    ...extra
  };

  if (_token) {
    base['Authorization'] = `Bearer ${_token}`;
  }

  return base;
}

/**
 * Helper wrapper around fetch that uses Authorization header when token is set.
 * It throws on non-2xx and returns parsed JSON.
 */
async function fetchWithAuth(url, opts = {}) {
  const mergedOpts = {
    ...opts,
    headers: getHeaders(opts.headers || {})
  };

  const res = await fetch(url, mergedOpts);

  // Try to parse JSON (safe)
  let body = null;
  const text = await res.text().catch(() => null);
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    // Non-JSON response
    body = text;
  }

  if (!res.ok) {
    const errMsg = (body && body.error) || (body && body.message) || `HTTP ${res.status}`;
    const err = new Error(errMsg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

export const api = {
  // Health check
  healthCheck: async () => {
    return await fetchWithAuth(`${API_BASE}/api/health`, { method: 'GET' });
  },

  // Login (does not use fetchWithAuth because no token yet)
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(credentials)
    });

    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }

    if (!res.ok) {
      const errMsg = (body && body.error) || (body && body.message) || `HTTP ${res.status}`;
      const err = new Error(errMsg);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return body; // expected { success, token, user, ... }
  },

  // Check discount (protected? your endpoint is public — still we attach token if present)
  checkDiscount: async (discountData) => {
    return await fetchWithAuth(`${API_BASE}/api/check-discount`, {
      method: 'POST',
      body: JSON.stringify(discountData)
    });
  },

  // Get unique brands
  getBrands: async () => {
    return await fetchWithAuth(`${API_BASE}/api/brands`, { method: 'GET' });
  },

  // Get assets for a specific brand
  getAssets: async (brand) => {
    return await fetchWithAuth(`${API_BASE}/api/assets/${encodeURIComponent(brand)}`, { method: 'GET' });
  },

  // Get models for a specific brand and asset
  getModels: async (brand, asset) => {
    return await fetchWithAuth(`${API_BASE}/api/models/${encodeURIComponent(brand)}/${encodeURIComponent(asset)}`, { method: 'GET' });
  },

  // Submit form (if you have a /api/submit)
  submitForm: async (formData) => {
    return await fetchWithAuth(`${API_BASE}/api/submit`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  // Validate token (calls backend /api/auth/validate)
  validateToken: async () => {
    return await fetchWithAuth(`${API_BASE}/api/auth/validate`, { method: 'GET' });
  }
};

console.log("API_BASE =", API_BASE);
export { API_BASE };
