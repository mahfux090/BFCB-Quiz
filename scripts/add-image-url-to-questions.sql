-- Add image_url column to questions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'image_url') THEN
        ALTER TABLE questions ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column to questions table.';
    ELSE
        RAISE NOTICE 'image_url column already exists in questions table.';
    END IF;
END
$$;
