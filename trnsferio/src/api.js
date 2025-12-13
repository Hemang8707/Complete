// src/api.js - COMPLETE UPDATED VERSION
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

/**
 * OTP Functions
 */

/**
 * Send OTP to mobile number
 * @param {Object} data - { mobileNo: string }
 * @returns {Promise<Object>} - Response from server
 */
export async function sendOTP(data) {
  try {
    const response = await fetch(`${API_BASE}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      const error = new Error(result.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.body = result;
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error('Send OTP error:', error);
    
    // Enhanced error messages
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    
    if (error.status === 400) {
      throw new Error('Invalid mobile number format. Please check and try again.');
    }
    
    if (error.status === 500) {
      throw new Error('Server error. Please try again in a moment.');
    }
    
    throw error;
  }
}

/**
 * Verify OTP
 * @param {Object} data - { mobileNo: string, otp: string }
 * @returns {Promise<Object>} - Response from server
 */
export async function verifyOTP(data) {
  try {
    const response = await fetch(`${API_BASE}/api/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      const error = new Error(result.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.body = result;
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error('Verify OTP error:', error);
    
    // Enhanced error messages
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    
    if (error.status === 400) {
      throw new Error('Invalid OTP or mobile number.');
    }
    
    if (error.status === 401) {
      throw new Error('OTP verification failed. Please try again.');
    }
    
    throw error;
  }
}

/**
 * Check OTP status
 * @param {Object} data - { mobileNo: string }
 * @returns {Promise<Object>} - Response from server
 */
export async function checkOTPStatus(data) {
  try {
    const response = await fetch(`${API_BASE}/api/check-otp-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      const error = new Error(result.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.body = result;
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error('Check OTP status error:', error);
    throw error;
  }
}

export const api = {
  // OTP Functions
  sendOTP,
  verifyOTP,
  checkOTPStatus,

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