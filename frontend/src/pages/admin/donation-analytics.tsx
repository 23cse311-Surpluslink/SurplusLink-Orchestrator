import { useState, useMemo, useEffect } from 'react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    TooltipProps
} from 'recharts';
import {
    Download,
    TrendingUp,
    Package,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

// --- Types ---
interface AnalyticsRecord {
    donationId: string;
    createdAt: string;
    donorName: string;
    donorOrg?: string;
    recipientNgo?: string;
    foodType: string;
    quantity: string;
    weightKg: number;
    status: string;
    expiryDate: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    completed: { label: 'Completed', color: 'bg-primary/10 text-primary border-primary/20' },
    active: { label: 'Active', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
    assigned: { label: 'Assigned', color: 'bg-primary/10 text-primary border-primary/20' },
    picked_up: { label: 'In Transit', color: 'bg-info/10 text-info border-info/20' },
    cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    expired: { label: 'Expired', color: 'bg-muted text-muted-foreground border-border' },
    rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const CHART_COLORS: Record<string, string> = {
    completed: '#10B981',
    active: '#14B8A6',
    assigned: '#059669',
    picked_up: '#06B6D4',
    cancelled: '#F43F5E',
    rejected: '#EF4444',
    expired: '#64748B'
};

// --- Components ---


const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/95 backdrop-blur-md p-4 border border-border/50 shadow-2xl rounded-2xl">
                <p className="text-xs font-black text-foreground mb-3 uppercase tracking-widest border-b border-border/50 pb-2">{label}</p>
                {payload.map((entry, index: number) => (
                    <div key={index} className="flex items-center gap-3 text-xs mb-1 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload?.fill }} />
                        <span className="text-muted-foreground font-bold">{entry.name}:</span>
                        <span className="font-extrabold text-foreground ml-auto">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface RawReportItem {
    donationId: string;
    createdAt: string;
    donorName: string;
    donorOrg?: string;
    recipientNgo?: string;
    foodType: string;
    quantity: string;
    status: string;
    expiryDate: string;
}

export default function DonationAnalytics() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<AnalyticsRecord[]>([]);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const response = await api.get('/reports/donations');

                // Helper to estimate weight from quantity string (e.g., "10kg" -> 10)
                const decorated = response.data.map((item: RawReportItem): AnalyticsRecord => {
                    const quantityLower = String(item.quantity).toLowerCase();
                    const weightMatch = quantityLower.match(/(\d+(\.\d+)?)/);
                    const weight = weightMatch ? parseFloat(weightMatch[0]) : 1; // Fallback to 1
                    return { ...item, weightKg: weight };
                });

                setReports(decorated);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filteredData = useMemo(() => {
        return reports.filter(item => {
            const date = parseISO(item.createdAt);
            const inRange = isWithinInterval(date, {
                start: startOfDay(dateRange.from),
                end: endOfDay(dateRange.to)
            });
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
            return inRange && matchesStatus;
        });
    }, [reports, dateRange, statusFilter]);

    const stats = useMemo(() => {
        const total = filteredData.length;
        const completed = filteredData.filter(d => d.status === 'completed').length;
        const cancelled = filteredData.filter(d => d.status === 'cancelled').length;
        const volume = filteredData.reduce((acc, curr) => acc + curr.weightKg, 0);
        const fulfillmentRate = total > 0 ? Math.round(((completed) / (total - cancelled || 1)) * 100) : 0;

        return { total, volume, fulfillmentRate };
    }, [filteredData]);

    const volumeChartData = useMemo(() => {
        const dailyMap: Record<string, number> = {};
        filteredData.forEach(item => {
            const day = format(parseISO(item.createdAt), 'MMM dd');
            dailyMap[day] = (dailyMap[day] || 0) + 1;
        });
        return Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
    }, [filteredData]);

    const distributionData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredData.forEach(d => {
            counts[d.status] = (counts[d.status] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }));
    }, [filteredData]);

    const handleExport = () => {
        const headers = ["ID", "Date", "Organization", "Type", "Quantity", "Weight (kg)", "Status", "Expiry"];
        const rows = filteredData.map(d => [
            d.donationId,
            format(parseISO(d.createdAt), 'yyyy-MM-dd HH:mm'),
            isAdmin ? (d.donorOrg || d.donorName) : (d.recipientNgo || 'Unclaimed'),
            d.foodType,
            d.quantity,
            d.weightKg.toString(),
            STATUS_MAP[d.status]?.label || d.status,
            d.expiryDate
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `donation_report_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-[1400px] mx-auto  space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <PageHeader title="Impact Analytics" description="Monitoring sustainability and rescue efficiency across the network." />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl w-full" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Rescue Missions"
                        value={stats.total}
                        trend={12.5}
                        subtext="Cumulative donations tracked"
                        icon={Package}
                    />
                    <StatCard
                        title="Mass Recovered"
                        value={`${stats.volume} kg`}
                        trend={8.2}
                        subtext="Total food diverted from waste"
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Rescue Success"
                        value={`${stats.fulfillmentRate}%`}
                        trend={4.1}
                        subtext="Completed vs Postings"
                        icon={CheckCircle2}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <Card className="lg:col-span-6 border-border/50 shadow-sm rounded-2xl bg-card overflow-hidden">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-foreground">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Rescue Velocity
                        </CardTitle>
                        <CardDescription className="font-medium text-muted-foreground">Daily volunteer activity stream</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full pt-6">
                            {loading ? (
                                <Skeleton className="h-full w-full rounded-lg" />
                            ) : volumeChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={volumeChartData}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.05)', radius: 8 }} />
                                        <Bar dataKey="count" name="Rescues" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={45} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No rescue data for the selected period" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4 border-border/50 shadow-sm rounded-2xl bg-card overflow-hidden">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-foreground">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Stream Composition
                        </CardTitle>
                        <CardDescription className="font-medium text-muted-foreground">Distribution by rescue state</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full flex flex-col items-center justify-center">
                            {loading ? (
                                <Skeleton className="h-48 w-48 rounded-full" />
                            ) : distributionData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <PieChart>
                                            <Pie
                                                data={distributionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={75}
                                                outerRadius={100}
                                                paddingAngle={6}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {distributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4">
                                        {distributionData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[entry.name] || '#94A3B8' }} />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{STATUS_MAP[entry.name]?.label || entry.name}</span>
                                                <span className="text-xs font-extrabold text-foreground">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <EmptyState message="No flow data available" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 animate-pulse" />
                <div className="relative bg-card p-6 rounded-full shadow-lg border-border border">
                    <Search className="h-10 w-10 text-muted-foreground/40" />
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-foreground">No records found</h3>
                <p className="text-muted-foreground max-w-[200px] mt-1 text-sm">{message}</p>
            </div>
        </div>
    );
}
