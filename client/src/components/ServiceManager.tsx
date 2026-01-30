import React, { useState } from 'react';
import type { Device } from '../types';
import { addService, deleteService } from '../api';
import { X, Plus, Trash2, Globe, Server, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface ServiceManagerProps {
    device: Device;
    onClose: () => void;
    onUpdate: () => void; // Trigger refresh
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({ device, onClose, onUpdate }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'tcp' | 'http'>('tcp');
    const [port, setPort] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addService(device.id, {
                name,
                type,
                port: type === 'tcp' ? Number(port) : undefined,
                url: type === 'http' ? url : undefined
            });
            setName('');
            setPort('');
            setUrl('');
            onUpdate();
        } catch (error) {
            console.error('Error adding service:', error);
            alert('Error adding service');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este servicio?')) return;
        try {
            await deleteService(id);
            onUpdate();
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-dark-card border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            Servicios Monitoreados
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Dispositivo: <span className="text-white font-mono">{device.name} ({device.ip})</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Add New Service Form */}
                    <div className="mb-8 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Agregar Nuevo Servicio
                        </h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-slate-400 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Servidor Web"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as 'tcp' | 'http')}
                                    className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                    <option value="tcp">Puerto TCP</option>
                                    <option value="http">Web (HTTP/S)</option>
                                </select>
                            </div>

                            {type === 'tcp' ? (
                                <div className="w-32">
                                    <label className="block text-xs text-slate-400 mb-1">Puerto</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="80"
                                        value={port}
                                        onChange={(e) => setPort(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-400 mb-1">URL</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://ejemplo.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Agregando...' : 'Agregar'}
                            </button>
                        </form>
                    </div>

                    {/* Services List */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-3">Servicios Activos</h3>
                        {!device.services || device.services.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 bg-slate-800/20 rounded-lg border border-slate-700/50 border-dashed">
                                No hay servicios configurados para este dispositivo.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {device.services.map((service) => (
                                    <div key={service.id} className="flex items-center justify-between bg-slate-800/40 p-3 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${service.status === 'up' ? 'bg-green-500/10 text-green-400' : service.status === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                                                {service.type === 'tcp' ? <Server className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-200">{service.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">
                                                    {service.type === 'tcp' ? `TCP Port ${service.port}` : service.url}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <div className={`flex items-center gap-1.5 text-sm font-medium ${service.status === 'up' ? 'text-green-400' : service.status === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                                                    {service.status === 'up' ? <CheckCircle className="w-3.5 h-3.5" /> : service.status === 'down' ? <AlertTriangle className="w-3.5 h-3.5" /> : null}
                                                    <span className="capitalize">{service.status === 'up' ? 'Online' : service.status === 'down' ? 'Offline' : 'Unknown'}</span>
                                                </div>
                                                {service.latency !== null && (
                                                    <div className="text-xs text-slate-500 font-mono">{service.latency}ms</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                                title="Eliminar servicio"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded text-sm font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
