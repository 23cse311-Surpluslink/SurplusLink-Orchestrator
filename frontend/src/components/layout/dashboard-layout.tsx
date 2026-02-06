import { Outlet, Navigate } from 'react-router-dom';
import { UserRole } from '@/types';

import { useAuth } from '@/contexts/auth-context';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from './app-sidebar';
import { Sun, Moon, Home, HelpCircle, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
    requiredRole?: UserRole;
}

export function DashboardLayout({ requiredRole }: DashboardLayoutProps) {
    const { isAuthenticated, role } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    const navLinks = [
        { name: 'Features', href: '/#features', icon: Sparkles },
        { name: 'How It Works', href: '/#how-it-works', icon: Info },
        { name: 'FAQ', href: '/#faq', icon: HelpCircle },
    ];

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background font-sans selection:bg-primary/20">
                <AppSidebar role={(role || 'donor') as UserRole} />

                <SidebarInset className="flex flex-col flex-1 min-w-0">
                    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/50 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1 hover:bg-white/20" />
                            <Separator orientation="vertical" className="mx-2 h-4 hidden md:block" />

                            <nav className="hidden md:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <button
                                        key={link.name}
                                        onClick={() => navigate(link.href)}
                                        className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-full flex items-center gap-1.5 uppercase tracking-wider"
                                    >
                                        <link.icon className="size-3.5" />
                                        {link.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="rounded-full hover:bg-primary/10 transition-colors"
                            >
                                {theme === 'light' ? (
                                    <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
                                ) : (
                                    <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
                                )}
                            </Button> */}
                            <h1 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{requiredRole} workspace</h1>
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto p-4 lg:p-8">
                        <div className="max-w-7xl mx-auto w-full">
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
