import { API_ENDPOINTS } from '../config';

// ========================================
// AUTH TOKEN MANAGEMENT
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
  localStorage.setItem('authToken', token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

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
  localStorage.setItem('currentUser', JSON.stringify(user));
};

/**
 * Remove current user from localStorage
 */
export const removeCurrentUser = () => {
  localStorage.removeItem('currentUser');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// ========================================
// AUTH API CALLS
// ========================================

/**
 * User signup
 */
export const signup = async (email, password, name) => {
  try {
    const response = await fetch(API_ENDPOINTS.signup, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    const data = await response.json();
    
    // Save token and user
    setAuthToken(data.access_token);
    setCurrentUser(data.user);
    
    return data;
  } catch (error) {
    console.error('❌ Signup error:', error);
    throw error;
  }
};

/**
 * User login
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(API_ENDPOINTS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    
    // Save token and user
    setAuthToken(data.access_token);
    setCurrentUser(data.user);
    
    return data;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

/**
 * User logout
 */
export const logout = () => {
  removeAuthToken();
  removeCurrentUser();
};

/**
 * Get user profile (requires auth)
 */
export const getUserProfile = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');

    const response = await fetch(API_ENDPOINTS.profile, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch profile');
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    throw error;
  }
};

// ========================================
// CHAT & SESSION API CALLS
// ========================================

/**
 * Fetch list of all tutors
 */
export const fetchTutors = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.companions);
    if (!response.ok) throw new Error('Failed to fetch tutors');
    const data = await response.json();
    return data.tutors || [];
  } catch (error) {
    console.error('❌ Error fetching tutors:', error);
    return getMockTutors();
  }
};

/**
 * Get user's session history (requires auth)
 */
export const getUserSessions = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');

    const response = await fetch(API_ENDPOINTS.sessions, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch sessions');
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching sessions:', error);
    return [];
  }
};

/**
 * Get session messages (requires auth)
 */
export const getSessionMessages = async (sessionId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');

    const response = await fetch(`${API_ENDPOINTS.sessions}/${sessionId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch messages');
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return [];
  }
};

/**
 * Create new room
 */
export const createRoom = async (userId, companionId, subject) => {
  try {
    const response = await fetch(API_ENDPOINTS.rooms, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, companionId, subject }),
    });

    if (!response.ok) throw new Error('Failed to create room');
    const data = await response.json();
    return data.roomId;
  } catch (error) {
    console.error('❌ Error creating room:', error);
    return `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
};

/**
 * Validate room exists
 */
export const validateRoom = async (roomId) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.rooms}/${roomId}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'active';
  } catch (error) {
    console.error('❌ Error validating room:', error);
    return true;
  }
};

/**
 * Send message to AI and get response (with auth)
 */
export const sendChatMessage = async (
  question,
  companionId,
  roomId,
  subject = 'General',
  retryCount = 0
) => {
  try {
    const user = getCurrentUser();
    const token = getAuthToken();

    const payload = {
      message: question,
      companion_id: companionId,
      room_id: roomId,
      subject: subject,
      retry_count: retryCount,
      user_email: user?.email || null,
    };

    console.log('📤 Sending to backend:', payload);

    const headers = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.chat, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend error:', response.status, errorData);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Backend response:', data);

    return {
      text: data.text,
      audioUrl: data.audioUrl || null,
      source: data.source || 'gemini',
    };
  } catch (error) {
    console.error('❌ Error sending chat message:', error);

    return {
      text: "I'm having trouble connecting to the AI service right now. Please try again.",
      audioUrl: null,
      source: 'fallback',
    };
  }
};

/**
 * Get WebRTC configuration
 */
export const getWebRTCConfig = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.webrtcConfig);
    if (!response.ok) throw new Error('Failed to fetch WebRTC config');
    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching WebRTC config:', error);
    return {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };
  }
};

/**
 * Mock tutors data (fallback)
 */
const getMockTutors = () => [
  {
    id: 'omkar_ai',
    name: 'Omkar',
    subject: 'Artificial Intelligence',
    description: 'Friendly AI expert - Explains deep learning, neural networks, and modern AI with real-world examples',
    imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    modelUrl: 'https://models.readyplayer.me/65b90558b2e45921227099f6.glb',
    category: 'Artificial Intelligence',
    traits: ['Friendly', 'Expert', 'Real-world Examples', 'Passionate'],
  },
  {
    id: 'priya_biology',
    name: 'Priya',
    subject: 'Biology',
    description: 'Warm Biology tutor - Makes life sciences relatable through health, nature, and vivid storytelling',
    imageUrl: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
    modelUrl: 'https://models.readyplayer.me/65b90558b2e45921227099f6.glb',
    category: 'Biology',
    traits: ['Warm', 'Enthusiastic', 'Health-focused', 'Visual'],
  },
];
