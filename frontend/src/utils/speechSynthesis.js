/**
 * Enhanced browser Text-to-Speech with cleanup + chunking
 */

const VOICE_PREFERENCES = {
  omkar_ai: {
    preferred: ['Google UK English Male', 'Microsoft David', 'Alex', 'Daniel'],
    gender: 'male',
    fallbackLang: 'en-GB'
  },
  priya_biology: {
    preferred: ['Google UK English Female', 'Microsoft Zira', 'Samantha', 'Victoria'],
    gender: 'female',
    fallbackLang: 'en-US'
  }
};

let availableVoices = [];
let voicesLoaded = false;
let currentUtterance = null;
let utteranceQueue = [];

// ------------------------------------
// Load voices
// ------------------------------------
const loadVoices = () => {
  return new Promise((resolve) => {
    availableVoices = window.speechSynthesis.getVoices();

    if (availableVoices.length > 0) {
      voicesLoaded = true;
      console.log('🎤 Loaded', availableVoices.length, 'voices');
      resolve(availableVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        availableVoices = window.speechSynthesis.getVoices();
        voicesLoaded = true;
        console.log('🎤 Loaded', availableVoices.length, 'voices');
        resolve(availableVoices);
      };

      setTimeout(() => {
        availableVoices = window.speechSynthesis.getVoices();
        voicesLoaded = true;
        resolve(availableVoices);
      }, 1000);
    }
  });
};

// ------------------------------------
// Pick best voice
// ------------------------------------
const findBestVoice = (companionId) => {
  if (availableVoices.length === 0) return null;

  const prefs = VOICE_PREFERENCES[companionId] || VOICE_PREFERENCES.omkar_ai;

  for (const name of prefs.preferred) {
    const v = availableVoices.find(v => v.name.includes(name));
    if (v) return v;
  }

  return availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
};

// ------------------------------------
// 🔥 CLEAN TEXT FOR SPEECH
// ------------------------------------
const cleanTextForSpeech = (text) => {
  return text
    .replace(/https?:\/\/\S+/gi, '')          // remove URLs
    .replace(/[*_~`>#|]/g, '')                // markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')       // markdown links
    .replace(/!\[.*?\]\(.*?\)/g, '')          // markdown images
    .replace(/:[a-zA-Z_]+:/g, '')              // emoji shortcodes
    .replace(/[\u{1F300}-\u{1F6FF}]/gu, '')    // emojis unicode
    .replace(/[^\w\s.,!?]/g, '')               // strange symbols
    .replace(/\s+/g, ' ')                      // extra spaces
    .trim();
};

// ------------------------------------
// Split into chunks
// ------------------------------------
const splitIntoChunks = (text, maxLength = 200) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let buffer = '';

  for (const s of sentences) {
    if ((buffer + s).length > maxLength && buffer) {
      chunks.push(buffer.trim());
      buffer = s;
    } else {
      buffer += ' ' + s;
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
};

// ------------------------------------
// MAIN SPEAK FUNCTION
// ------------------------------------
export const speakText = async (text, companionId = 'omkar_ai') => {
  if (!window.speechSynthesis) return Promise.resolve();
  if (!text || !text.trim()) return Promise.resolve();

  try {
    window.speechSynthesis.cancel();
    currentUtterance = null;
    utteranceQueue = [];
  } catch {}

  await new Promise(r => setTimeout(r, 150));

  if (!voicesLoaded) await loadVoices();

  const cleaned = cleanTextForSpeech(text);
  const chunks = splitIntoChunks(cleaned, 200);

  return new Promise((resolve) => {
    let index = 0;

    const speakNext = () => {
      if (index >= chunks.length) {
        resolve();
        return;
      }

      const chunk = chunks[index++];
      const utterance = new SpeechSynthesisUtterance(chunk);
      currentUtterance = utterance;

      const voice = findBestVoice(companionId);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      utterance.rate = 0.95;
      utterance.pitch = companionId === 'omkar_ai' ? 0.9 : 1.1;
      utterance.volume = 1;

      utterance.onend = () => setTimeout(speakNext, 80);
      utterance.onerror = () => setTimeout(speakNext, 80);

      window.speechSynthesis.speak(utterance);
    };

    speakNext();

    setTimeout(() => {
      window.speechSynthesis.cancel();
      resolve();
    }, chunks.length * 15000);
  });
};

// ------------------------------------
// STOP SPEECH
// ------------------------------------
export const stopSpeaking = () => {
  try {
    window.speechSynthesis.cancel();
    currentUtterance = null;
    utteranceQueue = [];
    console.log('⏹️ Stopped speech');
  } catch {}
};

export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

// ------------------------------------
if (typeof window !== 'undefined') {
  loadVoices();
  window.addEventListener('beforeunload', stopSpeaking);
}
