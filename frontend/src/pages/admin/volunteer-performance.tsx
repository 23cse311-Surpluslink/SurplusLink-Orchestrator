import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    Legend
} from 'recharts';
import {
    Search,
    Download,
    Filter,
    Users,
    Clock,
    CheckCircle,
    TrendingUp,
    Bike,
    Car,
    Truck,
    Zap,
    Camera,
    ChevronDown,
    ChevronUp,
    Award,
    Circle,
    Calendar,
    Image as ImageIcon
} from 'lucide-react';
import reportService from '@/services/report.service';
import { VolunteerPerformanceReport } from '@/types';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Helper for ETA formatting
const formatEta = (seconds: number) => {
    if (seconds === 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Vehicle icon component
const VehicleIcon = ({ type }: { type: string }) => {
    switch (type.toLowerCase()) {
        case 'bicycle': return <Bike className="h-4 w-4" />;
        case 'car': return <Car className="h-4 w-4" />;
        case 'scooter': return <Zap className="h-4 w-4" />;
        case 'van':
        case 'truck': return <Truck className="h-4 w-4" />;
        default: return <Users className="h-4 w-4" />;
    }
};

// Tier color helper
const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
        case 'champion': return 'from-amber-400 to-yellow-600';
        case 'hero': return 'from-blue-400 to-indigo-600';
        case 'rookie': return 'from-slate-400 to-slate-600';
        default: return 'from-slate-400 to-slate-600';
    }
};

