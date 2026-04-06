import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';

const Dashboard: React.FC = () => (
  <div>
    <h2>数据大盘</h2>
    <Row gutter={16} style={{ marginTop: 24 }}>
      <Col span={8}>
        <Card>
          <Statistic title="总用户数" value={112893} />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic title="今日活跃" value={1128} />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic title="瞬间发布数" value={93} />
        </Card>
      </Col>
    </Row>
  </div>
);

export default Dashboard;
