// 柱状图：负责月度登录/审计趋势的可视化
// 自包含 ECharts 生命周期：init → setOption → resize 监听 → dispose
//
// props:
//   data  趋势数据数组 [{ month, count }, ...]
//
// 设计要点：
//   - 实例与 DOM ref 都用 useRef 持有，避免组件重渲染时丢实例
//   - 监听 resize 用组件内私有 handleResize，cleanup 时配对移除
//   - data 变化时 cleanup 先 dispose 旧实例，再重新 init，避免内存泄漏
//   - option 配置与原 Dashboard.renderCharts 中的柱状图分支完全一致

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function BarChart({ data }) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const months = (data || []).map(item => item.month);
    const counts = (data || []).map(item => item.count);

    instanceRef.current = echarts.init(containerRef.current);
    instanceRef.current.setOption({
      title: { text: '用户登录趋势（月度数据审计）', textStyle: { fontSize: 14, color: '#434343' } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: months, axisTick: { alignWithLabel: true } },
      yAxis: { type: 'value' },
      series: [
        {
          name: '登录及审计数',
          type: 'bar',
          barWidth: '40%',
          data: counts,
          itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] }
        }
      ]
    });

    const handleResize = () => {
      if (instanceRef.current) instanceRef.current.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, [data]);

  return <div ref={containerRef} className="echarts-dom-container"></div>;
}

export default BarChart;
