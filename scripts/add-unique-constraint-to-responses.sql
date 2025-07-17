-- Add a unique constraint to the responses table to prevent duplicate answers for the same question in a session
ALTER TABLE responses
ADD CONSTRAINT unique_session_question UNIQUE (session_id, question_id);
