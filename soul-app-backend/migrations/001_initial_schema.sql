-- 1. Core Users & Moments
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar TEXT,
  bio TEXT,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS moments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT,
  url TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Relationships & Interactions
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS blocks (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS moment_likes (
  moment_id INTEGER NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (moment_id, user_id)
);

CREATE TABLE IF NOT EXISTS moment_comments (
  id SERIAL PRIMARY KEY,
  moment_id INTEGER NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Chat & Messaging System
CREATE TABLE IF NOT EXISTS chat_rooms (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'private' or 'group'
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_room_members (
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Virtual Assets & Store
CREATE TABLE IF NOT EXISTS wallets (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins INTEGER DEFAULT 0,
  diamonds INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency_type VARCHAR(50) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Guilds & Advanced
CREATE TABLE IF NOT EXISTS families (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  notice TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_moments_user_id ON moments(user_id);
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, is_read);
