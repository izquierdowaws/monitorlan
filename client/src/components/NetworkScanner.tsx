import { useState } from 'react';
import { scanNetwork, addDevice } from '../api';
import { X, Search, Plus, Check, Loader2 } from 'lucide-react';
import type { Device } from '../types';

interface NetworkScannerProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface ScanResult {
    ip: string;
    alive: boolean;
    latency: number | null;
    hostname?: string;
}

export function NetworkScanner({ onClose, onSuccess }: NetworkScannerProps) {
    const [startIp, setStartIp] = useState('192.168.1.1');
    const [endIp, setEndIp] = useState('192.168.1.254');
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState<ScanResult[]>([]);
    const [adding, setAdding] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setScanning(true);
        setError(null);
        setResults([]);

        try {
            const data = await scanNetwork(startIp, endIp);
            setResults(data);
            if (data.length === 0) {
                setError('No devices found in this range.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error scanning network');
        } finally {
            setScanning(false);
        }
    };

    const handleAddDevice = async (result: ScanResult) => {
        setAdding(result.ip);
        try {
            await addDevice({
                name: result.hostname || `Device ${result.ip}`,
                ip: result.ip,
                type: 'unknown', // Default type
            });
            onSuccess(); // Refresh main list
            // Remove from results or mark as added? For now, just show success state or remove
            setResults(prev => prev.filter(r => r.ip !== result.ip));
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error adding device');
        } finally {
            setAdding(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-xl w-full max-w-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-400" />
                        Escanear Red
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <form onSubmit={handleScan} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">IP Inicial</label>
                                <input
                                    type="text"
                                    required
                                    value={startIp}
                                    onChange={(e) => setStartIp(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="192.168.1.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">IP Final</label>
                                <input
                                    type="text"
                                    required
                                    value={endIp}
                                    onChange={(e) => setEndIp(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="192.168.1.254"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-900/50 rounded p-3 text-sm text-blue-200">
                            Nota: Escanear rangos grandes puede tomar tiempo. Se recomienda escanear por subred (/24).
                        </div>

                        <button
                            type="submit"
                            disabled={scanning}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                        >
                            {scanning ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Escaneando...
                                </>
                            ) : (
                                'Iniciar Escaneo'
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                Dispositivos Encontrados ({results.length})
                            </h3>
                            <div className="space-y-2">
                                {results.map((result) => (
                                    <div key={result.ip} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
                                        <div>
                                            <div className="font-medium text-white">
                                                {result.hostname || result.ip}
                                            </div>
                                            <div className="text-xs text-slate-400 flex items-center gap-2">
                                                <span>{result.ip}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                <span className="text-green-400">{result.latency}ms</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddDevice(result)}
                                            disabled={adding === result.ip}
                                            className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded transition-colors"
                                            title="Agregar a monitoreo"
                                        >
                                            {adding === result.ip ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
