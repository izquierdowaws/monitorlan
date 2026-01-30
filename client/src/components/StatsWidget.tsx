import React from 'react';
import type { Stats } from '../types';
import { Server, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface StatsWidgetProps {
    stats: Stats;
    onFilterChange: (filter: string) => void;
    activeFilter: string;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ stats, onFilterChange, activeFilter }) => {
    const getCardClass = (filterName: string) => {
        const baseClass = "bg-dark-card p-4 rounded-lg border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:scale-105";
        const activeClass = "border-blue-500 ring-1 ring-blue-500";
        const inactiveClass = "border-slate-700 hover:border-slate-600";

        return `${baseClass} ${activeFilter === filterName ? activeClass : inactiveClass}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div
                onClick={() => onFilterChange('all')}
                className={getCardClass('all')}
            >
                <div>
                    <p className="text-dark-muted text-sm font-medium">Total Dispositivos</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
                </div>
                <div className="p-3 bg-slate-800 rounded-full">
                    <Server className="w-6 h-6 text-slate-400" />
                </div>
            </div>

            <div
                onClick={() => onFilterChange('active')}
                className={getCardClass('active')}
            >
                <div>
                    <p className="text-dark-muted text-sm font-medium">Activos</p>
                    <h3 className="text-3xl font-bold mt-1 text-status-active">{stats.active}</h3>
                </div>
                <div className="p-3 bg-slate-800 rounded-full">
                    <CheckCircle className="w-6 h-6 text-status-active" />
                </div>
            </div>

            <div
                onClick={() => onFilterChange('warning')}
                className={getCardClass('warning')}
            >
                <div>
                    <p className="text-dark-muted text-sm font-medium">Advertencias</p>
                    <h3 className="text-3xl font-bold mt-1 text-status-warning">{stats.warning}</h3>
                </div>
                <div className="p-3 bg-slate-800 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-status-warning" />
                </div>
            </div>

            <div
                onClick={() => onFilterChange('inactive')}
                className={getCardClass('inactive')}
            >
                <div>
                    <p className="text-dark-muted text-sm font-medium">Inactivos</p>
                    <h3 className="text-3xl font-bold mt-1 text-status-inactive">{stats.inactive}</h3>
                </div>
                <div className="p-3 bg-slate-800 rounded-full">
                    <XCircle className="w-6 h-6 text-status-inactive" />
                </div>
            </div>
        </div>
    );
};
