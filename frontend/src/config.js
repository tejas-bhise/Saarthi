// Backend API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// WebSocket URL (use http/https, not ws/wss - socket.io handles protocol)
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  signup: `${API_URL}/api/auth/signup`,
  login: `${API_URL}/api/auth/login`,
  profile: `${API_URL}/api/auth/me`,
  
  // Session endpoints
  sessions: `${API_URL}/api/sessions`,
  
  // Tutor endpoints
  companions: `${API_URL}/api/companions`,
  
  // Room endpoints
  rooms: `${API_URL}/api/rooms`,
  
  // Chat endpoint
  chat: `${API_URL}/api/chat/message`,
  
  // WebRTC config
  webrtcConfig: `${API_URL}/api/webrtc/config`,
  
  // Health check
  health: `${API_URL}/health`,
};

// App Configuration
export const APP_CONFIG = {
  maxParticipants: 9,
  callTimeInterval: 1000,
  voiceLanguage: 'en-US',
  defaultSubject: 'Physics',
};

// Export URLs for direct use
export { API_URL, WEBSOCKET_URL };

// Backward compatibility
export const BACKEND_URL = API_URL;
