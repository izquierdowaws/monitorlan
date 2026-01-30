import ping from 'ping';

interface ScanResult {
    ip: string;
    alive: boolean;
    latency: number | null;
    hostname?: string;
}

export const scanNetwork = async (startIp: string, endIp: string): Promise<ScanResult[]> => {
    const start = ipToLong(startIp);
    const end = ipToLong(endIp);
    const results: ScanResult[] = [];

    if (end < start) {
        throw new Error('End IP must be greater than Start IP');
    }

    if (end - start > 255) {
        throw new Error('Range too large. Please scan max 256 addresses at a time.');
    }

    const ipsToScan: string[] = [];
    for (let i = start; i <= end; i++) {
        ipsToScan.push(longToIp(i));
    }

    // Process in chunks to avoid overwhelming the system/network
    const chunkSize = 20;
    for (let i = 0; i < ipsToScan.length; i += chunkSize) {
        const chunk = ipsToScan.slice(i, i + chunkSize);
        const promises = chunk.map(async (ip): Promise<ScanResult | null> => {
            try {
                const res = await ping.promise.probe(ip, { timeout: 1 });
                if (res.alive) {
                    return {
                        ip,
                        alive: true,
                        latency: typeof res.time === 'number' ? Math.round(res.time) : null,
                        hostname: res.host,
                    };
                }
            } catch (e) {
                // Ignore errors
            }
            return null;
        });

        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults.filter((r): r is ScanResult => r !== null));
    }

    return results;
};

// Helper to convert IP to number
function ipToLong(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

// Helper to convert number to IP
function longToIp(long: number): string {
    return [
        (long >>> 24) & 255,
        (long >>> 16) & 255,
        (long >>> 8) & 255,
        long & 255
    ].join('.');
}
