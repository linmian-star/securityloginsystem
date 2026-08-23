// 通用消息提示组件
// 负责统一展示 success / error 等消息提示
//
// props:
//   type     消息类型：'success' | 'error' | 'info' | 'warning'（默认 'info'）
//   children 消息文本
//
// 当 children 为空时返回 null，避免渲染空提示框

import './Message.css';

function Message({ type = 'info', children }) {
  if (!children) return null;
  return (
    <div className={`message message-${type}`}>
      {children}
    </div>
  );
}

export default Message;
