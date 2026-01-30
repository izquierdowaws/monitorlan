import axios from 'axios';
import type { Device, Stats } from './types';

const api = axios.create({
    baseURL: import.meta.env.PROD ? '/api' : `http://${window.location.hostname}:3001/api`,
});

let adminPassword = '';

export const setAdminPassword = (password: string) => {
    adminPassword = password;
};

api.interceptors.request.use((config) => {
    if (adminPassword) {
        config.headers['x-admin-auth'] = adminPassword;
    }
    return config;
});


export const getDevices = async () => {
    const response = await api.get<Device[]>('/devices');
    return response.data;
};

export const addDevice = async (device: Omit<Device, 'id' | 'status' | 'latency' | 'lastPing'>) => {
    const response = await api.post<Device>('/devices', device);
    return response.data;
};

export const updateDevice = async (id: number, device: Partial<Device>) => {
    const response = await api.put<Device>(`/devices/${id}`, device);
    return response.data;
};

export const deleteDevice = async (id: number) => {
    await api.delete(`/devices/${id}`);
};

export const getStats = async () => {
    const response = await api.get<Stats>('/stats');
    return response.data;
};

export const refreshDevices = async () => {
    await api.post('/refresh');
};

export const getDeviceHistory = async (id: number) => {
    const response = await api.get<any[]>(`/devices/${id}/history`);
    return response.data;
};

export const scanNetwork = async (startIp: string, endIp: string) => {
    const response = await api.post<any[]>('/scan', { startIp, endIp });
    return response.data;
};

export const verifyPassword = async (password: string) => {
    const response = await api.post<{ success: boolean }>('/auth/verify', { password });
    return response.data;
};

export const addService = async (deviceId: number, service: { name: string, type: string, port?: number, url?: string }) => {
    const response = await api.post<any>(`/devices/${deviceId}/services`, service);
    return response.data;
};

export const deleteService = async (serviceId: number) => {
    await api.delete(`/services/${serviceId}`);
};

