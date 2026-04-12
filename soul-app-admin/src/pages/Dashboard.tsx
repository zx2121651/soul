import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, UsergroupAddOutlined, MessageOutlined, AudioOutlined, FireOutlined } from '@ant-design/icons';
import { api } from '../api/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const { Title } = Typography;

interface DashboardStats {
  totalUsers: number;
  totalMoments: number;
  activeRooms: number;
  activeToday: number;
  chartData?: any[];
  genderData?: any[];
  momentTypeData?: any[];
}

const COLORS_GENDER = ['#3b82f6', '#ec4899']; // 蓝, 粉
const COLORS_MOMENT = ['#22d3ee', '#a855f7', '#f59e0b']; // 青, 紫, 橙

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMoments: 0,
    activeRooms: 0,
    activeToday: 0,
    chartData: [],
    genderData: [],
    momentTypeData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res: any) => {
        setStats(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 24, fontWeight: 'bold' }}>元宇宙枢纽概览</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ background: 'linear-gradient(145deg, rgba(34,211,238,0.1) 0%, rgba(34,211,238,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
            <Statistic
              title={<span style={{ color: '#9ca3af' }}>总居民数</span>}
              value={stats.totalUsers}
              prefix={<UsergroupAddOutlined style={{ color: '#22d3ee', marginRight: 8 }} />}
              valueStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#10b981' }}>
              <ArrowUpOutlined /> 1.2% 较昨日
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ background: 'linear-gradient(145deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
            <Statistic
              title={<span style={{ color: '#9ca3af' }}>今日星际漫游</span>}
              value={stats.activeToday}
              prefix={<FireOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
              valueStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#10b981' }}>
              <ArrowUpOutlined /> 5.4% 较昨日
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ background: 'linear-gradient(145deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
            <Statistic
              title={<span style={{ color: '#9ca3af' }}>新诞生瞬间</span>}
              value={stats.totalMoments}
              prefix={<MessageOutlined style={{ color: '#a855f7', marginRight: 8 }} />}
              valueStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444' }}>
              <ArrowUpOutlined style={{ transform: 'rotate(180deg)' }} /> 0.8% 较昨日
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ background: 'linear-gradient(145deg, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
            <Statistic
              title={<span style={{ color: '#9ca3af' }}>活跃异星派对</span>}
              value={stats.activeRooms}
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
        {/* 左侧：星系活跃度分布 (面积图) */}
        <Col xs={24} lg={16}>
          <Card title={<span style={{ color: '#e5e7eb' }}>星系活跃度分布 (趋势图)</span>} bordered={false} style={{ minHeight: 300, background: '#1c1e2b' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350, color: '#6b7280', width: '100%' }}>
              {stats.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMoments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#e5e7eb' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="users" name="活跃居民数" stroke="#22d3ee" fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="moments" name="新增瞬间数" stroke="#a855f7" fillOpacity={1} fill="url(#colorMoments)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <span style={{ color: '#6b7280' }}>暂无图表数据</span>
              )}
            </div>
          </Card>
        </Col>

        {/* 右侧：原型图 (饼图) */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>

            {/* 性别比例圆形图 */}
            <Card title={<span style={{ color: '#e5e7eb' }}>居民性别占比</span>} bordered={false} style={{ flex: 1, background: '#1c1e2b' }}>
              <div style={{ height: 160, width: '100%' }}>
                {stats.genderData && stats.genderData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.genderData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_GENDER[index % COLORS_GENDER.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#e5e7eb' }}
                      />
                      <Legend verticalAlign="middle" align="right" layout="vertical" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>暂无数据</div>
                )}
              </div>
            </Card>

            {/* 动态类型圆形图 */}
            <Card title={<span style={{ color: '#e5e7eb' }}>瞬间类型分布</span>} bordered={false} style={{ flex: 1, background: '#1c1e2b' }}>
              <div style={{ height: 160, width: '100%' }}>
                {stats.momentTypeData && stats.momentTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.momentTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.momentTypeData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_MOMENT[index % COLORS_MOMENT.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#e5e7eb' }}
                      />
                      <Legend verticalAlign="middle" align="right" layout="vertical" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>暂无数据</div>
                )}
              </div>
            </Card>

          </div>
        </Col>
      </Row>

    </div>
  );
};

export default Dashboard;
