import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
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
    id: string;
    createdAt: string;
    donorName: string;
    recipientNgo?: string;
    foodType: string;
    quantity: string;
    weightKg: number;
    status: 'Completed' | 'Pending' | 'Cancelled';
    expiryDate: string;
}

// --- Mock Data ---
const MOCK_DATA: AnalyticsRecord[] = [
    { id: '1', createdAt: '2026-02-01T10:00:00Z', donorName: 'Green Grocery', recipientNgo: 'Hunger Relief', foodType: 'Vegetables', quantity: '20 kg', weightKg: 20, status: 'Completed', expiryDate: '2026-02-03' },
    { id: '2', createdAt: '2026-02-01T14:30:00Z', donorName: 'Bake Fresh', recipientNgo: 'City Shelter', foodType: 'Bread', quantity: '15 units', weightKg: 8, status: 'Completed', expiryDate: '2026-02-02' },
    { id: '3', createdAt: '2026-02-02T09:15:00Z', donorName: 'Super Mart', recipientNgo: 'Food for All', foodType: 'Dairy', quantity: '10 Liters', weightKg: 10, status: 'Completed', expiryDate: '2026-02-04' },
    { id: '4', createdAt: '2026-02-02T16:45:00Z', donorName: 'City Cafe', foodType: 'Cooked Meal', quantity: '50 plates', weightKg: 25, status: 'Pending', expiryDate: '2026-02-02' },
    { id: '5', createdAt: '2026-02-03T11:00:00Z', donorName: 'Green Grocery', recipientNgo: 'Hunger Relief', foodType: 'Fruits', quantity: '30 kg', weightKg: 30, status: 'Completed', expiryDate: '2026-02-05' },
    { id: '6', createdAt: '2026-02-03T13:20:00Z', donorName: 'Organic Bistro', foodType: 'Salads', quantity: '20 packs', weightKg: 10, status: 'Cancelled', expiryDate: '2026-02-03' },
    { id: '7', createdAt: '2026-02-04T08:30:00Z', donorName: 'Bake Fresh', recipientNgo: 'City Shelter', foodType: 'Pastries', quantity: '5 kg', weightKg: 5, status: 'Completed', expiryDate: '2026-02-05' },
    { id: '8', createdAt: '2026-02-04T12:00:00Z', donorName: 'Mega Mart', foodType: 'Canned Goods', quantity: '100 cans', weightKg: 40, status: 'Pending', expiryDate: '2026-12-31' },
    { id: '9', createdAt: '2026-02-05T10:00:00Z', donorName: 'City Cafe', recipientNgo: 'Food for All', foodType: 'Cooked Meal', quantity: '40 plates', weightKg: 20, status: 'Completed', expiryDate: '2026-02-05' },
    { id: '10', createdAt: '2026-02-05T15:00:00Z', donorName: 'Green Grocery', foodType: 'Vegetables', quantity: '25 kg', weightKg: 25, status: 'Pending', expiryDate: '2026-02-07' },
];

