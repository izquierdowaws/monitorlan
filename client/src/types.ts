export interface Device {
    id: number;
    name: string;
    ip: string;
    type: string;
    status: 'active' | 'inactive' | 'warning' | 'unknown';
    latency: number | null;
    lastPing: string | null;
    services?: Service[];
}

export interface Service {
    id: number;
    name: string;
    type: 'tcp' | 'http';
    port: number | null;
    url: string | null;
    status: 'up' | 'down' | 'unknown';
    latency: number | null;
}

export interface Stats {
    total: number;
    active: number;
    inactive: number;
    warning: number;
}
