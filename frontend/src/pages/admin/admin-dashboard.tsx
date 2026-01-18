import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Truck, AlertTriangle, Building2, UserCircle, ArrowRight } from 'lucide-react';
import { metrics, adminStats } from '@/mockData/metrics';
import { Badge } from '@/components/ui/badge';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingApprovals: 0,
        activeDonors: 0,
        activeNgos: 0
    });
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: users } = await api.get('/users/admin/users');
                const pending = users.filter((u: User) => u.status === 'pending' && (u.taxId || u.documentUrl));
                const donors = users.filter((u: User) => u.role === 'donor' && u.status === 'active');
                const ngos = users.filter((u: User) => u.role === 'ngo' && u.status === 'active');

                setStats({
                    totalUsers: users.length,
                    pendingApprovals: pending.length,
                    activeDonors: donors.length,
                    activeNgos: ngos.length
                });
                setRecentUsers(users.slice(0, 5));
            } catch (error) {
                console.error('Dashboard fetch error:', error);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="space-y-8">
            <PageHeader title="Admin Dashboard" description="System overview and real-time monitoring." />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Donations Today" value={adminStats.donationsToday} icon={<FileText className="h-5 w-5" />} trend={{ value: 8, isPositive: true }} />
                <StatCard title="Active Routes" value={adminStats.activeRoutes} icon={<Truck className="h-5 w-5" />} />
                <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals}
                    icon={<AlertTriangle className={cn("h-5 w-5", stats.pendingApprovals > 0 ? "text-orange-500 animate-pulse" : "")} />}
                    trend={stats.pendingApprovals > 0 ? { value: stats.pendingApprovals, isPositive: false } : undefined}
                />
            </div>

            {stats.pendingApprovals > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-orange-900 text-sm">Quick Action Required</p>
                            <p className="text-orange-800/80 text-xs font-medium">There are {stats.pendingApprovals} new organizations waiting for identity verification.</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="hero"
                        className="bg-orange-500 hover:bg-orange-600 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest px-6"
                        onClick={() => navigate('/admin/users')}
                    >
                        Review KYC
                    </Button>
                </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 overflow-hidden border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Donations Over Time</CardTitle>
                            <p className="text-xs text-muted-foreground font-medium mt-1">rescued vs delivered trends</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={metrics.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="donations" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>Recently Joined</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium mt-1">latest profile activations</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentUsers.map(user => (
                            <div key={user.id} className="group p-3 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    {user.avatar ? <img src={user.avatar} className="h-full w-full rounded-lg object-cover" /> : <UserCircle size={20} className="text-primary" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold truncate">{user.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black flex items-center gap-1.5 min-w-0">
                                        <Building2 size={10} className="shrink-0" />
                                        <span className="truncate">{user.organization || user.role}</span>
                                    </p>
                                </div>
                                <Badge variant="secondary" className="h-5 px-1.5 text-[8px] font-black uppercase tracking-tighter shrink-0">
                                    {user.status}
                                </Badge>
                            </div>
                        ))}
                        <Button
                            variant="ghost"
                            className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary mt-2"
                            onClick={() => navigate('/admin/users')}
                        >
                            View Directory <ArrowRight size={12} className="ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
