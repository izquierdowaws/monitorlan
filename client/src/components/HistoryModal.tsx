import React, { useEffect, useState } from 'react';
import { X, Activity } from 'lucide-react';
import { getDeviceHistory } from '../api';
import type { Device } from '../types';

interface HistoryModalProps {
    device: Device;
    onClose: () => void;
}

interface PingLog {
    id: number;
    status: string;
    latency: number | null;
    createdAt: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ device, onClose }) => {
    const [history, setHistory] = useState<PingLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getDeviceHistory(device.id);
                setHistory(data);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [device.id]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-2xl border border-slate-700 shadow-xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Historial de Ping</h2>
                            <p className="text-slate-400 text-sm">{device.name} ({device.ip})</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Cargando historial...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No hay historial disponible</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-400 border-b border-slate-700">
                                <tr>
                                    <th className="pb-3 pl-2">Hora</th>
                                    <th className="pb-3">Estado</th>
                                    <th className="pb-3">Latencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {history.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/30">
                                        <td className="py-3 pl-2 font-mono text-slate-300">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                    log.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-red-500/10 text-red-500'
                                                }`}>
                                                {log.status === 'active' ? 'Activo' :
                                                    log.status === 'warning' ? 'Advertencia' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="py-3 font-mono text-slate-300">
                                            {log.latency !== null ? `${log.latency}ms` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
