-- Delete duplicate responses, keeping only the latest one for each session_id and question_id
WITH ranked_responses AS (
    SELECT
        id,
        session_id,
        question_id,
        ROW_NUMBER() OVER (PARTITION BY session_id, question_id ORDER BY submitted_at DESC, id DESC) as rn
    FROM
        responses
)
DELETE FROM responses
WHERE id IN (
    SELECT id FROM ranked_responses WHERE rn > 1
);
