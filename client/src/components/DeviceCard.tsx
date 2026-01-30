import React from 'react';
import type { Device } from '../types';
import { Server, Wifi, Monitor, Cpu, Printer, Phone, Trash2, Pencil, Activity, Network, Camera, Radio, Shield, ScanLine, Database, PhoneCall, Layers, Cloud, ClipboardList, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';


interface DeviceCardProps {
    device: Device;
    onDelete: (id: number) => void;
    onEdit: (device: Device) => void;
    onHistory: (device: Device) => void;
    onManageServices: (device: Device) => void;
    onReport: (device: Device) => void;
}

const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'router': return <Wifi className="w-6 h-6" />;
        case 'switch': return <Network className="w-6 h-6" />;
        case 'server': return <Server className="w-6 h-6" />;
        case 'pc':
        case 'estacion': return <Monitor className="w-6 h-6" />;
        case 'plc': return <Cpu className="w-6 h-6" />;
        case 'printer': return <Printer className="w-6 h-6" />;
        case 'phone': return <Phone className="w-6 h-6" />;
        case 'camera': return <Camera className="w-6 h-6" />;
        case 'antenna': return <Radio className="w-6 h-6" />;
        case 'firewall': return <Shield className="w-6 h-6" />;
        case 'scanner': return <ScanLine className="w-6 h-6" />;
        case 'as400': return <Database className="w-6 h-6" />;
        case 'central_tel': return <PhoneCall className="w-6 h-6" />;
        case 'vmware': return <Layers className="w-6 h-6" />;
        case 'virtual_server': return <Cloud className="w-6 h-6" />;
        default: return <Server className="w-6 h-6" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'bg-status-active';
        case 'warning': return 'bg-status-warning';
        case 'inactive': return 'bg-status-inactive';
        default: return 'bg-slate-500';
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'active': return 'Activo';
        case 'warning': return 'Advertencia';
        case 'inactive': return 'Inactivo';
        default: return 'Desconocido';
    }
};

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onDelete, onEdit, onHistory, onManageServices, onReport }) => {
    const { isAdmin } = useAdmin();

    // Calculate services stats
    const services = device.services || [];
    const activeServices = services.filter(s => s.status === 'up').length;
    const totalServices = services.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card rounded-lg border border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow relative group"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-slate-800 rounded-lg text-blue-400">
                    {getIcon(device.type)}
                </div>
                <div>
                    <h4 className="font-semibold text-lg leading-tight">{device.name}</h4>
                    <p className="text-dark-muted text-sm font-mono mt-1">{device.ip}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></span>
                    <span className="text-sm font-medium capitalize text-slate-200">{getStatusText(device.status)}</span>
                </div>
                <div className="text-xs text-dark-muted font-mono">
                    {device.latency ? `${device.latency}ms` : '--'}
                </div>
            </div>

            {/* Service Summary */}
            {totalServices > 0 && (
                <div className="mt-3 bg-slate-800/50 rounded px-2 py-1.5 flex items-center gap-2 text-xs">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-slate-300">
                        Servicios: <span className={activeServices === totalServices ? "text-green-400" : "text-yellow-400"}>{activeServices}/{totalServices}</span> Online
                    </span>
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                    Último ping: {device.lastPing ? new Date(device.lastPing).toLocaleTimeString() : 'Nunca'}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onReport(device)}
                        className="text-slate-400 hover:text-purple-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                        title="Ver reporte"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => onManageServices(device)}
                            className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${totalServices > 0 ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                            title="Gestionar Servicios"
                        >
                            <Activity className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => onHistory(device)}
                        className="text-slate-400 hover:text-blue-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                        title="Ver historial"
                    >
                        <ClipboardList className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => onEdit(device)}
                                className="text-slate-400 hover:text-blue-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                                title="Editar dispositivo"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(device.id)}
                                className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                                title="Eliminar dispositivo"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

            </div>
        </motion.div>
    );
};
