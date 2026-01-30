import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface AdminLoginModalProps {
    onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAdmin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const success = await login(password);
        if (success) {
            onClose();
        } else {
            setError('Contraseña incorrecta');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-sm border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-500" />
                        Modo Administrador
                    </h2>
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
                        <label className="block text-sm font-medium text-slate-400 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Ingrese contraseña de admin"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
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
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : 'Acceder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
