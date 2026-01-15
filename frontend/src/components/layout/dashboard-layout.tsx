import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

interface DashboardLayoutProps {
    requiredRole: UserRole;
}

export function DashboardLayout({ requiredRole }: DashboardLayoutProps) {
    const { isAuthenticated, role } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div className="flex min-h-screen w-full bg-background">
            <Sidebar
                role={requiredRole}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-col flex-1 min-w-0">
                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                    showMenu
                />

                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <div className="animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
