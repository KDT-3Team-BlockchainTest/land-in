-- 1. Demo User (이미 있을 수 있음)
INSERT IGNORE INTO users (email, password, display_name, avatar_url) VALUES
('demo@landin.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LandIn Demo', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400');

-- 2. Paris Event
INSERT INTO events (id, title, city, country, status, featured, start_date, end_date, description, hero_image_url, partner_name, theme_color) VALUES
('paris-spring-2026', '2026 Paris Landmark Collection', 'Paris', 'France', 'ACTIVE', true, '2026-04-01', '2026-06-30', 'Collect NFC stamps across eight Paris landmarks and unlock a spring travel reward.', 'https://images.unsplash.com/photo-1683151155634-08978faf9cc7?w=1080', 'Louvre Museum', '#C8A96E');

-- 3. Paris Steps
INSERT INTO steps (event_id, order_index, place_name, place_description, image_url, final_step) VALUES
('paris-spring-2026', 1, 'Eiffel Tower', 'Paris icon completed for the 1889 World''s Fair.', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400', false),
('paris-spring-2026', 2, 'Louvre Museum', 'The world''s most visited museum and home of the Mona Lisa.', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400', false),
('paris-spring-2026', 3, 'Notre-Dame', 'Gothic cathedral reborn after restoration.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', false),
('paris-spring-2026', 4, 'Arc de Triomphe', 'A monumental arch at the center of Place Charles de Gaulle.', 'https://images.unsplash.com/photo-1478136791624-4bcd7c65e825?w=400', false),
('paris-spring-2026', 5, 'Musee d''Orsay', 'A former    railway station turned impressionist museum.', 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400', false),
('paris-spring-2026', 6, 'Montmartre', 'An artistic hilltop district with classic Paris atmosphere.', 'https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400', false);

-- 4. NFT Templates (step_id는 UUID라 실제로는 Step insert 후 UUID 확인 필요)
-- 참고: 실제로는 steps insert 후 SELECT step.id 해서 nft_templates.step_id에 넣어야 함
INSERT INTO nft_templates (step_id, name, image_url, rarity, description) VALUES
(UUID(), 'Eiffel Tower NFT', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400', 'COMMON', 'A skyline-themed NFT inspired by the Eiffel Tower.'),
(UUID(), 'Louvre Pyramid NFT', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400', 'RARE', 'A reflective NFT themed after the Louvre glass pyramid.'),
(UUID(), 'Notre-Dame NFT', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', 'COMMON', 'A stained-glass inspired collectible from Notre-Dame.'),
(UUID(), 'Arc de Triomphe NFT', 'https://images.unsplash.com/photo-1478136791624-4bcd7c65e825?w=400', 'COMMON', 'A triumph-inspired NFT with Paris avenue motifs.'),
(UUID(), 'Orsay Gallery NFT', 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400', 'RARE', 'An impressionist palette collectible for museum visitors.'),
(UUID(), 'Montmartre NFT', 'https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400', 'COMMON', 'A bohemian street-scene NFT from Montmartre.');

-- 5. Event Participation
INSERT INTO event_participations (user_id, event_id, joined_at) VALUES
((SELECT id FROM users WHERE email = 'demo@landin.local'), 'paris-spring-2026', '2026-04-02 10:00:00');

-- 6. Step Completions (step_id UUID 확인 필요)
INSERT INTO step_completions (user_id, step_id, completed_at) VALUES
((SELECT id FROM users WHERE email = 'demo@landin.local'), UUID(), '2026-04-02 10:30:00'),
((SELECT id FROM users WHERE email = 'demo@landin.local'), UUID(), '2026-04-03 11:15:00');

-- 7. User NFTs (nft_template_id UUID 확인 필요)
INSERT INTO user_nfts (user_id, step_id, event_id, nft_template_id, name, image_url, rarity, minted_at) VALUES
((SELECT id FROM users WHERE email = 'demo@landin.local'), UUID(), 'paris-spring-2026', UUID(), 'Eiffel Tower NFT', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400', 'COMMON', '2026-04-02 10:30:00');