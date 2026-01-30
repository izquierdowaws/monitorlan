"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMonitoring = exports.pingDevice = void 0;
const ping_1 = __importDefault(require("ping"));
const db_1 = __importDefault(require("../db"));
const pingDevice = async (ip) => {
    try {
        const res = await ping_1.default.promise.probe(ip, {
            timeout: 2,
        });
        return {
            alive: res.alive,
            latency: typeof res.time === 'number' ? Math.round(res.time) : null,
        };
    }
    catch (error) {
        console.error(`Error pinging ${ip}:`, error);
        return { alive: false, latency: null };
    }
};
exports.pingDevice = pingDevice;
const startMonitoring = () => {
    setInterval(async () => {
        console.log('Starting ping cycle...');
        const devices = await db_1.default.device.findMany();
        for (const device of devices) {
            const result = await (0, exports.pingDevice)(device.ip);
            const status = result.alive ? 'active' : 'inactive'; // Simple logic, can add 'warning' if high latency
            // Update device status
            await db_1.default.device.update({
                where: { id: device.id },
                data: {
                    status: status,
                    latency: result.latency,
                    lastPing: new Date(),
                },
            });
            // Log history
            await db_1.default.pingLog.create({
                data: {
                    deviceId: device.id,
                    status: status,
                    latency: result.latency,
                },
            });
        }
        console.log('Ping cycle completed.');
    }, 30000); // 30 seconds
};
exports.startMonitoring = startMonitoring;
