import express from 'express';
import prisma from './db';
import { pingDevice, pingAllDevices } from './services/ping';
import { scanNetwork } from './services/scanner';
import { authMiddleware } from './middleware/auth';


const router = express.Router();

// Get all devices
router.get('/devices', async (req, res) => {
    const devices = await prisma.device.findMany({
        orderBy: { id: 'asc' },
        include: { services: true } // Include services in the response
    });
    res.json(devices);
});

// Add Service to Device
router.post('/devices/:id/services', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, type, port, url } = req.body;

    try {
        const service = await prisma.service.create({
            data: {
                deviceId: Number(id),
                name,
                type,
                port: port ? Number(port) : null,
                url,
                status: 'unknown'
            }
        });
        res.json(service);
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: 'Error adding service' });
    }
});

// Delete Service
router.delete('/services/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.serviceLog.deleteMany({ where: { serviceId: Number(id) } });
        await prisma.service.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting service' });
    }
});

// Verify password
router.post('/auth/verify', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {


        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Add device
router.post('/devices', authMiddleware, async (req, res) => {

    const { name, ip, type } = req.body;
    try {
        // Initial ping to set status immediately
        const pingRes = await pingDevice(ip);
        const status = pingRes.alive ? 'active' : 'inactive';

        const device = await prisma.device.create({
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
    } catch (error: any) {
        console.error('Error adding device:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'La dirección IP ya existe en la base de datos.' });
        } else {
            res.status(500).json({ error: 'Error interno del servidor al agregar dispositivo.' });
        }
    }
});

// Update device
router.put('/devices/:id', authMiddleware, async (req, res) => {

    const { id } = req.params;
    const { name, ip, type } = req.body;
    try {
        const device = await prisma.device.update({
            where: { id: Number(id) },
            data: { name, ip, type },
        });

        // Trigger a ping to update status with new IP if changed
        pingDevice(ip).then(async (pingRes) => {
            await prisma.device.update({
                where: { id: device.id },
                data: {
                    status: pingRes.alive ? 'active' : 'inactive',
                    latency: pingRes.latency,
                    lastPing: new Date()
                }
            });
        });

        res.json(device);
    } catch (error: any) {
        console.error('Error updating device:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'La dirección IP ya existe en otro dispositivo.' });
        } else {
            res.status(500).json({ error: 'Error al actualizar dispositivo.' });
        }
    }
});

// Delete device
router.delete('/devices/:id', authMiddleware, async (req, res) => {

    const { id } = req.params;
    try {
        await prisma.pingLog.deleteMany({ where: { deviceId: Number(id) } });
        await prisma.device.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: 'Delete failed' });
    }
});

// Get stats
router.get('/stats', async (req, res) => {
    const total = await prisma.device.count();
    const active = await prisma.device.count({ where: { status: 'active' } });
    const inactive = await prisma.device.count({ where: { status: 'inactive' } });
    const warning = await prisma.device.count({ where: { status: 'warning' } });

    res.json({ total, active, inactive, warning });
});

// Manual refresh
router.post('/refresh', async (req, res) => {
    try {
        await pingAllDevices();
        res.json({ success: true });
    } catch (error) {
        console.error('Refresh failed:', error);
        res.status(500).json({ error: 'Refresh failed' });
    }
});

// Get device history
router.get('/devices/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const history = await prisma.pingLog.findMany({
            where: { deviceId: Number(id) },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to last 50 pings
        });
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Error fetching history' });
    }
});

// Scan network
router.post('/scan', authMiddleware, async (req, res) => {

    const { startIp, endIp } = req.body;
    if (!startIp || !endIp) {
        return res.status(400).json({ error: 'Start IP and End IP are required' });
    }

    try {
        const results = await scanNetwork(startIp, endIp);
        res.json(results);
    } catch (error: any) {
        console.error('Scan failed:', error);
        res.status(400).json({ error: error.message || 'Scan failed' });
    }
});

export default router;
