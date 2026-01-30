import React from 'react';
import type { Device } from '../types';
import { X, Printer, Server, CheckCircle, AlertTriangle, Monitor, Cpu, Wifi, Network } from 'lucide-react';

interface DeviceReportProps {
    device: Device;
    onClose: () => void;
}

const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'router': return <Wifi className="w-12 h-12" />;
        case 'switch': return <Network className="w-12 h-12" />;
        case 'server': return <Server className="w-12 h-12" />;
        case 'pc': return <Monitor className="w-12 h-12" />;
        case 'plc': return <Cpu className="w-12 h-12" />;
        default: return <Server className="w-12 h-12" />;
    }
};

export const DeviceReport: React.FC<DeviceReportProps> = ({ device, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white print:p-0 print:block print:static">
            <div className="bg-dark-card border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none print:bg-white print:text-black">

                {/* Header / Actions - Hidden on Print */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 print:hidden">
                    <h2 className="text-xl font-bold text-white">Reporte de Dispositivo</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                        >
                            <Printer className="w-4 h-4" /> Imprimir
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-8 print:p-0">
                    {/* Report Header */}
                    <div className="flex items-start gap-6 mb-8 pb-8 border-b border-slate-700 print:border-slate-300">
                        <div className="p-4 bg-slate-800 rounded-xl text-blue-400 print:bg-slate-100 print:text-black">
                            {getIcon(device.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-white print:text-black mb-1">{device.name}</h1>
                                    <p className="text-lg text-slate-400 print:text-slate-600 font-mono">{device.ip}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm ${device.status === 'active' ? 'bg-green-500/20 text-green-400 print:bg-green-100 print:text-green-800' :
                                    device.status === 'inactive' ? 'bg-red-500/20 text-red-400 print:bg-red-100 print:text-red-800' :
                                        'bg-yellow-500/20 text-yellow-400 print:bg-yellow-100 print:text-yellow-800'
                                    }`}>
                                    {device.status === 'active' ? 'OPERATIVO' : device.status === 'inactive' ? 'INACTIVO' : 'ALERTA'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Specs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:grid-cols-4">
                        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 print:bg-slate-50 print:border-slate-200">
                            <div className="text-sm text-slate-500 mb-1">Tipo de Dispositivo</div>
                            <div className="font-semibold text-white print:text-black capitalize">{device.type.replace('_', ' ')}</div>
                        </div>
                        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 print:bg-slate-50 print:border-slate-200">
                            <div className="text-sm text-slate-500 mb-1">Identificador ID</div>
                            <div className="font-semibold text-white print:text-black">#{device.id}</div>
                        </div>
                        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 print:bg-slate-50 print:border-slate-200">
                            <div className="text-sm text-slate-500 mb-1">Latencia Actual</div>
                            <div className="font-semibold text-white print:text-black">{device.latency ? `${device.latency} ms` : 'N/A'}</div>
                        </div>
                        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 print:bg-slate-50 print:border-slate-200">
                            <div className="text-sm text-slate-500 mb-1">Última Conexión</div>
                            <div className="font-semibold text-white print:text-black">{device.lastPing ? new Date(device.lastPing).toLocaleString() : 'Nunca'}</div>
                        </div>
                    </div>

                    {/* Services Section */}
                    <h3 className="text-xl font-bold text-white print:text-black mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                        Servicios Monitoreados
                    </h3>

                    {!device.services || device.services.length === 0 ? (
                        <div className="bg-slate-800/20 rounded-lg p-8 text-center text-slate-500 border border-slate-700 border-dashed print:border-slate-300">
                            No hay servicios configurados para este dispositivo.
                        </div>
                    ) : (
                        <div className="border border-slate-700 rounded-lg overflow-hidden print:border-slate-300">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800 print:bg-slate-200">
                                    <tr>
                                        <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm">Servicio</th>
                                        <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm">Tipo</th>
                                        <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm">Detalle</th>
                                        <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm">Estado</th>
                                        <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm">Latencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700 print:divide-slate-300">
                                    {device.services.map(service => (
                                        <tr key={service.id} className="bg-slate-800/10 print:bg-white">
                                            <td className="p-3 font-medium text-white print:text-black">{service.name}</td>
                                            <td className="p-3 text-slate-300 print:text-black capitalize">{service.type.toUpperCase()}</td>
                                            <td className="p-3 text-slate-400 print:text-slate-600 font-mono text-sm">
                                                {service.type === 'tcp' ? `Port ${service.port}` : service.url}
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${service.status === 'up' ? 'bg-green-500/10 text-green-400 print:bg-green-100 print:text-green-800' :
                                                    service.status === 'down' ? 'bg-red-500/10 text-red-400 print:bg-red-100 print:text-red-800' :
                                                        'bg-slate-500/10 text-slate-400 print:bg-slate-100 print:text-slate-800'
                                                    }`}>
                                                    {service.status === 'up' ? <CheckCircle className="w-3 h-3" /> : service.status === 'down' ? <AlertTriangle className="w-3 h-3" /> : null}
                                                    {service.status === 'up' ? 'ONLINE' : service.status === 'down' ? 'OFFLINE' : 'UNKNOWN'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-400 print:text-slate-600 font-mono text-sm">
                                                {service.latency ? `${service.latency}ms` : '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-slate-700 flex justify-between text-xs text-slate-500 print:border-slate-300">
                        <div>MonitorLAN Infrastructure Report</div>
                        <div>Generado: {new Date().toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    div.fixed {
                        position: static;
                        background: white;
                        padding: 0;
                    }
                    div.fixed * {
                        visibility: visible;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
};
