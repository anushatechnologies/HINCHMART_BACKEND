import { Request, Response } from 'express';

interface AuditLog {
  id: string;
  action: string;
  category: 'AUTH' | 'ORDER' | 'SYSTEM' | 'VENDOR' | 'SECURITY';
  performedBy: string;
  ipAddress: string;
  details: any;
  timestamp: string;
}

const auditLogBuffer: AuditLog[] = [
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

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, limit = 50 } = req.query;

    let filtered = [...auditLogBuffer];
    if (category) {
      filtered = filtered.filter(l => l.category === category);
    }

    const take = parseInt(limit as string, 10) || 50;

    res.status(200).json({
      success: true,
      data: filtered.slice(0, take)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordAuditEvent = (
  action: string,
  category: 'AUTH' | 'ORDER' | 'SYSTEM' | 'VENDOR' | 'SECURITY',
  performedBy: string,
  ipAddress: string,
  details: any = {}
) => {
  const newLog: AuditLog = {
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
