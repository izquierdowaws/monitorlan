import net from 'net';
import prisma from '../db';
import fetch from 'node-fetch'; // Make sure node-fetch is installed or use built-in fetch if Node 18+

// TCP Check
export const checkTcp = (host: string, port: number): Promise<{ status: 'up' | 'down', latency: number | null }> => {
    return new Promise((resolve) => {
        const start = Date.now();
        const socket = new net.Socket();
        
        socket.setTimeout(2000); // 2 seconds timeout

        socket.on('connect', () => {
            const latency = Date.now() - start;
            socket.destroy();
            resolve({ status: 'up', latency });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ status: 'down', latency: null });
        });

        socket.on('error', (err) => {
            socket.destroy();
            resolve({ status: 'down', latency: null });
        });

        socket.connect(port, host);
    });
};

// HTTP Check
export const checkHttp = async (url: string): Promise<{ status: 'up' | 'down', latency: number | null }> => {
    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

        const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeoutId);

        const latency = Date.now() - start;
        return {
            status: response.ok ? 'up' : 'down',
            latency
        };
    } catch (error) {
        return { status: 'down', latency: null };
    }
};

// Monitor All Services
export const monitorAllServices = async () => {
    console.log('Starting service monitoring cycle...');
    const services = await prisma.service.findMany({
        include: { device: true } // We might need device IP for TCP checks if using relative addressing, but schema has direct port/url
    });

    for (const service of services) {
        let result = { status: 'unknown', latency: null as number | null };

        if (service.type === 'tcp' && service.port) {
            // Use device IP
            result = await checkTcp(service.device.ip, service.port);
        } else if (service.type === 'http' && service.url) {
            result = await checkHttp(service.url);
        }

        // Update Service Status
        try {
            await prisma.service.update({
                where: { id: service.id },
                data: {
                    status: result.status,
                }
            });

            // Log History
            await prisma.serviceLog.create({
                data: {
                    serviceId: service.id,
                    status: result.status,
                    latency: result.latency
                }
            });
        } catch (error) {
            console.error(`Error updating service ${service.id}:`, error);
        }
    }
    console.log('Service monitoring cycle completed.');
};

export const startServiceMonitoring = () => {
    setInterval(monitorAllServices, 60000); // Check every minute
};
