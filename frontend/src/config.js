// DEBUG (safe to keep for now)
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("VITE_WEBSOCKET_URL =", import.meta.env.VITE_WEBSOCKET_URL);

// 🚨 Hard requirement: env vars MUST exist
if (!import.meta.env.VITE_API_URL) {
  throw new Error("❌ VITE_API_URL is not defined");
}

if (!import.meta.env.VITE_WEBSOCKET_URL) {
  throw new Error("❌ VITE_WEBSOCKET_URL is not defined");
}

// Backend API Configuration
const API_URL = import.meta.env.VITE_API_URL;

// WebSocket URL
// ⚠️ Use https/http — socket.io will auto-upgrade to wss
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  signup: `${API_URL}/api/auth/signup`,
  login: `${API_URL}/api/auth/login`,
  profile: `${API_URL}/api/auth/me`,

  // Sessions
  sessions: `${API_URL}/api/sessions`,

  // Companions
  companions: `${API_URL}/api/companions`,

  // Rooms
  rooms: `${API_URL}/api/rooms`,

  // Chat
  chat: `${API_URL}/api/chat/message`,

  // WebRTC
  webrtcConfig: `${API_URL}/api/webrtc/config`,

  // Health
  health: `${API_URL}/health`,
};

// App Configuration
export const APP_CONFIG = {
  maxParticipants: 9,
  callTimeInterval: 1000,
  voiceLanguage: 'en-US',
  defaultSubject: 'Physics',
};

// Export URLs
export { API_URL, WEBSOCKET_URL };

// Backward compatibility
export const BACKEND_URL = API_URL;
