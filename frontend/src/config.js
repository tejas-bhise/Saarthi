alert("CONFIG FILE LOADED");
console.log("CONFIG FILE LOADED");

// =========================
// Environment validation
// =========================

console.log("REACT_APP_API_URL =", process.env.REACT_APP_API_URL);
console.log("REACT_APP_WEBSOCKET_URL =", process.env.REACT_APP_WEBSOCKET_URL);

if (!process.env.REACT_APP_API_URL) {
  throw new Error("❌ REACT_APP_API_URL is not defined");
}

if (!process.env.REACT_APP_WEBSOCKET_URL) {
  throw new Error("❌ REACT_APP_WEBSOCKET_URL is not defined");
}

// =========================
// Core URLs
// =========================

const API_URL = process.env.REACT_APP_API_URL;
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL;

// =========================
// API Endpoints
// =========================

export const API_ENDPOINTS = {
  signup: `${API_URL}/api/auth/signup`,
  login: `${API_URL}/api/auth/login`,
  profile: `${API_URL}/api/auth/me`,
  sessions: `${API_URL}/api/sessions`,
  companions: `${API_URL}/api/companions`,
  rooms: `${API_URL}/api/rooms`,
  chat: `${API_URL}/api/chat/message`,
  webrtcConfig: `${API_URL}/api/webrtc/config`,
  health: `${API_URL}/health`,
};

// =========================
// App config
// =========================

export const APP_CONFIG = {
  maxParticipants: 9,
  callTimeInterval: 1000,
  voiceLanguage: 'en-US',
  defaultSubject: 'Physics',
};

// =========================
// Exports
// =========================

export { API_URL, WEBSOCKET_URL };
export const BACKEND_URL = API_URL;
