-- Add 'created_at' column to 'quiz_sessions' table if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_sessions' AND column_name = 'created_at') THEN
        ALTER TABLE quiz_sessions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to quiz_sessions table.';
    ELSE
        RAISE NOTICE 'created_at column already exists in quiz_sessions table.';
    END IF;
END
$$;

-- Add 'unique_session_question' constraint to 'responses' table if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_session_question' AND conrelid = 'responses'::regclass) THEN
        ALTER TABLE responses ADD CONSTRAINT unique_session_question UNIQUE (session_id, question_id);
        RAISE NOTICE 'Added unique_session_question constraint to responses table.';
    ELSE
        RAISE NOTICE 'unique_session_question constraint already exists in responses table.';
    END IF;
END
$$;
