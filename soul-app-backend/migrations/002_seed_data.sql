-- Seed Initial Data
INSERT INTO users (uuid, name, username, password_hash, avatar, bio, followers, following, visitors)
VALUES ('soul_123456', '一只小透明', 'testuser', 'MOCK_HASH_DO_NOT_USE', 'https://api.dicebear.com/7.x/adventurer/svg?seed=me&backgroundColor=f4b6c2', '寻找宇宙中的同频共振 ✨', 128, 56, 342)
ON CONFLICT (uuid) DO NOTHING;

INSERT INTO moments (user_id, type, content)
SELECT id, 'text', '保持热爱，奔赴山海' FROM users WHERE uuid = 'soul_123456'
ON CONFLICT DO NOTHING;

INSERT INTO wallets (user_id, coins, diamonds)
SELECT id, 1000, 50 FROM users WHERE uuid = 'soul_123456'
ON CONFLICT DO NOTHING;