export default function VolunteerPerformance() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<VolunteerPerformanceReport | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState('all');
    const [vehicleFilter, setVehicleFilter] = useState('all');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await reportService.getVolunteerPerformance();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch volunteer performance data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const filteredLeaderboard = useMemo(() => {
        if (!data) return [];
        return data.leaderboard.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTier = tierFilter === 'all' || v.tier.toLowerCase() === tierFilter.toLowerCase();
            const matchesVehicle = vehicleFilter === 'all' || v.vehicleType.toLowerCase() === vehicleFilter.toLowerCase();
            return matchesSearch && matchesTier && matchesVehicle;
        });
    }, [data, searchQuery, tierFilter, vehicleFilter]);

    const handleExportCSV = () => {
        if (!data) return;
        const headers = ["Volunteer Name", "Tier", "Missions Completed", "Missions Failed", "Avg ETA (s)", "Compliance Status", "Vehicle"];
        const rows = data.leaderboard.map(v => [
            v.name,
            v.tier,
            v.missionsCompleted,
            v.missionsFailed,
            v.avgEta,
            v.hasProofCompliance ? "Compliant" : "Missing Proof",
            v.vehicleType
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `volunteer_logistics_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading || !data) {
        return (
            <div className="container mx-auto p-6 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-[400px] rounded-xl" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1">Volunteer Performance</h1>
                    <p className="text-slate-500 font-medium">Monitor fleet efficiency, logistics proof, and delivery timings.</p>
                </div>
                <Button onClick={handleExportCSV} className="rounded-xl shadow-lg transition-all hover:scale-105">
                    <Download className="h-4 w-4 mr-2" />
                    Download Logistics Log
                </Button>
            </div>

            {/* A. Network Logistics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Fleet Delivery Rate"
                    value={`${data.overview.fleetDeliveryRate}%`}
                    icon={<TrendingUp className="h-6 w-6" />}
                    description="Assigned vs Delivered"
                />
                <StatCard
                    title="Avg. Response Time"
                    value={`${data.overview.avgResponseTime}m`}
                    icon={<Clock className="h-6 w-6" />}
                    description="Acceptance to Pickup"
                />
                <StatCard
                    title="Compliance Score"
                    value={`${data.overview.complianceScore}%`}
                    icon={<CheckCircle className="h-6 w-6" />}
                    description="Valid Photo Proofs"
                />
                <StatCard
                    title="Active Heroes"
                    value={data.overview.activeHeroes}
                    icon={<Users className="h-6 w-6" />}
                    description="Online or On-Route"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* B. The "Fleet Leaderboard" */}
                <Card className="lg:col-span-2 shadow-sm border-none bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold">Fleet Leaderboard</CardTitle>
                                <CardDescription>Real-time volunteer activity and performance</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search name..."
                                        className="pl-9 h-9 w-40 rounded-lg"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={tierFilter} onValueChange={setTierFilter}>
                                    <SelectTrigger className="h-9 w-32 rounded-lg text-xs">
                                        <Filter className="h-3 w-3 mr-2" />
                                        <SelectValue placeholder="Tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tiers</SelectItem>
                                        <SelectItem value="rookie">Rookie</SelectItem>
                                        <SelectItem value="hero">Hero</SelectItem>
                                        <SelectItem value="champion">Champion</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                                    <SelectTrigger className="h-9 w-32 rounded-lg text-xs">
                                        <Car className="h-3 w-3 mr-2" />
                                        <SelectValue placeholder="Vehicle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Vehicles</SelectItem>
                                        <SelectItem value="bicycle">Bicycle</SelectItem>
                                        <SelectItem value="scooter">Scooter</SelectItem>
                                        <SelectItem value="car">Car</SelectItem>
                                        <SelectItem value="van">Van</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="font-bold">Volunteer Identity</TableHead>
                                        <TableHead className="font-bold text-center">Status</TableHead>
                                        <TableHead className="font-bold text-center">Missions</TableHead>
                                        <TableHead className="font-bold text-center">Avg. ETA</TableHead>
                                        <TableHead className="font-bold text-center">Proof</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeaderboard.map((v) => (
                                        <>
                                            <TableRow
                                                key={v.id}
                                                className={cn(
                                                    "cursor-pointer transition-colors group",
                                                    expandedRows.has(v.id) ? "bg-slate-50/80" : "hover:bg-slate-50/50"
                                                )}
                                                onClick={() => toggleRow(v.id)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                                                {v.avatar ? (
                                                                    <img src={v.avatar} alt={v.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-bold">
                                                                        {v.name[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {v.isOnline && (
                                                                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-green-500 ring-2 ring-green-100 animate-pulse" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{v.name}</div>
                                                            <div className="flex items-center gap-1">
                                                                <Badge variant="secondary" className={cn(
                                                                    "text-[10px] px-1.5 py-0 h-5 font-black uppercase tracking-tight bg-gradient-to-r text-white border-none",
                                                                    getTierColor(v.tier)
                                                                )}>
                                                                    {v.tier}
                                                                </Badge>
                                                                <span className="text-slate-400 mx-1">•</span>
                                                                <VehicleIcon type={v.vehicleType} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                                                        v.status === 'online' ? "bg-green-50 text-green-700 ring-green-600/20" :
                                                            v.status === 'on-delivery' ? "bg-blue-50 text-blue-700 ring-blue-600/20" :
                                                                "bg-slate-50 text-slate-700 ring-slate-600/20"
                                                    )}>
                                                        <Circle className={cn("h-2 w-2 mr-1.5 fill-current", v.isOnline ? "animate-pulse" : "")} />
                                                        {v.status === 'on-delivery' ? 'On Delivery' : v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{v.missionsCompleted}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {v.missionsCompleted === 0 && v.missionsFailed === 0 ? 'Ready for Dispatch' : `${v.missionsFailed} Fails`}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-mono font-medium text-slate-600">
                                                    {formatEta(v.avgEta)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {v.hasProofCompliance ? (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">✅ Compliant</Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50">⚠️ Missing</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {expandedRows.has(v.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </TableCell>
                                            </TableRow>
                                            {expandedRows.has(v.id) && (
                                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                                                    <TableCell colSpan={6} className="p-4 pt-0">
                                                        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                                            {v.history.length > 0 ? v.history.map((h, idx) => (
                                                                <div key={idx} className="flex-shrink-0 w-32 space-y-2">
                                                                    <div className="h-24 w-32 rounded-lg bg-slate-200 overflow-hidden relative group">
                                                                        {h.photoUrl ? (
                                                                            <img src={h.photoUrl} alt="Delivery" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                                                        ) : (
                                                                            <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-300">
                                                                                <ImageIcon className="h-8 w-8 text-slate-300" />
                                                                            </div>
                                                                        )}
                                                                        <div className={cn(
                                                                            "absolute top-1 right-1 h-2 w-2 rounded-full",
                                                                            h.status === 'completed' ? "bg-emerald-500" : "bg-rose-500"
                                                                        )} />
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-500 font-medium">{format(parseISO(h.timestamp), 'MMM dd, HH:mm')}</div>
                                                                </div>
                                                            )) : (
                                                                <div className="text-sm text-slate-400 italic py-2">No delivery history found</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-8">
                    {/* C. Logistics Efficiency Chart */}
                    <Card className="shadow-sm border-none bg-white rounded-2xl overflow-hidden h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold">Logistics Efficiency</CardTitle>
                            <CardDescription>Avg. time per delivery by Tier</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.efficiencyByTier} layout="vertical" margin={{ left: 10, right: 20 }}>
                                        <defs>
                                            <linearGradient id="gradChampion" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#d97706" stopOpacity={1} />
                                            </linearGradient>
                                            <linearGradient id="gradHero" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={1} />
                                            </linearGradient>
                                            <linearGradient id="gradRookie" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#475569" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="tier"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                                            width={80}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white p-2 shadow-xl border border-slate-100 rounded-lg text-xs font-bold">
                                                            {payload[0].value} mins
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="avgTime" radius={[0, 4, 4, 0]} barSize={24}>
                                            {data.efficiencyByTier.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.tier.toLowerCase() === 'champion' ? 'url(#gradChampion)' :
                                                            entry.tier.toLowerCase() === 'hero' ? 'url(#gradHero)' :
                                                                'url(#gradRookie)'
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    Top Tier Insight
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Champions are <span className="text-emerald-600 font-bold">24% faster</span> than rookies on average.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* D. Delivery Proof Audit */}
                    <Card className="shadow-sm border-none bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center justify-between">
                                <span>Proof Audit</span>
                                <Camera className="h-4 w-4 text-slate-400" />
                            </CardTitle>
                            <CardDescription>Recent delivery verifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {data.recentProof.map((proof) => (
                                        <div key={proof.id} className="flex-shrink-0 w-24 group">
                                            <div className="h-24 w-24 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 shadow-sm relative">
                                                <img
                                                    src={proof.photoUrl}
                                                    alt="Proof"
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1">
                                                    <p className="text-[8px] text-white truncate font-medium">{proof.volunteerName}</p>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-slate-400 mt-1 font-mono">
                                                {format(parseISO(proof.timestamp), 'HH:mm')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full text-xs font-bold text-slate-500 hover:text-indigo-600 h-8">
                                    View Full Audit Log
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
