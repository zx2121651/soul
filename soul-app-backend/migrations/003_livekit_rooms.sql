CREATE TABLE IF NOT EXISTS voice_rooms (
  id VARCHAR(100) PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  tags TEXT, -- JSON array of strings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed an active room
INSERT INTO voice_rooms (id, owner_id, title, tags)
SELECT 'music_room_1', id, '灵魂音乐节 - 一起听周杰伦', '["音乐", "周杰伦"]'
FROM users WHERE uuid = 'soul_123456'
ON CONFLICT (id) DO NOTHING;

INSERT INTO voice_rooms (id, owner_id, title, tags)
SELECT 'chat_room_2', id, '失眠深夜树洞', '["深夜", "治愈"]'
FROM users WHERE uuid = 'soul_bot_001'
ON CONFLICT (id) DO NOTHING;
