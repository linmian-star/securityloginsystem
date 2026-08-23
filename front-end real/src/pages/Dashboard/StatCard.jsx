// 统计卡片：负责单张安全指标卡片的展示
// 通过 props 接收展示所需字段，不持有任何状态
//
// props:
//   cardClass   卡片样式类名（card-user / card-danger / card-online / card-secure）
//   icon        emoji 图标
//   label       主标签
//   value       数值
//   valueClass  数值样式类名（可选，如 value-danger / value-secure）
//   subLabel    副标签（可选）
//   tag         右侧徽章文字（可选，会带 tag-green 样式）

function StatCard({ cardClass, icon, label, value, valueClass, subLabel, tag }) {
  return (
    <div className={`stat-card ${cardClass}`}>
      <div className="card-left">
        <span>{icon}</span>
        <span className="card-label">{label}</span>
        {subLabel && <span className="card-sub-label">{subLabel}</span>}
      </div>
      <div className="card-right">
        <span className={`card-value ${valueClass || ''}`}>{value}</span>
        {tag && <span className="tag-green">{tag}</span>}
      </div>
    </div>
  );
}

export default StatCard;
