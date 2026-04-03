import re

with open('soul-app-web/src/pages/ExplorePage.tsx', 'r') as f:
    content = f.read()

import_replacement = """
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, Play, Plus } from 'lucide-react';
import UserProfileModal from '../components/UserProfileModal';
import type { UserProfileData } from '../components/UserProfileModal';
"""

# Replace imports
content = re.sub(r'import \{ useState \}.*?mockExploreData\';', import_replacement, content, flags=re.DOTALL)

state_replacement = """
export default function ExplorePage() {
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);

  const [banners, setBanners] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/explore')
      .then(res => res.json())
      .then(data => {
        setBanners(data.banners || []);
        setTrendingTopics(data.trendingTopics || []);
        setPosts(data.posts || []);
      })
      .catch(err => console.error("Failed to fetch explore data", err));
  }, []);
"""

content = re.sub(r'export default function ExplorePage\(\) \{\n  const \[selectedUser, setSelectedUser\] = useState<UserProfileData \| null>\(null\);', state_replacement, content)

# Instead of blindly replacing, map what exists
content = content.replace('mockPosts.map', 'posts.map')

with open('soul-app-web/src/pages/ExplorePage.tsx', 'w') as f:
    f.write(content)
