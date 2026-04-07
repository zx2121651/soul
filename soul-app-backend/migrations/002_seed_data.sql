-- Seed Initial Data
INSERT INTO users (uuid, name, username, password_hash, avatar, bio, followers, following, visitors)
VALUES ('soul_123456', '一只小透明', 'testuser', 'MOCK_HASH_DO_NOT_USE', 'https://api.dicebear.com/7.x/adventurer/svg?seed=me&backgroundColor=f4b6c2', '寻找宇宙中的同频共振 ✨', 128, 56, 342)
ON CONFLICT (uuid) DO NOTHING;

INSERT INTO moments (user_id, type, content)
SELECT id, 'text', '保持热爱，奔赴山海' FROM users WHERE uuid = 'soul_123456'
ON CONFLICT DO NOTHING;


-- Add another user to chat with
INSERT INTO users (uuid, name, username, password_hash, avatar, bio, followers, following, visitors)
VALUES ('soul_bot_001', 'Soul官方助手', 'soulbot', 'MOCK_HASH_DO_NOT_USE', 'https://api.dicebear.com/7.x/bottts/svg?seed=soul&backgroundColor=c0aede', '为你解答一切疑惑', 99999, 0, 99999)
ON CONFLICT (uuid) DO NOTHING;

INSERT INTO users (uuid, name, username, password_hash, avatar, bio, followers, following, visitors)
VALUES ('user_cat_002', '一只小橘猫🐱', 'orangecat', 'MOCK_HASH_DO_NOT_USE', 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=ffdfbf', '喵喵喵', 50, 20, 100)
ON CONFLICT (uuid) DO NOTHING;

-- Create chat rooms
INSERT INTO chat_rooms (id, type, name) VALUES (1, 'private', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO chat_rooms (id, type, name) VALUES (2, 'private', NULL) ON CONFLICT (id) DO NOTHING;

-- Add members to rooms (user 1 is soul_123456, user 2 is soul_bot_001, user 3 is user_cat_002)
-- We need to use subqueries to get the correct user IDs
INSERT INTO chat_room_members (room_id, user_id)
SELECT 1, id FROM users WHERE uuid IN ('soul_123456', 'soul_bot_001')
ON CONFLICT DO NOTHING;

INSERT INTO chat_room_members (room_id, user_id)
SELECT 2, id FROM users WHERE uuid IN ('soul_123456', 'user_cat_002')
ON CONFLICT DO NOTHING;

-- Insert messages
INSERT INTO chat_messages (room_id, sender_id, text)
SELECT 1, id, '你的星球有了新的访客，快去看看吧！' FROM users WHERE uuid = 'soul_bot_001';

INSERT INTO chat_messages (room_id, sender_id, text)
SELECT 2, id, '哈哈，那个表情包也太逗了吧' FROM users WHERE uuid = 'user_cat_002';

INSERT INTO wallets (user_id, coins, diamonds)
SELECT id, 1000, 50 FROM users WHERE uuid = 'soul_123456'
ON CONFLICT DO NOTHING;


-- Add another user to chat with
INSERT INTO users (uuid, name, username, password_hash, avatar, bio, followers, following, visitors)
VALUES ('soul_bot_001', 'Soul官方助手', 'soulbot', 'MOCK_HASH_DO_NOT_USE', 'https://api.dicebear.com/7.x/bottts/svg?seed=soul&backgroundColor=c0aede', '为你解答一切疑惑', 99999, 0, 99999)
ON CONFLICT (uuid) DO NOTHING;

INSERT INTO users (uuid, name, username, password_hash, avatar, bio, followers, following, visitors)
VALUES ('user_cat_002', '一只小橘猫🐱', 'orangecat', 'MOCK_HASH_DO_NOT_USE', 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=ffdfbf', '喵喵喵', 50, 20, 100)
ON CONFLICT (uuid) DO NOTHING;

-- Create chat rooms
INSERT INTO chat_rooms (id, type, name) VALUES (1, 'private', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO chat_rooms (id, type, name) VALUES (2, 'private', NULL) ON CONFLICT (id) DO NOTHING;

-- Add members to rooms (user 1 is soul_123456, user 2 is soul_bot_001, user 3 is user_cat_002)
-- We need to use subqueries to get the correct user IDs
INSERT INTO chat_room_members (room_id, user_id)
SELECT 1, id FROM users WHERE uuid IN ('soul_123456', 'soul_bot_001')
ON CONFLICT DO NOTHING;

INSERT INTO chat_room_members (room_id, user_id)
SELECT 2, id FROM users WHERE uuid IN ('soul_123456', 'user_cat_002')
ON CONFLICT DO NOTHING;

-- Insert messages
INSERT INTO chat_messages (room_id, sender_id, text)
SELECT 1, id, '你的星球有了新的访客，快去看看吧！' FROM users WHERE uuid = 'soul_bot_001';

INSERT INTO chat_messages (room_id, sender_id, text)
SELECT 2, id, '哈哈，那个表情包也太逗了吧' FROM users WHERE uuid = 'user_cat_002';
