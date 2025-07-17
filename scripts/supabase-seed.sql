-- Insert sample admin user (password: bfcb2024)
INSERT INTO admin_users (username, password_hash) VALUES 
('admin', '$2b$10$rQZ9QmZ9QmZ9QmZ9QmZ9Qu');

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
