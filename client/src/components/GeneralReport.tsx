import React, { useState, useMemo } from 'react';
import type { Device } from '../types';
import { X, Printer, FileText, Filter, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface GeneralReportProps {
    devices: Device[];
    onClose: () => void;
}

export const GeneralReport: React.FC<GeneralReportProps> = ({ devices, onClose }) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const filteredDevices = useMemo(() => {
        return devices.filter(device => {
            const statusMatch = statusFilter === 'all' || device.status === statusFilter;
            const typeMatch = typeFilter === 'all' || device.type === typeFilter;
            return statusMatch && typeMatch;
        });
    }, [devices, statusFilter, typeFilter]);

    const stats = useMemo(() => {
        return {
            total: filteredDevices.length,
            active: filteredDevices.filter(d => d.status === 'active').length,
            warning: filteredDevices.filter(d => d.status === 'warning').length,
            inactive: filteredDevices.filter(d => d.status === 'inactive').length
        };
    }, [filteredDevices]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white print:p-0 print:block print:static">
            <div className="bg-dark-card border border-slate-700 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none print:bg-white print:text-black print:h-auto print:overflow-visible">

                {/* Header - No Print */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 print:hidden">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Reporte General de Dispositivos
                    </h2>
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

                {/* Filters - No Print */}
                <div className="p-4 border-b border-slate-700 bg-slate-800/30 flex gap-4 items-center print:hidden">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="active">Activos</option>
                        <option value="warning">Advertencia</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Todos los Tipos</option>
                        <option value="server">Servidores</option>
                        <option value="router">Routers</option>
                        <option value="switch">Switches</option>
                        <option value="pc">Estaciones</option>
                        <option value="printer">Impresoras</option>
                        <option value="plc">PLCs</option>
                        <option value="phone">Teléfonos</option>
                        <option value="camera">Cámaras</option>
                        <option value="antenna">Antenas</option>
                        <option value="firewall">Firewall</option>
                        <option value="scanner">Escanner</option>
                        <option value="as400">AS400</option>
                        <option value="central_tel">Central Tel</option>
                        <option value="vmware">VMware</option>
                        <option value="virtual_server">Servidor Virtual</option>
                    </select>
                    <div className="flex-1 text-right text-sm text-slate-400">
                        Mostrando <span className="text-white font-bold">{filteredDevices.length}</span> dispositivos
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible">

                    {/* Report Header for Print */}
                    <div className="hidden print:block mb-8 border-b border-slate-300 pb-4">
                        <h1 className="text-2xl font-bold text-black">Reporte General de Infraestructura</h1>
                        <p className="text-slate-600">Generado el {new Date().toLocaleString()}</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-8 print:mb-6">
                        <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700 print:bg-slate-50 print:border-slate-200">
                            <div className="text-sm text-slate-400 print:text-slate-600">Total Dispositivos</div>
                            <div className="text-2xl font-bold text-white print:text-black">{stats.total}</div>
                        </div>
                        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 print:bg-green-50 print:border-green-200">
                            <div className="text-sm text-green-400 print:text-green-700">Operativos</div>
                            <div className="text-2xl font-bold text-green-500 print:text-green-800">{stats.active}</div>
                        </div>
                        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 print:bg-yellow-50 print:border-yellow-200">
                            <div className="text-sm text-yellow-400 print:text-yellow-700">Advertencias</div>
                            <div className="text-2xl font-bold text-yellow-500 print:text-yellow-800">{stats.warning}</div>
                        </div>
                        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 print:bg-red-50 print:border-red-200">
                            <div className="text-sm text-red-400 print:text-red-700">Inactivos</div>
                            <div className="text-2xl font-bold text-red-500 print:text-red-800">{stats.inactive}</div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-slate-700 rounded-lg overflow-hidden print:border-slate-300">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800 print:bg-slate-100">
                                <tr>
                                    <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm border-b border-slate-700 print:border-slate-300">Estado</th>
                                    <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm border-b border-slate-700 print:border-slate-300">Nombre</th>
                                    <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm border-b border-slate-700 print:border-slate-300">IP</th>
                                    <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm border-b border-slate-700 print:border-slate-300">Tipo</th>
                                    <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm border-b border-slate-700 print:border-slate-300">Servicios</th>
                                    <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm border-b border-slate-700 print:border-slate-300">Latencia</th>
                                    <th className="p-3 text-slate-400 print:text-slate-700 font-medium text-sm border-b border-slate-700 print:border-slate-300">Último Ping</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 print:divide-slate-300">
                                {filteredDevices.map(device => {
                                    const activeServices = device.services?.filter(s => s.status === 'up').length || 0;
                                    const totalServices = device.services?.length || 0;

                                    return (
                                        <tr key={device.id} className="bg-slate-800/10 print:bg-white hover:bg-slate-800/30 print:hover:bg-transparent">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {device.status === 'active' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                                                        device.status === 'inactive' ? <XCircle className="w-4 h-4 text-red-500" /> :
                                                            <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                                    <span className={`text-xs font-bold uppercase ${device.status === 'active' ? 'text-green-500 print:text-green-700' :
                                                        device.status === 'inactive' ? 'text-red-500 print:text-red-700' :
                                                            'text-yellow-500 print:text-yellow-700'
                                                        }`}>{device.status}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium text-white print:text-black">{device.name}</td>
                                            <td className="p-3 text-slate-300 print:text-black font-mono text-sm">{device.ip}</td>
                                            <td className="p-3 text-slate-400 print:text-slate-600 capitalize text-sm">{device.type.replace('_', ' ')}</td>
                                            <td className="p-3">
                                                {totalServices > 0 ? (
                                                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${activeServices === totalServices ? 'bg-green-500/20 text-green-400 print:bg-green-100 print:text-green-800' :
                                                        'bg-yellow-500/20 text-yellow-400 print:bg-yellow-100 print:text-yellow-800'
                                                        }`}>
                                                        {activeServices}/{totalServices} ON
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-600 print:text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-slate-400 print:text-black font-mono text-sm">{device.latency ? `${device.latency}ms` : '-'}</td>
                                            <td className="p-3 text-slate-500 print:text-slate-600 text-xs">{device.lastPing ? new Date(device.lastPing).toLocaleTimeString() : 'Nunca'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
                        display: block;
                        height: auto;
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
                    table {
                         page-break-inside: auto;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                }
            `}</style>
        </div>
    );
};
