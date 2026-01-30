import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { addDevice, updateDevice } from '../api';
import type { Device } from '../types';

interface DeviceFormProps {
    onClose: () => void;
    onSuccess: () => void;
    deviceToEdit?: Device | null;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({ onClose, onSuccess, deviceToEdit }) => {
    const [name, setName] = useState('');
    const [ip, setIp] = useState('');
    const [type, setType] = useState('server');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (deviceToEdit) {
            setName(deviceToEdit.name);
            setIp(deviceToEdit.ip);
            setType(deviceToEdit.type);
        }
    }, [deviceToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (deviceToEdit) {
                await updateDevice(deviceToEdit.id, { name, ip, type });
            } else {
                await addDevice({ name, ip, type });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error saving device:', err);
            const msg = err.response?.data?.error || err.message || 'Error desconocido';
            setError(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-md border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{deviceToEdit ? 'Editar Dispositivo' : 'Agregar Dispositivo'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nombre</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Ej. Servidor Principal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Dirección IP</label>
                        <input
                            type="text"
                            required
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Ej. 192.168.1.100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Dispositivo</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="server">Servidor</option>
                            <option value="router">Router</option>
                            <option value="switch">Switch</option>
                            <option value="pc">Estación de Trabajo</option>
                            <option value="printer">Impresora</option>
                            <option value="plc">PLC</option>
                            <option value="phone">Teléfono IP</option>
                            <option value="camera">Cámaras</option>
                            <option value="antenna">Antenas</option>
                            <option value="firewall">Firewall</option>
                            <option value="scanner">Escanner</option>
                            <option value="as400">AS400</option>
                            <option value="central_tel">Central Tel</option>
                            <option value="vmware">VMware</option>
                            <option value="virtual_server">Servidor Virtual</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : (deviceToEdit ? 'Actualizar' : 'Guardar Dispositivo')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
