import ping from 'ping';
import prisma from '../db';

export const pingDevice = async (ip: string) => {
    try {
        const res = await ping.promise.probe(ip, {
            timeout: 2,
        });
        return {
            alive: res.alive,
            latency: typeof res.time === 'number' ? Math.round(res.time) : null,
        };
    } catch (error) {
        console.error(`Error pinging ${ip}:`, error);
        return { alive: false, latency: null };
    }
};

export const pingAllDevices = async () => {
    console.log('Starting ping cycle...');
    const devices = await prisma.device.findMany();

    for (const device of devices) {
        const result = await pingDevice(device.ip);
        const status = result.alive ? 'active' : 'inactive';

        // Update device status
        try {
            await prisma.device.update({
                where: { id: device.id },
                data: {
                    status: status,
                    latency: result.latency,
                    lastPing: new Date(),
                },
            });

            // Log history
            await prisma.pingLog.create({
                data: {
                    deviceId: device.id,
                    status: status,
                    latency: result.latency,
                },
            });
        } catch (error: any) {
            // Ignore if device was deleted during ping
            if (error.code === 'P2025') {
                console.log(`Device ${device.id} was deleted during ping cycle.`);
            } else {
                console.error(`Error updating device ${device.id}:`, error);
            }
        }
    }
    console.log('Ping cycle completed.');
};

export const startMonitoring = () => {
    setInterval(pingAllDevices, 30000); // 30 seconds
};
