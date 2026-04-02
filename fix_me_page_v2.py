import re

with open('soul-app-web/src/pages/MePage.tsx', 'r') as f:
    content = f.read()

import_replacement = """
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Eye, ChevronRight, Bell, HelpCircle, LogOut, ChevronLeft } from 'lucide-react';
"""

# Replace imports
content = re.sub(r'import \{ useState \}.*?from \'lucide-react\';', import_replacement, content, flags=re.DOTALL)

state_replacement = """
export default function MePage({ onOpenEditor }: { onOpenEditor?: () => void }) {
  const [activeTab, setActiveTab] = useState<'moments' | 'cocreate' | 'about'>('moments');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>({
    name: '自己 (Me)', id: '', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=me&backgroundColor=f4b6c2', followers: 128, following: 342, visitors: 89, bio: '宇宙很大，生活更大。探索中... ✨'
  });
  const [moments, setMoments] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/me')
      .then(res => res.json())
      .then(data => {
        if(data.profile) setProfile(data.profile);
        if(data.moments) setMoments(data.moments);
      })
      .catch(err => console.error("Failed to fetch me data", err));
  }, []);
"""

content = re.sub(r'export default function MePage\(\{ onOpenEditor \}: \{ onOpenEditor\?: \(\) => void \}\) \{\n  const \[activeTab, setActiveTab\] = useState<\'moments\' \| \'cocreate\' \| \'about\'>\(\'moments\'\);\n  const \[isSettingsOpen, setIsSettingsOpen\] = useState\(false\);\n  const \[selectedImage, setSelectedImage\] = useState<string \| null>\(null\);\n\n  const mockMoments = \[\n    \{ id: 1, type: \'image\', url: \'https://images.unsplash.com/photo-1517849845537-4d257902454a\?w=600&h=600&fit=crop\' \},\n    \{ id: 2, type: \'text\', content: \'"今天天气真好，去西湖边喝了咖啡。"\' \},\n    \{ id: 3, type: \'image\', url: \'https://images.unsplash.com/photo-1536924940846-227afb31e2a5\?w=600&h=600&fit=crop\' \},\n  \];', state_replacement, content)

content = content.replace('mockMoments.map', 'moments.map')

content = content.replace('>自己 (Me)<', '>{profile.name}<')
content = content.replace('>128<', '>{profile.followers}<')
content = content.replace('>342<', '>{profile.following}<')
content = content.replace('>89<', '>{profile.visitors}<')
content = content.replace('宇宙很大，生活更大。探索中... ✨', '{profile.bio}')
content = content.replace('src="https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=ffe0b2"', 'src={profile.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=ffe0b2"}')


with open('soul-app-web/src/pages/MePage.tsx', 'w') as f:
    f.write(content)