const STATUS_COLORS = {
    Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

const CHART_COLORS = {
    Completed: '#10B981', // Emerald 500
    Pending: '#F59E0B',    // Amber 500
    Cancelled: '#F43F5E',  // Rose 500
};

// --- Components ---

const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <Card className="overflow-hidden border-none shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                        {trend && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {trend > 0 ? '+' : ''}{trend}%
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-400">{subtext}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                    <Icon className="h-6 w-6 text-slate-600" />
                </div>
            </div>
        </CardContent>
    </Card>
);

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
                <p className="text-sm font-bold text-slate-900 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill || entry.color }} />
                        <span className="text-slate-500">{entry.name}:</span>
                        <span className="font-bold text-slate-900">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function DonationAnalytics() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isDonor = user?.role === 'donor';

    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 7),
        to: new Date(),
    });
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const filteredData = useMemo(() => {
        return MOCK_DATA.filter(item => {
            const date = parseISO(item.createdAt);
            const inRange = isWithinInterval(date, {
                start: startOfDay(dateRange.from),
                end: endOfDay(dateRange.to)
            });
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
            return inRange && matchesStatus;
        });
    }, [dateRange, statusFilter]);

    const stats = useMemo(() => {
        const total = filteredData.length;
        const completed = filteredData.filter(d => d.status === 'Completed').length;
        const cancelled = filteredData.filter(d => d.status === 'Cancelled').length;
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
        const counts = {
            Completed: filteredData.filter(d => d.status === 'Completed').length,
            Pending: filteredData.filter(d => d.status === 'Pending').length,
            Cancelled: filteredData.filter(d => d.status === 'Cancelled').length,
        };
        return Object.entries(counts)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [filteredData]);

    const handleExport = () => {
        const headers = ["ID", "Date", "Organization", "Type", "Quantity", "Weight (kg)", "Status", "Expiry"];
        const rows = filteredData.map(d => [
            d.id,
            format(parseISO(d.createdAt), 'yyyy-MM-dd HH:mm'),
            isAdmin ? d.donorName : (d.recipientNgo || 'Unclaimed'),
            d.foodType,
            d.quantity,
            d.weightKg.toString(),
            d.status,
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
        <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1">Donation Analytics</h1>
                    <p className="text-slate-500 font-medium tracking-wide">Track and analyze food rescue impact across SurplusLink.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white p-1 rounded-xl shadow-sm border flex items-center gap-1">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0">
                                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleExport}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all active:scale-95"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl w-full" />)}
                </div>
            ) : (
                /* Summary Stats */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Donations"
                        value={stats.total}
                        trend={12.5}
                        subtext="Lifetime rescues"
                        icon={Package}
                    />
                    <StatCard
                        title="Rescue Volume"
                        value={`${stats.volume} kg`}
                        trend={8.2}
                        subtext="Total food saved"
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Fulfillment Rate"
                        value={`${stats.fulfillmentRate}%`}
                        trend={4.1}
                        subtext="Success vs Posted"
                        icon={CheckCircle2}
                    />
                </div>
            )}

            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <Card className="lg:col-span-6 border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-500" />
                            Donation Volume
                        </CardTitle>
                        <CardDescription>Daily rescue activity over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full pt-4">
                            {loading ? (
                                <Skeleton className="h-full w-full rounded-lg" />
                            ) : volumeChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={volumeChartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                                        <Bar dataKey="count" name="Donations" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No volume data available for the selected range" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            Status Distribution
                        </CardTitle>
                        <CardDescription>Breakdown by current state</CardDescription>
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
                                                innerRadius={80}
                                                outerRadius={100}
                                                paddingAngle={8}
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
                                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                                        {distributionData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[entry.name as keyof typeof CHART_COLORS] }} />
                                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-tighter">{entry.name}</span>
                                                <span className="text-xs font-bold text-slate-900 border-l pl-1.5 ml-1">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <EmptyState message="No distribution data" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Records */}
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 space-y-0">
                    <div>
                        <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-slate-400" />
                            Detailed Activity Log
                        </CardTitle>
                        <CardDescription>Real-time stream of food rescue operations</CardDescription>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search donations..."
                            className="pl-10 rounded-xl bg-slate-50 border-none h-10 ring-offset-0 focus-visible:ring-1 focus-visible:ring-slate-200"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="w-[120px] rounded-tl-3xl font-bold text-slate-600">Date</TableHead>
                                    <TableHead className="font-bold text-slate-600">
                                        {isAdmin ? "Donor Name" : "Recipient NGO"}
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-600">Food Type</TableHead>
                                    <TableHead className="font-bold text-slate-600">Quantity</TableHead>
                                    <TableHead className="font-bold text-slate-600">Status</TableHead>
                                    <TableHead className="font-bold text-slate-600">Expiry</TableHead>
                                    <TableHead className="w-[50px] rounded-tr-3xl"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <TableRow key={i} className="border-slate-50">
                                            {[1, 2, 3, 4, 5, 6, 7].map(j => (
                                                <TableCell key={j}><Skeleton className="h-6 w-full rounded" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((record) => (
                                        <TableRow key={record.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-medium text-slate-500 text-xs">
                                                {format(parseISO(record.createdAt), 'MMM dd, HH:mm')}
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-900">
                                                {isAdmin ? record.donorName : (record.recipientNgo || <span className="text-slate-300 font-normal italic">Not claimed</span>)}
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-medium">{record.foodType}</TableCell>
                                            <TableCell className="text-slate-600">{record.quantity}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[record.status]}`}>
                                                    {record.status === 'Completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                    {record.status === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
                                                    {record.status === 'Cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm">{record.expiryDate}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <EmptyState message="No activity found for the selected criteria" />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-bold text-slate-900">{filteredData.length}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg bg-slate-900 text-white border-slate-900 px-3">1</Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 px-3 hover:bg-slate-50">2</Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-slate-100 rounded-full scale-150 animate-pulse" />
                <div className="relative bg-white p-6 rounded-full shadow-lg border-slate-100 border">
                    <Search className="h-10 w-10 text-slate-300" />
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">No records found</h3>
                <p className="text-slate-500 max-w-[200px] mt-1 text-sm">{message}</p>
            </div>
        </div>
    );
}
