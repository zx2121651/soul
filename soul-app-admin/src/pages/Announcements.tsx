import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Tag, Typography, Modal, Form, Input, Select } from 'antd';
import { NotificationOutlined, PlusOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { api } from '../api/client';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  created_at: string;
}

const Announcements: React.FC = () => {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取广播列表
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/announcements');
      setData(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      message.error('获取系统广播记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // 提交发布新广播
  const handlePublish = async (values: any) => {
    setSubmitLoading(true);
    try {
      await api.post('/admin/announcements', values);
      message.success('系统广播发送成功！全站居民将收到此消息。');
      setIsModalVisible(false);
      form.resetFields();
      fetchAnnouncements();
    } catch (err) {
      message.error('广播发布失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 根据广播类型返回特定的图标和标签样式
  const getTypeTag = (type: string) => {
    switch (type) {
      case 'system': return <Tag icon={<NotificationOutlined />} color="purple">系统公告</Tag>;
      case 'warning': return <Tag icon={<WarningOutlined />} color="error">重要警告</Tag>;
      case 'info':
      default: return <Tag icon={<InfoCircleOutlined />} color="blue">日常通知</Tag>;
    }
  };

  const columns = [
    {
      title: '广播 ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => getTypeTag(type)
    },
    {
      title: '广播标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string) => <span style={{ fontWeight: 'bold', color: '#e5e7eb' }}>{text}</span>
    },
    {
      title: '广播内容详情',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '展开全文' }} style={{ margin: 0, color: '#9ca3af' }}>
          {content}
        </Paragraph>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 'bold' }}>系统广播中心</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ background: 'linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)', border: 'none' }}
        >
          发布新广播
        </Button>
      </div>

      <Card bordered={false} style={{ background: '#1c1e2b' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ total, pageSize: 20 }}
        />
      </Card>

      {/* 发布广播的弹窗表单 */}
      <Modal
        title={<span style={{ color: '#e5e7eb' }}>📣 编辑全站系统广播</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        styles={{ body: { background: '#1f2937' }, header: { background: '#1f2937', borderBottom: '1px solid #374151' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePublish}
          initialValues={{ type: 'info' }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="title"
            label={<span style={{ color: '#9ca3af' }}>广播标题</span>}
            rules={[{ required: true, message: '请输入广播标题' }]}
          >
            <Input placeholder="例如：星际维护通知 / 新功能上线" style={{ background: '#111827', color: '#fff', borderColor: '#374151' }} />
          </Form.Item>

          <Form.Item
            name="type"
            label={<span style={{ color: '#9ca3af' }}>广播级别</span>}
            rules={[{ required: true, message: '请选择广播级别' }]}
          >
            <Select style={{ width: '100%' }} dropdownStyle={{ background: '#1f2937' }}>
              <Option value="info">日常通知 (普通颜色)</Option>
              <Option value="system">系统公告 (醒目颜色)</Option>
              <Option value="warning">重要警告 (红色警示)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label={<span style={{ color: '#9ca3af' }}>广播正文详情</span>}
            rules={[{ required: true, message: '请填写通知内容详情' }]}
          >
            <Input.TextArea
              rows={5}
              placeholder="请输入你要发送给全站居民的具体内容..."
              style={{ background: '#111827', color: '#fff', borderColor: '#374151' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8, background: 'transparent', color: '#9ca3af', borderColor: '#374151' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} style={{ background: '#22d3ee', color: '#000', border: 'none', fontWeight: 'bold' }}>
              确认发送
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default Announcements;
