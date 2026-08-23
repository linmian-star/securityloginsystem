// 仪表盘 Controller：提供统计数据给前端仪表盘
// 只负责 HTTP 层；统计算法目前仍在此 handler 内（原样从 server.js 搬过来）

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { getOrCreatePolicy } = require('../services/securityPolicyService');

// GET /api/dashboard-stats  仪表盘数据
async function getDashboardStats(req, res) {
    try {
        const realUserCount = await User.countDocuments({});

        // 今日异常登录 = 今天的 login_failed 数量（真实查询）
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayAbnormal = await AuditLog.countDocuments({
            action: 'login_failed',
            createdAt: { $gte: todayStart }
        });

        // 月度登录趋势：最近 5 个月每月 login_success 数量（真实聚合查询）
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
        const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
        const trendData = monthlyAgg.map(item => ({
            month: monthNames[item._id.month - 1],
            count: item.count
        }));

        // ===== 真实饼图数据：基于安全策略的阈值，把 login_failed 拆成「爆破/注入/其他」三类 =====
        const policy = await getOrCreatePolicy();
        const threshold = policy.maxLoginAttempts || 5;

        // 今日所有 login_failed（带 ip）
        const todayFails = await AuditLog.find({
            action: 'login_failed',
            createdAt: { $gte: todayStart }
        }).select('username detail ip createdAt');

        // 按 (username + ip) 聚合，超过阈值的归为「密码爆破」
        const pairCount = new Map();
        for (const log of todayFails) {
            const key = `${log.username}@${log.ip || 'unknown'}`;
            pairCount.set(key, (pairCount.get(key) || 0) + 1);
        }
        let bruteForce = 0;   // 密码爆破
        let injection = 0;    // 恶意注入（detail 命中关键字）
        let otherAttack = 0;  // 其他失败（如用户名不存在）

        const injectionKeywords = ['or 1=1', 'union select', '<script', '--', ';--', '%27', 'drop table', 'xp_', '<img src'];
        const lowerKeywords = injectionKeywords.map(k => k.toLowerCase());

        for (const log of todayFails) {
            const key = `${log.username}@${log.ip || 'unknown'}`;
            const total = pairCount.get(key) || 0;
            const detail = (log.detail || '').toLowerCase();
            const isInjection = lowerKeywords.some(kw => detail.includes(kw));

            if (isInjection) {
                injection += 1;
            } else if (total >= threshold) {
                bruteForce += 1;
            } else {
                otherAttack += 1;
            }
        }

        // 正常请求 = 今日 login_success 数量
        const todaySuccess = await AuditLog.countDocuments({
            action: 'login_success',
            createdAt: { $gte: todayStart }
        });

        // 拼成前端饼图能直接消费的数组
        const threatData = [
            { value: todaySuccess, name: '正常登录请求', itemStyle: { color: '#13c2c2' } },
            { value: bruteForce, name: '密码爆破攻击', itemStyle: { color: '#f5222d' } },
            { value: injection, name: '恶意注入攻击', itemStyle: { color: '#fa8c16' } },
            { value: otherAttack, name: '其他失败尝试', itemStyle: { color: '#8c8c8c' } }
        ];

        res.status(200).json({
            userCount: realUserCount,
            abnormalLogins: todayAbnormal,       // ✅ 真：今日登录失败次数
            onlineRate: "99.8%",                 // 暂留写死
            securityRating: "A+",                // 暂留写死
            trendData,                           // ✅ 真：月度登录成功趋势
            threatData                           // ✅ 真：今日安全威胁来源占比
        });
    } catch (err) {
        console.error("后端统计接口崩溃:", err.stack);
        res.status(500).json({ message: "获取安全指标失败", error: err.message });
    }
}

module.exports = { getDashboardStats };
