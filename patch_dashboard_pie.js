const fs = require('fs');
const file = 'soul-app-admin/src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update imports
content = content.replace(
  `import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';`,
  `import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';`
);

// 2. Update Interface
content = content.replace(
  `chartData?: any[];`,
  `chartData?: any[];\n  genderData?: any[];\n  momentTypeData?: any[];`
);

// 3. Update initial state
content = content.replace(
  `chartData: []`,
  `chartData: [],\n    genderData: [],\n    momentTypeData: []`
);

// 4. Colors for Pie charts
content = content.replace(
  `const Dashboard: React.FC = () => {`,
  `const COLORS_GENDER = ['#3b82f6', '#ec4899']; // 蓝, 粉\nconst COLORS_MOMENT = ['#22d3ee', '#a855f7', '#f59e0b']; // 青, 紫, 橙\n\nconst Dashboard: React.FC = () => {`
);

// 5. Layout changes - change the full-width row into a row with 3 columns (1 Area, 2 Pies)
const areaChartJSX = `
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
                        {stats.genderData.map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={COLORS_GENDER[index % COLORS_GENDER.length]} />
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
                        {stats.momentTypeData.map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={COLORS_MOMENT[index % COLORS_MOMENT.length]} />
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
`;

const oldRowStr = `<Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title={<span style={{ color: '#e5e7eb' }}>星系活跃度分布</span>} bordered={false} style={{ minHeight: 300, background: '#1c1e2b' }}>
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
      </Row>`;

content = content.replace(oldRowStr, areaChartJSX);

fs.writeFileSync(file, content);
