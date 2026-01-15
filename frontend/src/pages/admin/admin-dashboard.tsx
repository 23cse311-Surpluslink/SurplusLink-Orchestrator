
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Truck, AlertTriangle } from 'lucide-react';
import { metrics, adminStats, liveRoutes } from '@/mockData/metrics';
import { users } from '@/mockData/users';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <PageHeader title="Admin Dashboard" description="System overview and real-time monitoring." />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Donations Today" value={adminStats.donationsToday} icon={<FileText className="h-5 w-5" />} trend={{ value: 8, isPositive: true }} />
                <StatCard title="Active Routes" value={adminStats.activeRoutes} icon={<Truck className="h-5 w-5" />} />
                <StatCard title="Total Users" value={users.length} icon={<Users className="h-5 w-5" />} />
                <StatCard title="Pending Approvals" value={adminStats.pendingApprovals} icon={<AlertTriangle className="h-5 w-5" />} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Donations Over Time</CardTitle></CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={metrics.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="donations" stroke="hsl(var(--primary))" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Live Routes</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {liveRoutes.map(route => (
                            <div key={route.id} className="p-3 rounded-lg border border-border">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-sm">{route.from} → {route.to}</p>
                                        <p className="text-xs text-muted-foreground">Volunteer: {route.volunteer}</p>
                                    </div>
                                    <Badge variant={route.status === 'delivered' ? 'default' : 'secondary'}>{route.status}</Badge>
                                </div>
                                <Progress value={route.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">ETA: {route.eta}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>KPI Overview</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div><p className="text-sm text-muted-foreground">Food Rescue Rate</p><p className="text-2xl font-bold text-primary">{adminStats.kpis.foodRescueRate}%</p></div>
                        <div><p className="text-sm text-muted-foreground">Avg. Delivery Time</p><p className="text-2xl font-bold">{adminStats.kpis.avgDeliveryTime} min</p></div>
                        <div><p className="text-sm text-muted-foreground">NGO Engagement</p><p className="text-2xl font-bold text-success">{adminStats.kpis.ngoEngagement}%</p></div>
                        <div><p className="text-sm text-muted-foreground">Donor Retention</p><p className="text-2xl font-bold">{adminStats.kpis.donorRetention}%</p></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
