-- Insert sample admin user
INSERT INTO admin_users (username, password_hash) VALUES 
('admin', '$2b$10$rQZ9QmZ9QmZ9QmZ9QmZ9Qu'); -- This would be a proper bcrypt hash of 'bfcb2024'

-- Insert sample questions
INSERT INTO questions (question, time_limit) VALUES 
('Who is considered the greatest batsman in cricket history and why? Discuss their impact on the game with specific examples and statistics.', 180),
('Analyze the evolution of T20 cricket and its impact on traditional formats. What are the pros and cons of this shorter format?', 240),
('Describe the role of technology in modern cricket. How has it changed the game for players, officials, and spectators?', 200),
('What makes a good cricket captain? Discuss leadership qualities with examples from Bangladesh cricket history.', 180),
('How can Bangladesh cricket improve its performance in international competitions? Provide detailed suggestions for development.', 300),
('Discuss the importance of domestic cricket in developing international players. How can Bangladesh strengthen its domestic structure?', 220),
('Explain the concept of cricket diplomacy. How has cricket been used to improve international relations?', 200),
('What are the key differences between Test, ODI, and T20 cricket? Which format do you think is most important for cricket''s future?', 180),
('Analyze the role of coaching in modern cricket. How has coaching methodology evolved over the years?', 240),
('Discuss the impact of the Indian Premier League (IPL) on world cricket. What lessons can other countries learn from its success?', 260);

-- Insert sample users (for testing)
INSERT INTO users (full_name, facebook_name) VALUES 
('Ahmed Rahman', 'ahmed.rahman.cricket'),
('Fatima Khan', 'fatima.khan.bd'),
('Mohammad Ali', 'mohammad.ali.sports'),
('Rashida Begum', 'rashida.begum.fan');

-- Insert sample quiz sessions
INSERT INTO quiz_sessions (user_id, started_at, completed_at, total_time_spent, status) VALUES 
(1, '2024-01-16 10:00:00', '2024-01-16 10:45:00', 2700, 'completed'),
(2, '2024-01-16 11:00:00', '2024-01-16 11:40:00', 2400, 'completed'),
(3, '2024-01-16 14:00:00', NULL, NULL, 'in_progress');

-- Insert sample responses
INSERT INTO responses (session_id, question_id, answer, time_spent, submitted_at) VALUES 
(1, 1, 'I believe Sachin Tendulkar is the greatest batsman because of his consistency across all formats and his longevity in international cricket. He scored 100 international centuries and played for 24 years at the highest level. His technique was flawless and he adapted to different conditions worldwide.', 145, '2024-01-16 10:15:00'),
(1, 2, 'T20 cricket has revolutionized the game by making it more accessible to casual fans and creating new revenue streams. However, it has also led to concerns about the decline of Test cricket and the emphasis on power hitting over technique.', 180, '2024-01-16 10:30:00'),
(2, 1, 'Don Bradman had the highest batting average in Test cricket history at 99.94. His statistical dominance makes him the greatest batsman ever. No other player has come close to his consistency and run-scoring ability.', 120, '2024-01-16 11:15:00'),
(2, 2, 'T20 has brought cricket to new audiences and created opportunities for players to earn better. The IPL model has been successful worldwide. However, traditional fans worry about the impact on longer formats and player technique.', 160, '2024-01-16 11:30:00');

-- Insert sample evaluations
INSERT INTO evaluations (response_id, score, status, admin_notes, evaluated_by) VALUES 
(2, 8, 'correct', 'Good analysis of Don Bradman statistics and impact', 'admin'),
(4, 7, 'correct', 'Balanced view of T20 impact with valid points', 'admin');
