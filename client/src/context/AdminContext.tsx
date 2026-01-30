import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { setAdminPassword as setApiPassword, verifyPassword } from '../api';

interface AdminContextType {
    isAdmin: boolean;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    const login = async (password: string) => {
        try {
            await verifyPassword(password);
            setApiPassword(password);
            setIsAdmin(true);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        setApiPassword('');
        setIsAdmin(false);
    };

    return (
        <AdminContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
