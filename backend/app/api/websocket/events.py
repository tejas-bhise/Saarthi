# app/api/websocket/events.py

"""
WebSocket event name constants for Socket.IO signaling.
"""

# Room management
JOIN_ROOM = "join_room"
LEAVE_ROOM = "leave_room"
USER_JOINED = "user_joined"
USER_LEFT = "user_left"

# WebRTC signaling
WEBRTC_OFFER = "webrtc_offer"
WEBRTC_ANSWER = "webrtc_answer"
ICE_CANDIDATE = "ice_candidate"

# Chat
CHAT_MESSAGE = "chat_message"
NEW_CHAT_MESSAGE = "new_chat_message"

# Whiteboard
WHITEBOARD_UPDATE = "whiteboard_update"

# Reactions
REACTION = "reaction"
NEW_REACTION = "new_reaction"
