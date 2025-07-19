-- Add 'type' column to 'questions' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'type') THEN
        ALTER TABLE questions ADD COLUMN type VARCHAR(50) DEFAULT 'text' NOT NULL;
        -- Update existing questions to 'text' type
        EXECUTE 'UPDATE questions SET type = ''text'' WHERE type IS NULL';
        RAISE NOTICE 'Added type column to questions table and set default to text.';
    ELSE
        RAISE NOTICE 'type column already exists in questions table.';
    END IF;
END
$$;

-- Create 'question_options' table for MCQ questions
CREATE TABLE IF NOT EXISTS question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (question_id, option_text) -- Ensure unique options per question
);

-- Create index for question_id in question_options
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);

-- Add RLS policy for question_options
DO $$
BEGIN
    -- Check if RLS is enabled for questions table, if not, enable it
    IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'question_options') IS NOT TRUE THEN
        ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS for question_options table.';
    ELSE
        RAISE NOTICE 'RLS already enabled for question_options table.';
    END IF;

    -- Check if policy exists before creating
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on question_options') THEN
        CREATE POLICY "Allow all operations on question_options" ON question_options FOR ALL USING (true);
        RAISE NOTICE 'Created "Allow all operations on question_options" policy.';
    ELSE
        RAISE NOTICE 'Policy "Allow all operations on question_options" already exists.';
    END IF;
END
$$;
