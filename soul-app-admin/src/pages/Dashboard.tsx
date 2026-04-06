import React from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, UsergroupAddOutlined, MessageOutlined, AudioOutlined, FireOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 24, fontWeight: 'bold' }}>元宇宙枢纽概览</Title>
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ background: 'linear-gradient(145deg, rgba(34,211,238,0.1) 0%, rgba(34,211,238,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
          <Statistic
            title={<span style={{ color: '#9ca3af' }}>总居民数</span>}
            value={112893}
            prefix={<UsergroupAddOutlined style={{ color: '#22d3ee', marginRight: 8 }} />}
            valueStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#10b981' }}>
            <ArrowUpOutlined /> 1.2% 较昨日
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ background: 'linear-gradient(145deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
          <Statistic
            title={<span style={{ color: '#9ca3af' }}>今日星际漫游</span>}
            value={32128}
            prefix={<FireOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
            valueStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#10b981' }}>
            <ArrowUpOutlined /> 5.4% 较昨日
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ background: 'linear-gradient(145deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
          <Statistic
            title={<span style={{ color: '#9ca3af' }}>新诞生瞬间</span>}
            value={8392}
            prefix={<MessageOutlined style={{ color: '#a855f7', marginRight: 8 }} />}
            valueStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444' }}>
            <ArrowUpOutlined style={{ transform: 'rotate(180deg)' }} /> 0.8% 较昨日
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ background: 'linear-gradient(145deg, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
          <Statistic
            title={<span style={{ color: '#9ca3af' }}>活跃异星派对</span>}
            value={142}
            prefix={<AudioOutlined style={{ color: '#ec4899', marginRight: 8 }} />}
            valueStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#10b981' }}>
            <ArrowUpOutlined /> 12.5% 较昨日
          </div>
        </Card>
      </Col>
    </Row>

    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
      <Col span={24}>
        <Card title="星系活跃度分布" bordered={false} style={{ minHeight: 300, background: '#1c1e2b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#6b7280' }}>
            [ 图表区域: 等待接入 ECharts ]
          </div>
        </Card>
      </Col>
    </Row>
  </div>
);

export default Dashboard;
