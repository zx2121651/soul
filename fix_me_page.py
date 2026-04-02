import re

with open('soul-app-web/src/pages/MePage.tsx', 'r') as f:
    content = f.read()

import_replacement = """
import { useState, useEffect } from 'react';
import { Settings, Edit3, Image as ImageIcon, MapPin, Target, Gamepad2, Sparkles, Plus, Eye } from 'lucide-react';
"""

content = re.sub(r'import \{ useState \}.*?from \'lucide-react\';', import_replacement, content, flags=re.DOTALL)

state_replacement = """
export default function MePage() {
  const [activeTab, setActiveTab] = useState<'moments' | 'co-create' | 'about'>('moments');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>({
    name: '', id: '', avatar: '', followers: 0, following: 0, visitors: 0, bio: ''
  });
  const [moments, setMoments] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/me')
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile || {});
        setMoments(data.moments || []);
      })
      .catch(err => console.error("Failed to fetch me data", err));
  }, []);
"""

content = re.sub(r'export default function MePage\(\) \{\n  const \[activeTab, setActiveTab\] = useState<\'moments\' \| \'co-create\' \| \'about\'>\(\'moments\'\);\n  const \[selectedImage, setSelectedImage\] = useState<string \| null>\(null\);', state_replacement, content)

content = re.sub(r'const mockMoments = \[[\s\S]*?\];', '', content)
content = content.replace('mockMoments.map', 'moments.map')


# Fix usages of static text with dynamic profile
content = content.replace('>自己 (Me)<', '>{profile.name}<')
content = content.replace('>128<', '>{profile.followers}<')
content = content.replace('>342<', '>{profile.following}<')
content = content.replace('>89<', '>{profile.visitors}<')
content = content.replace('宇宙很大，生活更大。探索中...', '{profile.bio}')
content = content.replace('src="https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=ffe0b2"', 'src={profile.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=ffe0b2"}')


with open('soul-app-web/src/pages/MePage.tsx', 'w') as f:
    f.write(content)
