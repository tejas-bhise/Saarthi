import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { WEBSOCKET_URL } from '../config';
import { getWebRTCConfig } from '../utils/api';

/**
 * Custom hook for WebRTC multi-user support
 * Handles peer-to-peer connections for video calls
 */
export const useWebRTC = (roomId, userId, localStream) => {
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const iceServersRef = useRef(null);

  useEffect(() => {
    if (!roomId || !userId) {
      console.warn('⚠️ useWebRTC: Missing roomId or userId');
      return;
    }

    console.log('🔌 Initializing WebRTC for room:', roomId);

    // Initialize Socket.IO connection
    const socket = io(WEBSOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Socket connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      
      // Join room
      socket.emit('join_room', {
        roomId,
        userId,
        role: 'user'
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    // Load WebRTC configuration
    getWebRTCConfig().then(config => {
      iceServersRef.current = config;
      console.log('✅ ICE servers loaded:', config.iceServers);
    }).catch(err => {
      console.error('❌ Failed to load ICE servers:', err);
      // Use default STUN server
      iceServersRef.current = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      };
    });

    // User joined event
    socket.on('user_joined', ({ userId: newUserId }) => {
      console.log('👤 User joined:', newUserId);
      
      if (newUserId !== userId) {
        createPeerConnection(newUserId, true);
      }
    });

    // WebRTC signaling events
    socket.on('webrtc_offer', async ({ from, sdp }) => {
      console.log('📨 Received offer from:', from);
      await handleOffer(from, sdp);
    });

    socket.on('webrtc_answer', async ({ from, sdp }) => {
      console.log('📨 Received answer from:', from);
      await handleAnswer(from, sdp);
    });

    socket.on('ice_candidate', async ({ from, candidate }) => {
      console.log('🧊 Received ICE candidate from:', from);
      await handleIceCandidate(from, candidate);
    });

    socket.on('user_left', ({ userId: leftUserId }) => {
      console.log('👋 User left:', leftUserId);
      removeParticipant(leftUserId);
    });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WebRTC');
      
      // Close all peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => {
        pc.close();
      });
      
      socket.disconnect();
    };
  }, [roomId, userId]);

  // Create peer connection for a remote user
  const createPeerConnection = async (remoteUserId, isInitiator) => {
    if (peerConnectionsRef.current[remoteUserId]) {
      console.warn('⚠️ Peer connection already exists for:', remoteUserId);
      return;
    }

    if (!iceServersRef.current) {
      console.warn('⚠️ ICE servers not loaded yet, waiting...');
      setTimeout(() => createPeerConnection(remoteUserId, isInitiator), 100);
      return;
    }

    console.log('🔗 Creating peer connection with:', remoteUserId);

    const pc = new RTCPeerConnection(iceServersRef.current);
    peerConnectionsRef.current[remoteUserId] = pc;

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
        console.log('➕ Added local track:', track.kind);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log('📹 Received remote track from:', remoteUserId);
      const remoteStream = event.streams[0];
      
      setParticipants(prev => {
        const exists = prev.find(p => p.userId === remoteUserId);
        if (exists) {
          return prev.map(p =>
            p.userId === remoteUserId
              ? { ...p, stream: remoteStream }
              : p
          );
        } else {
          return [...prev, {
            userId: remoteUserId,
            stream: remoteStream,
            name: remoteUserId.substring(5, 8),
            isMuted: false,
            isVideoOff: false,
            isSpeaking: false
          }];
        }
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice_candidate', {
          roomId,
          from: userId,
          to: remoteUserId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection with ${remoteUserId}:`, pc.connectionState);
      
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        removeParticipant(remoteUserId);
      }
    };

    // If initiator, create and send offer
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socketRef.current?.emit('webrtc_offer', {
          roomId,
          from: userId,
          to: remoteUserId,
          sdp: offer
        });
        
        console.log('📤 Sent offer to:', remoteUserId);
      } catch (error) {
        console.error('❌ Error creating offer:', error);
      }
    }
  };

  // Handle incoming offer
  const handleOffer = async (from, sdp) => {
    try {
      await createPeerConnection(from, false);
      const pc = peerConnectionsRef.current[from];
      
      if (!pc) {
        console.error('❌ Peer connection not found for:', from);
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socketRef.current?.emit('webrtc_answer', {
        roomId,
        from: userId,
        to: from,
        sdp: answer
      });
      
      console.log('📤 Sent answer to:', from);
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  };

  // Handle incoming answer
  const handleAnswer = async (from, sdp) => {
    try {
      const pc = peerConnectionsRef.current[from];
      
      if (!pc) {
        console.error('❌ Peer connection not found for:', from);
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log('✅ Set remote description from:', from);
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (from, candidate) => {
    try {
      const pc = peerConnectionsRef.current[from];
      
      if (!pc) {
        console.warn('⚠️ Peer connection not found for:', from);
        return;
      }

      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  };

  // Remove participant
  const removeParticipant = (remoteUserId) => {
    const pc = peerConnectionsRef.current[remoteUserId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[remoteUserId];
    }

    setParticipants(prev => prev.filter(p => p.userId !== remoteUserId));
    console.log('🗑️ Removed participant:', remoteUserId);
  };

  return {
    participants,
    isConnected,
    socket: socketRef.current
  };
};
