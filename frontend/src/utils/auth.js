/**
 * Authentication utility functions
 * Centralized auth token and user management
 */

// ========================================
// TOKEN MANAGEMENT
// ========================================

/**
 * Get JWT token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Save JWT token to localStorage
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  }
};

/**
 * Remove JWT token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if token exists and is valid
 */
export const isTokenValid = () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    // Decode JWT (split by dots, get payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    const isExpired = payload.exp * 1000 < Date.now();
    
    return !isExpired;
  } catch (error) {
    console.error('❌ Token validation error:', error);
    return false;
  }
};

// ========================================
// USER MANAGEMENT
// ========================================

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Save current user to localStorage
 */
export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
};

/**
 * Remove current user from localStorage
 */
export const removeCurrentUser = () => {
  localStorage.removeItem('currentUser');
};

// ========================================
// AUTH STATE CHECK
// ========================================

/**
 * Check if user is authenticated
 * Returns true if token exists and is valid
 */
export const isAuthenticated = () => {
  return !!getAuthToken() && isTokenValid();
};

/**
 * Get user email from token
 */
export const getUserEmailFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.email || null;
  } catch (error) {
    console.error('❌ Error extracting email from token:', error);
    return null;
  }
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id || payload.id || null;
  } catch (error) {
    console.error('❌ Error extracting user ID from token:', error);
    return null;
  }
};

// ========================================
// LOGOUT
// ========================================

/**
 * Clear all auth data and logout
 */
export const logout = () => {
  removeAuthToken();
  removeCurrentUser();
  
  // Optional: Clear other session data
  localStorage.removeItem('userId');
  
  console.log('✅ User logged out');
};

// ========================================
// AUTH HEADER HELPER
// ========================================

/**
 * Get authorization header object for API calls
 * Returns { 'Authorization': 'Bearer <token>' } or {}
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Get full headers with auth + content-type
 */
export const getApiHeaders = () => {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };
};
