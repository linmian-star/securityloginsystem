// 审计日志 Controller：列表 / 统计
// 只负责 HTTP 层

const AuditLog = require('../models/AuditLog');

// GET /api/audit-logs  获取日志列表（分页 + 过滤），仅管理员可查
async function getAuditLogs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 构造过滤条件
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.username) filter.username = req.query.username;

    const [list, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    res.status(200).json({
      code: 200,
      data: list,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("获取审计日志失败:", err);
    res.status(500).json({ code: 500, message: '获取审计日志失败' });
  }
}

// GET /api/audit-logs/stats  日志统计接口：给仪表盘供真数据，仅管理员可查
async function getAuditLogStats(req, res) {
  try {
    // 今日异常登录 = 今天的 login_failed 数量
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayAbnormal = await AuditLog.countDocuments({
      action: 'login_failed',
      createdAt: { $gte: todayStart }
    });

    // 月度登录趋势：最近 5 个月每月 login_success 数量（聚合管道）
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    fiveMonthsAgo.setDate(1);
    fiveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAgg = await AuditLog.aggregate([
      { $match: { action: 'login_success', createdAt: { $gte: fiveMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 把聚合结果格式化成前端要的 trendData 形式
    const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const trendData = monthlyAgg.map(item => ({
      month: monthNames[item._id.month - 1],
      count: item.count
    }));

    res.status(200).json({
      code: 200,
      data: { todayAbnormalLogins: todayAbnormal, trendData }
    });
  } catch (err) {
    console.error("日志统计失败:", err);
    res.status(500).json({ code: 500, message: '日志统计失败' });
  }
}

module.exports = { getAuditLogs, getAuditLogStats };
