import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/common/stat-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    RefreshCw, FileDown, AlertTriangle, TrendingUp, Package, Leaf, Users, ShieldAlert, CheckCircle2
} from 'lucide-react';
import ReportService from '@/services/report.service';
import { useToast } from '@/hooks/use-toast';
import { UtilizationRecord } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const REJECTION_COLORS = {
    'Safety Concerns': '#ef4444', // Red
    'Logistics': '#f59e0b',       // Amber
    'Other': '#6366f1'           // Indigo
};

const CHART_COLORS = ['#ef4444', '#f59e0b', '#6366f1', '#10b981', '#3b82f6', '#f472b6'];

export default function NgoImpactReport() {
    const [data, setData] = useState<UtilizationRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { toast } = useToast();

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const report = await ReportService.getNgoUtilization();
            setData(report);
            if (isRefresh) {
                toast({ title: "Updated", description: "Dashboard data refreshed successfully" });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load utilization report",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();

        // 30-second polling for real-time monitoring
        const interval = setInterval(() => {
            fetchData(true);
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchData]);

    const exportToCSV = () => {
        if (!data) return;

        const headers = ["Date", "Units (kg)", "Capacity (kg)"];
        const rows = data.dailyUtilization.map(u => [u.date, u.units, u.capacity]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `ngo_utilization_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const successRate = data ? (data.summary.totalClaims > 0 ? (data.summary.completed / data.summary.totalClaims) * 100 : 0) : 0;
    const totalWastePrevention = data?.dailyUtilization.reduce((acc, curr) => acc + curr.units, 0) || 0;
    const utilizationRate = data?.summary.utilizationRate || 0;

    if (loading && !data) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-64" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        );
    }

    if (!data || (data.summary.totalClaims === 0 && data.dailyUtilization.length === 0)) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center space-y-4 text-center">
                <div className="bg-muted p-6 rounded-full">
                    <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">No Missions Handled Yet</h2>
                <p className="text-muted-foreground max-w-sm">
                    Start claiming and completing donations to see your impact and utilization metrics here.
                </p>
                <Button onClick={() => window.location.href = '/ngo/nearby'}>
                    View Nearby Donations
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <PageHeader
                    title="NGO Impact Analytics"
                    description="Real-time distribution efficiency and capacity monitoring."
                />
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="default" size="sm" onClick={exportToCSV}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {utilizationRate > 90 && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-pulse">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Capacity Alarm</AlertTitle>
                    <AlertDescription>
                        Organization is currently at {utilizationRate}% capacity. Consider re-routing new claims or increasing temporary storage.
                    </AlertDescription>
                </Alert>
            )}

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Success Rate"
                    value={`${successRate.toFixed(1)}%`}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    description="Claimed vs. Delivered"
                />
                <StatCard
                    title="Total Rescues"
                    value={data.summary.totalClaims}
                    icon={<Package className="h-5 w-5" />}
                    description="Total claims handled"
                />
                <StatCard
                    title="Waste Prevention"
                    value={`${totalWastePrevention.toFixed(1)} kg`}
                    icon={<Leaf className="h-5 w-5 text-emerald-500" />}
                    description="Total weight handled"
                />
                <Card className="relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Capacity Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold">{utilizationRate}%</div>
                            <Badge variant={utilizationRate > 80 ? "destructive" : utilizationRate > 50 ? "warning" : "success"}>
                                {utilizationRate > 80 ? "Near Limit" : utilizationRate > 50 ? "Optimal" : "Healthy"}
                            </Badge>
                        </div>
                        <div className="mt-4 w-full bg-muted rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${utilizationRate > 90 ? 'bg-red-500' : utilizationRate > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rejection Analysis */}
                <Card className="shadow-premium">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Rejection Analysis
                        </CardTitle>
                        <CardDescription>Primary reasons for rejected donation claims</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {data.rejectionBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.rejectionBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="reason"
                                    >
                                        {data.rejectionBreakdown.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={REJECTION_COLORS[entry.reason as keyof typeof REJECTION_COLORS] || CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No rejections recorded.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Daily Throughput */}
                <Card className="shadow-premium">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Daily Throughput
                        </CardTitle>
                        <CardDescription>7-day trend of food distribution volume</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.dailyUtilization}>
                                <defs>
                                    <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888888', fontSize: 12 }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="units"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUnits)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="capacity"
                                    stroke="#cbd5e1"
                                    strokeDasharray="5 5"
                                    fill="none"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
