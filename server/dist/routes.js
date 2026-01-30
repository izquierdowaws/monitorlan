"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const ping_1 = require("./services/ping");
const router = express_1.default.Router();
// Get all devices
router.get('/devices', async (req, res) => {
    const devices = await db_1.default.device.findMany({
        orderBy: { id: 'asc' },
    });
    res.json(devices);
});
// Add device
router.post('/devices', async (req, res) => {
    const { name, ip, type } = req.body;
    try {
        // Initial ping to set status immediately
        const pingRes = await (0, ping_1.pingDevice)(ip);
        const status = pingRes.alive ? 'active' : 'inactive';
        const device = await db_1.default.device.create({
            data: {
                name,
                ip,
                type,
                status,
                latency: pingRes.latency,
                lastPing: new Date(),
            },
        });
        res.json(device);
    }
    catch (error) {
        console.error('Error adding device:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'La dirección IP ya existe en la base de datos.' });
        }
        else {
            res.status(500).json({ error: 'Error interno del servidor al agregar dispositivo.' });
        }
    }
});
// Delete device
router.delete('/devices/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db_1.default.pingLog.deleteMany({ where: { deviceId: Number(id) } });
        await db_1.default.device.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ error: 'Delete failed' });
    }
});
// Get stats
router.get('/stats', async (req, res) => {
    const total = await db_1.default.device.count();
    const active = await db_1.default.device.count({ where: { status: 'active' } });
    const inactive = await db_1.default.device.count({ where: { status: 'inactive' } });
    const warning = await db_1.default.device.count({ where: { status: 'warning' } });
    res.json({ total, active, inactive, warning });
});
exports.default = router;
