import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Typography, Modal, Form, Input, InputNumber, Popconfirm, Image, Tag } from 'antd';
import { PictureOutlined, PlusOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { api } from '../api/client';

const { Title } = Typography;

interface Banner {
  id: number;
  image_url: string;
  link: string;
  sort_order: number;
  created_at: string;
}

const Banners: React.FC = () => {
  const [data, setData] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取轮播图列表
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/banners');
      setData(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      message.error('获取轮播海报列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 提交新增海报
  const handlePublish = async (values: any) => {
    setSubmitLoading(true);
    try {
      await api.post('/admin/banners', values);
      message.success('新海报上架成功！手机端广场将立即更新显示。');
      setIsModalVisible(false);
      form.resetFields();
      fetchBanners();
    } catch (err) {
      message.error('海报上架失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 下架海报处理
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/banners/${id}`);
      message.success('海报已从手机端广场撤下');
      fetchBanners();
    } catch (err) {
      message.error('下架操作失败');
    }
  };

  const columns = [
    {
      title: '排序权重',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
      render: (order: number) => <Tag color="cyan">权重 {order}</Tag>
    },
    {
      title: '海报预览图',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (url: string) => (
        <Image
          width={160}
          height={80}
          src={url}
          style={{ borderRadius: 8, objectFit: 'cover' }}
          fallback="https://via.placeholder.com/160x80?text=Image+Error"
        />
      )
    },
    {
      title: '跳转链接',
      dataIndex: 'link',
      key: 'link',
      render: (link: string) => (
        <a href={link} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>
          <LinkOutlined style={{ marginRight: 4 }} />
          {link === '#' ? '无跳转 (#)' : link}
        </a>
      )
    },
    {
      title: '配置时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: Banner) => (
        <Popconfirm
          title="下架海报"
          description="确定要将这张海报从广场轮播中撤下吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确认下架"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button danger type="text" icon={<DeleteOutlined />}>
            下架
          </Button>
        </Popconfirm>
      ),
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 'bold' }}>广场海报 (Banner) 管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ background: 'linear-gradient(90deg, #ec4899 0%, #a855f7 100%)', border: 'none' }}
        >
          上架新海报
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

      {/* 新增海报弹窗表单 */}
      <Modal
        title={<span style={{ color: '#e5e7eb' }}>🖼️ 上架新广场海报</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        styles={{ body: { background: '#1f2937' }, header: { background: '#1f2937', borderBottom: '1px solid #374151' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePublish}
          initialValues={{ sort_order: 1, link: '#' }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="image_url"
            label={<span style={{ color: '#9ca3af' }}>海报图片直链 (URL)</span>}
            rules={[{ required: true, message: '请提供图片的真实网络地址' }]}
          >
            <Input prefix={<PictureOutlined />} placeholder="例如：https://images.unsplash.com/xxx" style={{ background: '#111827', color: '#fff', borderColor: '#374151' }} />
          </Form.Item>

          <Form.Item
            name="link"
            label={<span style={{ color: '#9ca3af' }}>点击跳转链接 (H5或站内路由)</span>}
          >
            <Input prefix={<LinkOutlined />} placeholder="默认填 # 表示不跳转" style={{ background: '#111827', color: '#fff', borderColor: '#374151' }} />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label={<span style={{ color: '#9ca3af' }}>排序权重 (数字越小越靠前)</span>}
          >
            <InputNumber min={0} max={999} style={{ width: '100%', background: '#111827', color: '#fff', borderColor: '#374151' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8, background: 'transparent', color: '#9ca3af', borderColor: '#374151' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} style={{ background: '#ec4899', color: '#fff', border: 'none', fontWeight: 'bold' }}>
              确认上架
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Banners;
