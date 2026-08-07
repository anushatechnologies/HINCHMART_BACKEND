"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', async (req, res) => {
    const startTime = Date.now();
    let dbStatus = 'HEALTHY';
    let dbLatencyMs = 0;
    try {
        const dbStart = Date.now();
        await prisma.$queryRaw `SELECT 1`;
        dbLatencyMs = Date.now() - dbStart;
    }
    catch (error) {
        dbStatus = 'UNHEALTHY';
    }
    const isHealthy = dbStatus === 'HEALTHY';
    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        status: isHealthy ? 'OK' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
            status: dbStatus,
            latencyMs: dbLatencyMs
        },
        system: {
            nodeVersion: process.version,
            memoryUsage: process.memoryUsage()
        }
    });
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map