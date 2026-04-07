const fs = require('fs');
const file = 'soul-app-admin/src/pages/Moments.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('handleDelete')) {
  content = content.replace(
    "import { HeartOutlined, MessageOutlined } from '@ant-design/icons';",
    "import { HeartOutlined, MessageOutlined, ExclamationCircleOutlined } from '@ant-design/icons';\nimport { Modal, message } from 'antd';"
  );

  content = content.replace(
    'const fetchMoments = async',
    `const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这条瞬间吗？删除后不可恢复。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.delete(\`/admin/moments/\${id}\`);
          message.success('删除成功');
          fetchMoments(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const fetchMoments = async`
  );

  content = content.replace(
    '<a style={{ color: \'#ef4444\' }}>删除</a>',
    '<a style={{ color: \'#ef4444\' }} onClick={() => handleDelete(record.id)}>删除</a>'
  );

  // Need to pass record to the action render
  content = content.replace(
    "render: () => (",
    "render: (_: any, record: Moment) => ("
  );

  fs.writeFileSync(file, content);
}
