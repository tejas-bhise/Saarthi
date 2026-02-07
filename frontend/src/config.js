// Backend API Configuration
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// WebSocket URL
export const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  signup: `${BACKEND_URL}/api/auth/signup`,
  login: `${BACKEND_URL}/api/auth/login`,
  profile: `${BACKEND_URL}/api/auth/me`,
  
  // Session endpoints
  sessions: `${BACKEND_URL}/api/sessions`,
  
  // Tutor endpoints
  companions: `${BACKEND_URL}/api/companions`,
  
  // Room endpoints
  rooms: `${BACKEND_URL}/api/rooms`,
  
  // Chat endpoint
  chat: `${BACKEND_URL}/api/chat/message`,
  
  // WebRTC config
  webrtcConfig: `${BACKEND_URL}/api/webrtc/config`,
  
  // Health check
  health: `${BACKEND_URL}/health`,
};

// App Configuration
export const APP_CONFIG = {
  maxParticipants: 9,
  callTimeInterval: 1000,
  voiceLanguage: 'en-US',
  defaultSubject: 'Physics',
};

// Export BACKEND_URL
export { BACKEND_URL };
