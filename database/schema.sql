-- ========================================
-- Saarthi AI Database Schema
-- PostgreSQL 14+
-- ========================================

-- Drop tables if they exist (careful in production!)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- Users Table
-- ========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);

-- ========================================
-- Sessions Table
-- ========================================

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tutor_id VARCHAR(50) NOT NULL,
    subject VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_tutor CHECK (tutor_id IN ('omkar_ai', 'priya_biology'))
);

-- Indexes for faster queries
CREATE INDEX idx_sessions_user ON sessions(user_id, last_active DESC);
CREATE INDEX idx_sessions_room ON sessions(session_id);

-- ========================================
-- Messages Table
-- ========================================

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES sessions(session_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster message retrieval
CREATE INDEX idx_messages_session ON messages(session_id, timestamp ASC);
CREATE INDEX idx_messages_user ON messages(user_id, timestamp DESC);

-- ========================================
-- Sample Data (Optional - for testing)
-- ========================================

-- Test user (password: "test123")
-- INSERT INTO users (email, password_hash, name) VALUES
-- ('test@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyC0gNxEJW4G', 'Test User');

-- ========================================
-- Verification Queries
-- ========================================

-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
