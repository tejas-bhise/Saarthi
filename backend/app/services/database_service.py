"""
PostgreSQL database service
Handles all database operations
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from typing import Optional, List, Dict
from datetime import datetime

from app.config import get_settings

settings = get_settings()

# ========================================
# Connection Pool (Reuse connections)
# ========================================

connection_pool: Optional[SimpleConnectionPool] = None


async def init_database():
    """
    Initialize database connection pool on startup
    """
    global connection_pool
    
    try:
        connection_pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=settings.database_url
        )
        
        print("✅ PostgreSQL connection pool created")
        
        # Test connection
        conn = connection_pool.getconn()
        conn.close()
        connection_pool.putconn(conn)
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise


async def close_database():
    """
    Close all database connections on shutdown
    """
    global connection_pool
    
    if connection_pool:
        connection_pool.closeall()
        print("✅ Database connections closed")


def get_connection():
    """
    Get a connection from the pool
    """
    if connection_pool is None:
        raise RuntimeError("Database not initialized")
    
    return connection_pool.getconn()


def release_connection(conn):
    """
    Return connection to pool
    """
    if connection_pool:
        connection_pool.putconn(conn)


# ========================================
# User Operations
# ========================================

async def create_user(email: str, password_hash: str, name: str) -> Dict:
    """
    Create a new user
    
    Returns:
        User dict with id, email, name, created_at
    """
    conn = get_connection()
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                INSERT INTO users (email, password_hash, name)
                VALUES (%s, %s, %s)
                RETURNING id, email, name, created_at
                """,
                (email, password_hash, name)
            )
            
            user = cursor.fetchone()
            conn.commit()
            
            return dict(user)
    
    finally:
        release_connection(conn)


async def get_user_by_email(email: str) -> Optional[Dict]:
    """
    Get user by email
    
    Returns:
        User dict or None if not found
    """
    conn = get_connection()
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT id, email, password_hash, name, created_at
                FROM users
                WHERE email = %s
                """,
                (email,)
            )
            
            user = cursor.fetchone()
            
            return dict(user) if user else None
    
    finally:
        release_connection(conn)


async def get_user_by_id(user_id: int) -> Optional[Dict]:
    """
    Get user by ID
    """
    conn = get_connection()
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT id, email, name, created_at
                FROM users
                WHERE id = %s
                """,
                (user_id,)
            )
            
            user = cursor.fetchone()
            
            return dict(user) if user else None
    
    finally:
        release_connection(conn)


# ========================================
# Session Operations
# ========================================

async def get_or_create_session(
    room_id: str,
    user_id: Optional[int],
    tutor_id: str,
    subject: str = "General"
) -> str:
    """
    Get existing session or create new one
    
    Returns:
        session_id (same as room_id)
    """
    conn = get_connection()
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Check if session exists
            cursor.execute(
                """
                SELECT session_id FROM sessions
                WHERE session_id = %s
                """,
                (room_id,)
            )
            
            existing = cursor.fetchone()
            
            if existing:
                # Update last_active
                cursor.execute(
                    """
                    UPDATE sessions
                    SET last_active = CURRENT_TIMESTAMP
                    WHERE session_id = %s
                    """,
                    (room_id,)
                )
                conn.commit()
                
                return room_id
            
            # Create new session
            cursor.execute(
                """
                INSERT INTO sessions (session_id, user_id, tutor_id, subject)
                VALUES (%s, %s, %s, %s)
                RETURNING session_id
                """,
                (room_id, user_id, tutor_id, subject)
            )
            
            result = cursor.fetchone()
            conn.commit()
            
            return result['session_id']
    
    finally:
        release_connection(conn)


async def get_user_sessions(user_id: int, limit: int = 20) -> List[Dict]:
    """
    Get all sessions for a user
    
    Returns:
        List of session dicts with message counts
    """
    conn = get_connection()
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT 
                    s.id,
                    s.session_id,
                    s.tutor_id,
                    s.subject,
                    s.created_at,
                    s.last_active,
                    COUNT(m.id) as message_count
                FROM sessions s
                LEFT JOIN messages m ON s.session_id = m.session_id
                WHERE s.user_id = %s
                GROUP BY s.id, s.session_id, s.tutor_id, s.subject, s.created_at, s.last_active
                ORDER BY s.last_active DESC
                LIMIT %s
                """,
                (user_id, limit)
            )
            
            sessions = cursor.fetchall()
            
            return [dict(session) for session in sessions]
    
    finally:
        release_connection(conn)


# ========================================
# Message Operations
# ========================================

async def save_message_to_db(
    session_id: str,
    user_id: Optional[int],
    role: str,
    content: str
) -> int:
    """
    Save a message to database
    
    Returns:
        message_id
    """
    conn = get_connection()
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                INSERT INTO messages (session_id, user_id, role, content)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (session_id, user_id, role, content)
            )
            
            result = cursor.fetchone()
            conn.commit()
            
            return result['id']
    
    finally:
        release_connection(conn)


async def get_session_messages(
    session_id: str,
    limit: int = 50
) -> List[Dict]:
    """
    Get all messages for a session
    
    Returns:
        List of message dicts
    """
    conn = get_connection()
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT id, role, content, timestamp
                FROM messages
                WHERE session_id = %s
                ORDER BY timestamp ASC
                LIMIT %s
                """,
                (session_id, limit)
            )
            
            messages = cursor.fetchall()
            
            return [dict(msg) for msg in messages]
    
    finally:
        release_connection(conn)


async def get_user_message_count(user_id: int) -> int:
    """
    Get total message count for a user
    """
    conn = get_connection()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT COUNT(*) FROM messages
                WHERE user_id = %s
                """,
                (user_id,)
            )
            
            count = cursor.fetchone()[0]
            
            return count
    
    finally:
        release_connection(conn)
