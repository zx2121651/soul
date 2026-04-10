const fs = require('fs');
const file = 'soul-app-admin/src/pages/Users.tsx';
let content = fs.readFileSync(file, 'utf8');

// 引入 Drawer 等组件，增加详情抽屉功能
content = content.replace(
  `import { Table, Card, Button, message, Popconfirm, Tag, Avatar, Typography, Segmented } from 'antd';`,
  `import { Table, Card, Button, message, Popconfirm, Tag, Avatar, Typography, Segmented, Drawer, Descriptions, List, Image } from 'antd';`
);

content = content.replace(
  `import { DeleteOutlined, UserOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';`,
  `import { DeleteOutlined, UserOutlined, CheckCircleOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';`
);

// State for Drawer
content = content.replace(
  `const [currentStatus, setCurrentStatus] = useState<string>('active');`,
  `const [currentStatus, setCurrentStatus] = useState<string>('active');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerUser, setDrawerUser] = useState<UserData | null>(null);
  const [drawerMoments, setDrawerMoments] = useState<any[]>([]);`
);

// Function to open drawer and fetch user moments
const drawerFuncs = `
  const showUserDetail = async (user: UserData) => {
    setDrawerUser(user);
    setDrawerVisible(true);
    // 拉取该用户的历史动态
    try {
      const res: any = await api.get(\`/admin/moments?userId=\${user.id}\`);
      setDrawerMoments(res.items || []);
    } catch (err) {
      message.error('无法获取该居民的历史瞬间');
    }
  };
`;

content = content.replace(
  `// 恢复(解封)用户处理函数`,
  `${drawerFuncs}\n\n  // 恢复(解封)用户处理函数`
);

// Update Action Column
content = content.replace(
  `okText="确认解封"
              cancelText="取消"
            >
              <Button type="text" style={{ color: '#10b981' }} icon={<CheckCircleOutlined />}>
                一键解封
              </Button>
            </Popconfirm>
          );
        }`,
  `okText="确认解封"
              cancelText="取消"
            >
              <Button type="text" style={{ color: '#10b981' }} icon={<CheckCircleOutlined />}>
                一键解封
              </Button>
            </Popconfirm>
          );
        }
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button type="text" icon={<EyeOutlined />} style={{ color: '#22d3ee' }} onClick={() => showUserDetail(record)}>
              深度审查
            </Button>
            <Popconfirm
              title="警告：封禁该居民"
              description="确定要封禁这个星球居民吗？其账号将被冻结。"
              onConfirm={() => handleDelete(record.id)}
              okText="确认封禁"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button danger type="text" icon={<StopOutlined />}>
                封禁冻结
              </Button>
            </Popconfirm>
          </div>
        );`
);

// Add Drawer UI to return
const drawerUI = `
      {/* 用户深度审查抽屉 */}
      <Drawer
        title={<span style={{ color: '#e5e7eb' }}>🛸 星球居民深度审查档案</span>}
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { background: '#12141d', color: '#e5e7eb' }, header: { background: '#1c1e2b', borderBottom: '1px solid #374151' } }}
      >
        {drawerUser && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar src={drawerUser.avatar} size={80} style={{ border: '2px solid #22d3ee', marginBottom: 12 }} />
              <h2 style={{ color: '#fff', margin: 0 }}>{drawerUser.name}</h2>
              <Tag color="blue" style={{ marginTop: 8 }}>UUID: {drawerUser.uuid}</Tag>
            </div>

            <Descriptions title={<span style={{ color: '#22d3ee' }}>基础数据</span>} column={1} labelStyle={{ color: '#9ca3af' }} contentStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}>
              <Descriptions.Item label="入驻时间">{new Date(drawerUser.created_at).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="绑定手机">{drawerUser.phone}</Descriptions.Item>
              <Descriptions.Item label="个性签名">{drawerUser.bio || '（无签名）'}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#22d3ee', marginBottom: 16, fontSize: '16px', fontWeight: 'bold' }}>历史瞬间追踪 ({drawerMoments.length})</h3>
              <List
                itemLayout="vertical"
                dataSource={drawerMoments}
                renderItem={(item: any) => (
                  <List.Item
                    key={item.id}
                    style={{ background: '#1c1e2b', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #374151' }}
                  >
                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
                      动态 ID: {item.id} | 发布于: {new Date(item.created_at).toLocaleString()}
                    </div>
                    <div style={{ color: '#fff', marginBottom: '12px' }}>{item.content || '（无文本内容）'}</div>
                    {item.media_urls && (
                      <Image width={100} height={100} src={item.media_urls} style={{ borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <div style={{ marginTop: '12px', display: 'flex', gap: '16px', color: '#ec4899', fontSize: '12px', fontWeight: 'bold' }}>
                       <span>❤️ {item.likes}</span>
                       <span style={{ color: '#6b7280' }}>状态: {item.status === 'active' ? '正常' : '已下架'}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </>
        )}
      </Drawer>
`;

content = content.replace(
  `</Card>\n    </div>`,
  `</Card>\n${drawerUI}\n    </div>`
);

fs.writeFileSync(file, content);
