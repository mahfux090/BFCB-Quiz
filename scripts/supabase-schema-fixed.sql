-- Create tables for BFCB Quiz App (Supabase Compatible)

-- Users table to store participant information
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    facebook_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table to store quiz questions
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    time_limit INTEGER NOT NULL, -- in seconds
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz sessions table to track when users start/complete quizzes
CREATE TABLE quiz_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_time_spent INTEGER, -- in seconds
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Ensure this column exists
);

-- Responses table to store user answers
CREATE TABLE responses (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (session_id, question_id) -- Ensure this unique constraint exists
);

-- Evaluations table for admin scoring
CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    response_id BIGINT REFERENCES responses(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    status VARCHAR(20) NOT NULL CHECK (status IN ('correct', 'incorrect', 'partial')),
    admin_notes TEXT,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evaluated_by VARCHAR(255) -- admin username
);

-- Admin users table
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_responses_session_id ON responses(session_id);
CREATE INDEX idx_responses_question_id ON responses(question_id);
CREATE INDEX idx_evaluations_response_id ON evaluations(response_id);
CREATE INDEX idx_users_facebook_name ON users(facebook_name);

-- Create a function for merit list calculation
CREATE OR REPLACE FUNCTION get_merit_list()
RETURNS TABLE (
    user_id BIGINT,
    full_name VARCHAR(255),
    facebook_name VARCHAR(255),
    session_id BIGINT,
    total_time_spent INTEGER,
    total_score BIGINT,
    evaluated_responses BIGINT,
    total_responses BIGINT,
    evaluation_status TEXT
) AS $$
BEGIN
    RETURN QUERY
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
END;
$$ LANGUAGE plpgsql;
