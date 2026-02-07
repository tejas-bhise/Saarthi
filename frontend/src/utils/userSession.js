// User Session Management
const USER_ID_KEY = 'ai_tutor_user_id';
const USER_NAME_KEY = 'ai_tutor_user_name';

/**
 * Get or create user session
 * Returns { userId, userName }
 */
export const getUserSession = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  let userName = localStorage.getItem(USER_NAME_KEY);
  
  if (!userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    userId = `user_${timestamp}_${random}`;
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('✅ New user ID generated:', userId);
  }
  
  if (!userName) {
    // Generate friendly name from userId
    const parts = userId.split('_');
    userName = `User_${parts[2]?.substring(0, 5) || 'Guest'}`;
    localStorage.setItem(USER_NAME_KEY, userName);
    console.log('✅ New user name generated:', userName);
  }
  
  return { userId, userName };
};

/**
 * Get or create anonymous user ID
 */
export const getUserId = () => {
  const { userId } = getUserSession();
  return userId;
};

/**
 * Get display name for user
 */
export const getUserName = () => {
  const { userName } = getUserSession();
  return userName;
};

/**
 * Set custom user name
 */
export const setUserName = (name) => {
  if (name && name.trim()) {
    localStorage.setItem(USER_NAME_KEY, name.trim());
    console.log('✅ User name updated:', name);
  }
};

/**
 * Clear user session (logout)
 */
export const clearUserId = () => {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  console.log('🗑️ User session cleared');
};

/**
 * Get display name from any userId string
 */
export const getDisplayName = (userId) => {
  if (!userId) return 'Unknown';
  
  // Check if it's current user
  const currentUserId = getUserId();
  if (userId === currentUserId) {
    return getUserName();
  }
  
  // Extract display name from userId
  if (userId.startsWith('user_')) {
    const parts = userId.split('_');
    return `User_${parts[2]?.substring(0, 5) || 'XXX'}`;
  }
  
  if (userId.startsWith('guest_')) {
    return `Guest_${userId.substring(6, 11)}`;
  }
  
  // Return first 10 chars for other formats
  return userId.length > 10 ? userId.substring(0, 10) + '...' : userId;
};
