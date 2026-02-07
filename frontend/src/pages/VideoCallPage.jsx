import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Avatar3D } from '../components/Avatar3D';
import { DraggableUserVideo } from '../components/DraggableUserVideo';
import { ShareModal } from '../components/ShareModal';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { SidePanel } from '../components/SidePanel';
import { CallControls } from '../components/CallControls';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { sendChatMessage, getSessionMessages } from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';

const socket = io('http://localhost:8000', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const cleanTextForSpeech = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[👋👍❤️🎉😂🔥💪✨🌟💯🎯🎊🎈🎨📝💬👥😊😄]/g, '')
    .replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '')
    .replace(/#+\s/g, '').replace(/^\s*[-•]\s/gm, '').replace(/^\s*\d+\.\s/gm, '')
    .replace(/\s+/g, ' ').trim();
};

export const VideoCallPage = ({ companion, onEndCall }) => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('User');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('chat');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  const [customAnimation, setCustomAnimation] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [tutorId, setTutorId] = useState('omkar_ai');
  const [subject, setSubject] = useState('AI & ML');

  const peerConnections = useRef({});
  const hasJoinedRoom = useRef(false);
  const userVideoRef = useRef(null);
  const synth = useRef(null);
  const mediaStreamRef = useRef(null);
  const timerRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const isCurrentlySpeakingRef = useRef(false);
  const introPlayedRef = useRef(false);

  // DEBUG: Monitor side panel state changes
  useEffect(() => {
    console.log('🔴 Side Panel State Changed:', {
      activePanel,
      timestamp: new Date().toISOString()
    });
  }, [activePanel]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Cleanup on page refresh/close
    };

    const handlePopState = (e) => {
      e.preventDefault();
      handleEndCall();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleEndCall = useCallback(() => {
    // Clear session storage on end call
    sessionStorage.removeItem(`session_${roomId}_tutorId`);
    sessionStorage.removeItem(`session_${roomId}_subject`);
    
    if (onEndCall) {
      onEndCall();
    }
    navigate('/dashboard', { replace: true });
  }, [navigate, onEndCall, roomId]);

  useEffect(() => {
    const initializeSession = async () => {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const email = userData.email || `user_${Date.now()}`;
        const name = userData.name || userData.username || userData.email?.split('@')[0] || 'User';
        
        setUserId(email);
        setUserName(name);
        
        console.log('👤 User loaded:', name);
      } else {
        const guestName = `Guest_${Math.random().toString(36).substring(2, 7)}`;
        setUserId(`guest_${Date.now()}`);
        setUserName(guestName);
      }

      // FIXED: Check sessionStorage first (survives refresh), then location.state
      let routeTutorId = sessionStorage.getItem(`session_${roomId}_tutorId`);
      let routeSubject = sessionStorage.getItem(`session_${roomId}_subject`);

      // If not in sessionStorage, get from location.state
      if (!routeTutorId) {
        routeTutorId = location.state?.tutorId || companion?.id || 'omkar_ai';
        routeSubject = location.state?.subject || companion?.subject || 'AI & ML';

        // Store in sessionStorage for future refreshes
        sessionStorage.setItem(`session_${roomId}_tutorId`, routeTutorId);
        sessionStorage.setItem(`session_${roomId}_subject`, routeSubject);
      }

      console.log('📋 TutorId:', routeTutorId);

      setTutorId(routeTutorId);
      setSubject(routeSubject);

      // FIXED: Always try to load previous messages on mount
      try {
        console.log('🔄 Attempting to load previous messages for room:', roomId);
        const oldMessages = await getSessionMessages(roomId);
        
        if (oldMessages && oldMessages.length > 0) {
          console.log('✅ Loaded', oldMessages.length, 'previous messages');
          const formattedMessages = oldMessages.map(msg => ({
            id: Date.now() + Math.random(),
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'ai',
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(formattedMessages);
          setHasPlayedIntro(true);
          introPlayedRef.current = true;
        } else {
          console.log('ℹ️ No previous messages found - starting fresh session');
        }
      } catch (error) {
        console.error('❌ Error loading messages:', error);
        // Continue with empty messages - not a critical error
      }
    };

    initializeSession();
  }, [roomId, location.state, companion]);

  const getCompanionId = useCallback(() => {
    return tutorId || companion?.id || 'omkar_ai';
  }, [companion, tutorId]);

  const handlePlayAnimation = useCallback((animationId) => {
    setCustomAnimation(animationId);
    setTimeout(() => setCustomAnimation(null), 30000);
  }, []);

  const handleStopAI = useCallback(() => {
    isCurrentlySpeakingRef.current = false;
    window.speechSynthesis.cancel();
    if (currentUtteranceRef.current) currentUtteranceRef.current = null;
    setIsAISpeaking(false);
    setCurrentSpeakingText('');
  }, []);

  const speakWithCorrectVoice = useCallback((text, companionId) => {
    return new Promise((resolve, reject) => {
      const cleanedText = cleanTextForSpeech(text);
      if (!cleanedText) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      
      const allVoices = window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const isFemale = (companionId === 'priya_biology');
      
      let selectedVoice = null;
      
      if (isFemale) {
        const popularFemale = [
          'Google UK English Female',
          'Karen',
          'Victoria',
          'Moira',
          'Microsoft Zira Desktop'
        ];
        
        for (const voiceName of popularFemale) {
          selectedVoice = allVoices.find(v => v.name.includes(voiceName) || v.name === voiceName);
          if (selectedVoice) {
            console.log(`✅ Priya: ${selectedVoice.name}`);
            break;
          }
        }
      } else {
        const popularMale = [
          'Google UK English Male',
          'Daniel',
          'Fred',
          'Microsoft David Desktop'
        ];
        
        for (const voiceName of popularMale) {
          selectedVoice = allVoices.find(v => v.name.includes(voiceName) || v.name === voiceName);
          if (selectedVoice) {
            console.log(`✅ Omkar: ${selectedVoice.name}`);
            break;
          }
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }
      
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        isCurrentlySpeakingRef.current = true;
        setIsAISpeaking(true);
        setCurrentSpeakingText(cleanedText);
      };

      utterance.onend = () => {
        isCurrentlySpeakingRef.current = false;
        setIsAISpeaking(false);
        setCurrentSpeakingText('');
        currentUtteranceRef.current = null;
        resolve();
      };

      utterance.onerror = (err) => {
        console.error('❌ TTS error:', err);
        isCurrentlySpeakingRef.current = false;
        setIsAISpeaking(false);
        setCurrentSpeakingText('');
        currentUtteranceRef.current = null;
        reject(err);
      };

      currentUtteranceRef.current = utterance;
      
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 150);
    });
  }, []);

  const playAudio = useCallback(async (audioUrl, fullText, explicitCompanionId = null) => {
    try {
      if (isCurrentlySpeakingRef.current) {
        handleStopAI();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const companionId = explicitCompanionId || getCompanionId();
      
      console.log(`🎭 CALLING TTS for: ${companionId}`);
      
      isCurrentlySpeakingRef.current = true;
      await speakWithCorrectVoice(fullText, companionId);
    } catch (error) {
      console.error('❌ TTS error:', error);
      isCurrentlySpeakingRef.current = false;
      setIsAISpeaking(false);
      setCurrentSpeakingText('');
    }
  }, [getCompanionId, handleStopAI, speakWithCorrectVoice]);

  const getMedia = useCallback(async (opts = { video: true, audio: true }) => {
    setIsCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(opts);
      setMediaStream(stream);
      mediaStreamRef.current = stream;

      if (userVideoRef.current && !isVideoOff) {
        userVideoRef.current.srcObject = stream;
        userVideoRef.current.play().catch(() => {});
      }

      return stream;
    } catch (err) {
      console.error('❌ Camera error:', err);
      if (err.name === 'NotAllowedError') {
        toast.error('Please allow camera/microphone access');
      }
      return null;
    } finally {
      setIsCameraLoading(false);
    }
  }, [isVideoOff]);

  const createPeerConnection = useCallback((targetUserId, stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }
      ]
    });

    peerConnections.current[targetUserId] = pc;

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({ ...prev, [targetUserId]: event.streams[0] }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomId, candidate: event.candidate, targetUserId, fromUserId: userId });
      }
    };

    return pc;
  }, [roomId, userId]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('🎤 Voices loaded:', voices.length);
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    const timers = [100, 500, 1000, 2000].map(delay => 
      setTimeout(loadVoices, delay)
    );
    
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initWebRTC = async () => {
      const stream = await getMedia({ video: true, audio: true });
      if (!stream || !mounted) return;

      await new Promise(resolve => setTimeout(resolve, 200));

      if (!hasJoinedRoom.current) {
        hasJoinedRoom.current = true;
        socket.emit('join-room', { roomId, userId, userName, companionId: companion?.id });
      }

      socket.on('user-joined', (data) => {
        const displayName = data.userName || data.userId.substring(0, 15);
        toast.success(`${displayName} joined`, { duration: 2000 });
        setParticipants((prev) => {
          if (prev.some(p => p.userId === data.userId)) return prev;
          return [...prev, { userId: data.userId, userName: data.userName || data.userId, joinedAt: Date.now() }];
        });

        const pc = createPeerConnection(data.userId, stream);
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socket.emit('offer', { roomId, offer: pc.localDescription, targetUserId: data.userId, fromUserId: userId });
          });
      });

      socket.on('existing-users', (users) => {
        setParticipants(users.map(u => ({ userId: u.userId || u, userName: u.userName || u.userId || u, joinedAt: Date.now() })));
      });

      socket.on('user-left', (data) => {
        setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
        setRemoteStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[data.userId];
          return newStreams;
        });
        if (peerConnections.current[data.userId]) {
          peerConnections.current[data.userId].close();
          delete peerConnections.current[data.userId];
        }
      });

      socket.on('offer', async (data) => {
        const { offer, fromUserId } = data;
        const pc = createPeerConnection(fromUserId, stream);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { roomId, answer, targetUserId: fromUserId, fromUserId: userId });
      });

      socket.on('answer', async (data) => {
        const { answer, fromUserId } = data;
        const pc = peerConnections.current[fromUserId];
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on('ice-candidate', async (data) => {
        const { candidate, fromUserId } = data;
        const pc = peerConnections.current[fromUserId];
        if (pc && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('ICE error:', err);
          }
        }
      });

      socket.on('chat-message', (data) => {
        const newMessage = { sender: data.sender, text: data.message, timestamp: data.timestamp, userId: data.userId };
        setMessages((prev) => {
          if (prev.some(m => m.timestamp === data.timestamp && m.userId === data.userId)) return prev;
          return [...prev, newMessage];
        });
      });
    };

    initWebRTC();

    if (window.Tone) {
      try { synth.current = new window.Tone.PolySynth().toDestination(); } catch (e) {}
    }

    timerRef.current = setInterval(() => setCallTime((t) => t + 1), 1000);

    return () => {
      mounted = false;
      hasJoinedRoom.current = false;
      clearInterval(timerRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      window.speechSynthesis.cancel();
      Object.values(peerConnections.current).forEach((pc) => { try { pc.close(); } catch (e) {} });
      socket.emit('leave-room', { roomId, userId });
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('existing-users');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('chat-message');
    };
  }, [roomId, userId, userName, companion?.id, getMedia, createPeerConnection]);

  useEffect(() => {
    mediaStreamRef.current = mediaStream;
    if (userVideoRef.current && mediaStream) {
      userVideoRef.current.srcObject = mediaStream;
      userVideoRef.current.play().catch(() => {});
    }
  }, [mediaStream]);

  useEffect(() => {
    if (!mediaStream) return;
    mediaStream.getAudioTracks().forEach((track) => { track.enabled = !isMuted; });
    mediaStream.getVideoTracks().forEach((track) => { track.enabled = !isVideoOff; });
  }, [isMuted, isVideoOff, mediaStream]);

  const sendReaction = (emoji) => {
    if (synth.current) {
      const notes = { '👍': 'C4', '❤️': 'E4', '🎉': 'G4', '😂': 'A4' };
      try { synth.current.triggerAttackRelease(notes[emoji] || 'C5', '8n'); } catch (e) {}
    }
    const newReaction = { id: Date.now(), emoji, left: Math.random() * 80 + 10 };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== newReaction.id)), 4000);
  };

  const handleIntroComplete = useCallback(async (introData) => {
    if (introPlayedRef.current || hasPlayedIntro || messages.length > 0) {
      return;
    }

    if (!introData || !introData.message) {
      return;
    }

    console.log(`✅ INTRO for ${introData.companionId}`);
    
    introPlayedRef.current = true;
    setHasPlayedIntro(true);

    const introMsg = {
      sender: 'ai',
      text: introData.message,
      timestamp: new Date().toISOString(),
      source: 'intro',
      id: Date.now()
    };

    setMessages([introMsg]);
    await playAudio(null, introData.message, introData.companionId);
  }, [hasPlayedIntro, playAudio, messages.length]);

  const handleVoiceResult = useCallback(async (transcript) => {
    if (!transcript?.trim()) return;

    const userMessage = { sender: 'user', text: transcript, timestamp: new Date().toISOString(), userId: userId };
    setMessages((prev) => [...prev, userMessage]);

    socket.emit('chat-message', { roomId, userId, message: transcript, sender: 'user', timestamp: userMessage.timestamp });

    try {
      const chatHistory = messages.slice(-10).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
      const response = await sendChatMessage(transcript, getCompanionId(), roomId, subject, 0, chatHistory);

      const aiTimestamp = new Date().toISOString();
      const aiMessage = {
        sender: 'ai',
        text: response.text || response.message || 'I received your message.',
        timestamp: aiTimestamp,
        source: response.source || 'gemini',
        userId: getCompanionId(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      socket.emit('chat-message', { roomId, userId: getCompanionId(), message: aiMessage.text, sender: 'ai', timestamp: aiTimestamp });
      await playAudio(response.audioUrl, aiMessage.text);
    } catch (error) {
      console.error('Error in voice chat:', error);
    }
  }, [roomId, playAudio, userId, messages, getCompanionId, subject]);

  const { isListening, startListening, stopListening } = useVoiceInput({
    onResult: handleVoiceResult,
    language: 'en-US',
  });

  const handleSendMessage = async (text) => {
    if (!text?.trim()) return;

    const timestamp = new Date().toISOString();
    const userMessage = { sender: 'user', text, timestamp, userId: userId };
    setMessages((prev) => [...prev, userMessage]);

    socket.emit('chat-message', { roomId, userId, message: text, sender: 'user', timestamp });

    try {
      const chatHistory = messages.slice(-10).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
      const response = await sendChatMessage(text, getCompanionId(), roomId, subject, 0, chatHistory);

      const aiTimestamp = new Date().toISOString();
      const aiMessage = {
        sender: 'ai',
        text: response.text || response.message || 'I received your message.',
        timestamp: aiTimestamp,
        source: response.source || 'gemini',
        userId: getCompanionId(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      socket.emit('chat-message', { roomId, userId: getCompanionId(), message: aiMessage.text, sender: 'ai', timestamp: aiTimestamp });
      await playAudio(response.audioUrl, aiMessage.text);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          }
        }}
      />
      
      <div 
        className="relative w-full h-screen overflow-hidden flex"
        style={{
          background: 'radial-gradient(1200px circle at top left, #1a1f3c 0%, #0b0f1a 40%, #05070f 100%)'
        }}
      >
        {isAISpeaking && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
              animation: 'pulse-glow 2s ease-in-out infinite'
            }}
          />
        )}

        <div className="flex-1 relative flex items-center justify-center transition-all duration-300">
          <Avatar3D
            key={tutorId}
            avatarMode={customAnimation || (isAISpeaking ? 'talk' : 'idle')}
            companionId={tutorId}
            isAISpeaking={isAISpeaking}
            currentText={currentSpeakingText}
            onIntroComplete={handleIntroComplete}
            skipIntro={hasPlayedIntro || messages.length > 0}
          />

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 pointer-events-auto">
              <div 
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.12] px-4 py-2.5 rounded-2xl flex items-center gap-3 hover:border-white/20 transition-all duration-300 group"
                style={{
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold text-white">{formatTime(callTime)}</span>
                  <span className="text-xs text-slate-400">Live Session</span>
                </div>
              </div>

              <div 
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.12] px-6 py-3 rounded-2xl hover:border-white/20 transition-all duration-300"
                style={{
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-bold text-white mb-0.5">{tutorId === 'omkar_ai' ? 'Omkar' : 'Priya'}</div>
                    <div className="text-xs text-indigo-400 font-medium">{subject}</div>
                  </div>
                  {isAISpeaking && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-4 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!isMenuOpen)} 
                  className="p-3 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.12] rounded-2xl hover:border-white/20 transition-all duration-300 group"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}
                >
                  <svg className="w-5 h-5 text-white group-hover:text-indigo-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="5" r="1.5"/>
                    <circle cx="10" cy="10" r="1.5"/>
                    <circle cx="10" cy="15" r="1.5"/>
                  </svg>
                </button>

                {isMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-3 w-64 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-2xl py-2 z-50 animate-in"
                    style={{
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                      animation: 'slideDown 0.2s ease-out'
                    }}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">View Options</div>
                    </div>
                    
                    {[
                      { panel: 'chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'Chat' },
                      { panel: 'participants', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Participants' },
                      { panel: 'notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', label: 'Notes' },
                      { panel: 'whiteboard', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', label: 'Whiteboard' }
                    ].map(({ panel, icon, label }) => (
                      <button 
                        key={panel}
                        onClick={(e) => { 
                          e.stopPropagation();
                          console.log('🟢 Menu clicked:', panel);
                          setActivePanel(panel); 
                          setMenuOpen(false);
                        }} 
                        className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 ${
                          activePanel === panel 
                            ? 'bg-indigo-600/50 text-white' 
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                        </svg>
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                    
                    <div className="my-2 border-t border-white/10"></div>
                    
                    <div className="px-4 py-2">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Avatar Actions</div>
                    </div>
                    
                    {[
                      { action: 'walk', label: 'Walk' },
                      { action: 'dance', label: 'Dance' },
                      { action: 'wave', label: 'Wave' }
                    ].map(({ action, label }) => (
                      <button 
                        key={action}
                        onClick={() => { handlePlayAnimation(action); setMenuOpen(false); }} 
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 transition-all duration-200"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isAISpeaking && currentSpeakingText && (
              <div 
                className="absolute bottom-28 left-4 max-w-md bg-gradient-to-br from-indigo-500/20 to-purple-500/10 backdrop-blur-xl border border-indigo-500/30 rounded-2xl px-5 py-4 pointer-events-auto animate-in"
                style={{
                  boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  animation: 'slideUp 0.3s ease-out'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-3 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-4 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-indigo-300 font-semibold">AI Speaking</div>
                      <button
                        onClick={handleStopAI}
                        className="px-2 py-0.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-md text-xs text-red-300 font-medium transition-all duration-200 flex items-center gap-1"
                      >
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        Stop
                      </button>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{currentSpeakingText.substring(0, 100)}{currentSpeakingText.length > 100 ? '...' : ''}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DraggableUserVideo 
            videoRef={userVideoRef} 
            userId={userName} 
            isMuted={isMuted} 
            isVideoOff={isVideoOff} 
            isCameraLoading={isCameraLoading} 
          />

          <div className="absolute bottom-28 right-4 flex flex-col gap-3 z-10">
            {Object.entries(remoteStreams).map(([remoteUserId, stream], index) => {
              const participant = participants.find(p => p.userId === remoteUserId);
              return (
                <RemoteUserVideo 
                  key={remoteUserId} 
                  stream={stream} 
                  userId={participant?.userName || remoteUserId} 
                />
              );
            })}
          </div>

          {reactions.map((r) => (
            <div 
              key={r.id} 
              className="absolute bottom-32 text-5xl pointer-events-none z-10" 
              style={{ 
                left: `${r.left}%`,
                animation: 'floatUp 4s ease-out forwards'
              }}
            >
              {r.emoji}
            </div>
          ))}

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <CallControls 
              isMuted={isMuted} 
              setIsMuted={setIsMuted} 
              isVideoOff={isVideoOff} 
              setIsVideoOff={setIsVideoOff} 
              sendReaction={sendReaction} 
              onEndCall={handleEndCall}
            />
          </div>
        </div>

        {/* FIXED: Side panel always visible - NO CROSS BUTTON */}
        <div 
          className="w-[400px] border-l border-white/[0.08] relative transition-all duration-300"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <SidePanel
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            messages={messages}
            onSendMessage={handleSendMessage}
            roomId={roomId}
            companion={{ id: tutorId, name: tutorId === 'omkar_ai' ? 'Omkar' : 'Priya', subject }}
            userId={userId}
            startListening={startListening}
            stopListening={stopListening}
            isListening={isListening}
            participants={[
              { userId: tutorId === 'omkar_ai' ? 'Omkar' : 'Priya', role: 'AI Tutor', isOnline: true },
              { userId: userName, role: 'Host', isOnline: true },
              ...participants.map(p => ({ userId: p.userName || p.userId, role: 'Participant', isOnline: true }))
            ]}
          />
        </div>
      </div>

      {isShareModalOpen && <ShareModal roomId={roomId} onClose={() => setShareModalOpen(false)} />}
      {playingVideoId && <VideoPlayerModal videoId={playingVideoId} onClose={() => setPlayingVideoId(null)} />}

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(1.5);
          }
        }
      `}</style>
    </>
  );
};

const RemoteUserVideo = ({ stream, userId }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch(() => {});
    }
  }, [stream]);

  return (
    <div 
      className="relative w-48 h-32 bg-black/50 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl hover:border-indigo-400 hover:scale-105 transition-all duration-300 group" 
      style={{
        boxShadow: '0 10px 40px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
    >
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <audio ref={audioRef} autoPlay />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <div className="text-xs text-white font-semibold truncate">
            {userId.length > 15 ? userId.substring(0, 15) + '...' : userId}
          </div>
        </div>
      </div>
      
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
