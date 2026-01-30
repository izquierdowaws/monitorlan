import React from 'react';
import { Activity } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-dark-bg text-dark-text font-sans">
            <header className="bg-dark-card border-b border-slate-700 p-4 sticky top-0 z-10 shadow-md">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-500 w-8 h-8" />
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Monitor de Infraestructura</h1>
                            <p className="text-xs text-dark-muted">Dashboard de monitoreo de dispositivos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Add user profile or settings here if needed */}
                        <div className="text-sm text-dark-muted">v1.0.0</div>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
};
