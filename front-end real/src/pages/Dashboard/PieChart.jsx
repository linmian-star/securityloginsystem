// 饼图：负责安全威胁来源占比的可视化（环形饼图）
// 自包含 ECharts 生命周期：init → setOption → resize 监听 → dispose
//
// props:
//   data  威胁分类数据数组 [{ value, name, itemStyle }, ...]
//
// 设计要点：
//   - 实例与 DOM ref 都用 useRef 持有
//   - data 为空时使用"暂无数据"占位（与原 renderCharts 行为一致）
//   - option 配置与原 Dashboard.renderCharts 中的饼图分支完全一致

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function PieChart({ data }) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    instanceRef.current = echarts.init(containerRef.current);
    instanceRef.current.setOption({
      title: { text: '安全威胁来源占比', textStyle: { fontSize: 14, color: '#434343' } },
      tooltip: { trigger: 'item', formatter: '{a} <br>{b} : {c} ({d}%)' },
      legend: { bottom: '0', left: 'center', itemWidth: 10, itemHeight: 10 },
      series: [
        {
          name: '威胁类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: (data && data.length > 0) ? data : [
            { value: 0, name: '暂无数据', itemStyle: { color: '#bfbfbf' } }
          ]
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

export default PieChart;
