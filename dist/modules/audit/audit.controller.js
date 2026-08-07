"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAuditEvent = exports.getAuditLogs = void 0;
const auditLogBuffer = [
    {
        id: 'LOG-1001',
        action: 'SYSTEM_BOOTUP',
        category: 'SYSTEM',
        performedBy: 'SYSTEM',
        ipAddress: '127.0.0.1',
        details: { event: 'Platform services initialized cleanly' },
        timestamp: new Date().toISOString()
    }
];
const getAuditLogs = async (req, res) => {
    try {
        const { category, limit = 50 } = req.query;
        let filtered = [...auditLogBuffer];
        if (category) {
            filtered = filtered.filter(l => l.category === category);
        }
        const take = parseInt(limit, 10) || 50;
        res.status(200).json({
            success: true,
            data: filtered.slice(0, take)
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAuditLogs = getAuditLogs;
const recordAuditEvent = (action, category, performedBy, ipAddress, details = {}) => {
    const newLog = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        action,
        category,
        performedBy,
        ipAddress,
        details,
        timestamp: new Date().toISOString()
    };
    auditLogBuffer.unshift(newLog);
    if (auditLogBuffer.length > 500) {
        auditLogBuffer.pop(); // Keep last 500 logs in memory
    }
};
exports.recordAuditEvent = recordAuditEvent;
//# sourceMappingURL=audit.controller.js.map