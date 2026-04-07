const fs = require('fs');
const file = 'soul-app-admin/src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('ReactECharts')) {
  content = content.replace(
    "import { api } from '../api/client';",
    "import { api } from '../api/client';\nimport ReactECharts from 'echarts-for-react';"
  );

  const chartOptions = `
  const getChartOptions = () => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(28, 30, 43, 0.9)',
      borderColor: '#2a2c3d',
      textStyle: { color: '#e5e7eb' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisLine: { lineStyle: { color: '#4b5563' } }
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: { lineStyle: { color: '#2a2c3d' } },
        axisLabel: { color: '#9ca3af' }
      }
    ],
    series: [
      {
        name: '星际漫游活跃度',
        type: 'line',
        smooth: true,
        lineStyle: { width: 3, color: '#22d3ee' },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(34, 211, 238, 0.5)' },
              { offset: 1, color: 'rgba(34, 211, 238, 0.01)' }
            ]
          }
        },
        data: [12000, 13200, 10100, 13400, 9000, 23000, 21000]
      },
      {
        name: '瞬间发布量',
        type: 'line',
        smooth: true,
        lineStyle: { width: 3, color: '#a855f7' },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(168, 85, 247, 0.5)' },
              { offset: 1, color: 'rgba(168, 85, 247, 0.01)' }
            ]
          }
        },
        data: [2200, 1820, 1910, 2340, 2900, 3300, 3100]
      }
    ]
  });
  `;

  content = content.replace(
    'return (',
    `${chartOptions}\n  return (`
  );

  content = content.replace(
    '<div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'center\', height: 200, color: \'#6b7280\' }}>\n              [ 图表区域: 等待接入 ECharts ]\n            </div>',
    '<ReactECharts option={getChartOptions()} style={{ height: 300, width: \'100%\' }} />'
  );

  fs.writeFileSync(file, content);
}
