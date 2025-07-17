-- Create database schema for BFCB Quiz App

-- Users table to store participant information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    facebook_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table to store quiz questions
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    time_limit INTEGER NOT NULL, -- in seconds
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz sessions table to track when users start/complete quizzes
CREATE TABLE quiz_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_time_spent INTEGER, -- in seconds
    status VARCHAR(20) DEFAULT 'in_progress' -- 'in_progress', 'completed', 'abandoned'
);

-- Responses table to store user answers
CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES quiz_sessions(id),
    question_id INTEGER REFERENCES questions(id),
    answer TEXT NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations table for admin scoring
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    response_id INTEGER REFERENCES responses(id),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    status VARCHAR(20) NOT NULL CHECK (status IN ('correct', 'incorrect', 'partial')),
    admin_notes TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evaluated_by VARCHAR(255) -- admin username
);

-- Admin users table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_responses_session_id ON responses(session_id);
CREATE INDEX idx_responses_question_id ON responses(question_id);
CREATE INDEX idx_evaluations_response_id ON evaluations(response_id);
CREATE INDEX idx_users_facebook_name ON users(facebook_name);

-- Create a view for merit list calculation
CREATE VIEW merit_list AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.facebook_name,
    qs.id as session_id,
    qs.total_time_spent,
    COALESCE(SUM(e.score), 0) as total_score,
    COUNT(e.id) as evaluated_responses,
    COUNT(r.id) as total_responses,
    CASE 
        WHEN COUNT(e.id) = COUNT(r.id) THEN 'completed'
        ELSE 'pending'
    END as evaluation_status
FROM users u
JOIN quiz_sessions qs ON u.id = qs.user_id
JOIN responses r ON qs.id = r.session_id
LEFT JOIN evaluations e ON r.id = e.response_id
WHERE qs.status = 'completed'
GROUP BY u.id, u.full_name, u.facebook_name, qs.id, qs.total_time_spent
ORDER BY total_score DESC, qs.total_time_spent ASC;
