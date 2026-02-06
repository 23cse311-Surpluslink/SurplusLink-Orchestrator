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
    ChevronRight,
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
        case 'hero': return 'from-teal-400 to-emerald-600';
        case 'rookie': return 'from-emerald-800 to-emerald-950';
        default: return 'from-emerald-900 to-emerald-950';
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
            <div className="container mx-auto p-6 space-y-8 min-h-screen">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64 bg-emerald-950/50" />
                    <Skeleton className="h-4 w-96 bg-emerald-950/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl bg-emerald-950/50" />)}
                </div>
                <Skeleton className="h-[400px] rounded-xl bg-emerald-950/50" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-1 space-y-8 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                <PageHeader title="Fleet Command Center" description="Monitor real-time logistics, efficiency, and delivery compliance." />

                <Button
                    onClick={handleExportCSV}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download Logistics Log
                </Button>
            </div>

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
                <Card className="lg:col-span-2 shadow-2xl border  backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-emerald-500/10 bg-emerald-950/20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-white">Fleet Performance Matrix</CardTitle>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/40" />
                                    <Input
                                        placeholder="Search fleet..."
                                        className="pl-9 h-9 w-40"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={tierFilter} onValueChange={setTierFilter}>
                                    <SelectTrigger className="h-9 w-32 rounded-lg text-xs ">
                                        <Filter className="h-3 w-3 mr-2 text-emerald-500/40" />
                                        <SelectValue placeholder="Tier" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-emerald-950 border-emerald-900 text-emerald-100">
                                        <SelectItem value="all">All Tiers</SelectItem>
                                        <SelectItem value="rookie">Rookie</SelectItem>
                                        <SelectItem value="hero">Hero</SelectItem>
                                        <SelectItem value="champion">Champion</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-emerald-500/10">
                                        <TableHead className="font-bold text-emerald-100/70">Volunteer Identity</TableHead>
                                        <TableHead className="font-bold text-center text-emerald-100/70">Status</TableHead>
                                        <TableHead className="font-bold text-center text-emerald-100/70">Missions</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeaderboard.map((v) => (
                                        <div key={v.id} className="contents group">
                                            <TableRow
                                                className={cn(
                                                    "cursor-pointer transition-all border-emerald-500/10",
                                                    expandedRows.has(v.id) ? "bg-emerald-500/5" : "hover:bg-emerald-950/40"
                                                )}
                                                onClick={() => toggleRow(v.id)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="h-10 w-10 rounded-full bg-emerald-950 overflow-hidden border-2 border-emerald-900 shadow-xl">
                                                                {v.avatar ? (
                                                                    <img src={v.avatar} alt={v.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                                                                        {v.name[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {v.isOnline && (
                                                                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-emerald-950 bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-emerald-50">{v.name}</div>
                                                            <div className="flex items-center gap-1">
                                                                <Badge variant="secondary" className={cn(
                                                                    "text-[10px] px-1.5 py-0 h-5 font-black uppercase tracking-tight bg-gradient-to-r text-white border-none shadow-sm",
                                                                    getTierColor(v.tier)
                                                                )}>
                                                                    {v.tier}
                                                                </Badge>
                                                                <span className="text-emerald-900 mx-1">•</span>
                                                                <div className="text-emerald-500/60 group-hover:text-emerald-300 transition-colors">
                                                                    <VehicleIcon type={v.vehicleType} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset transition-all",
                                                        v.status === 'online' ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" :
                                                            v.status === 'on-delivery' ? "bg-cyan-500/10 text-cyan-400 ring-cyan-500/20" :
                                                                "bg-emerald-900/30 text-emerald-500/40 ring-emerald-900/50"
                                                    )}>
                                                        <Circle className={cn("h-1.5 w-1.5 mr-2 fill-current", v.isOnline ? "animate-pulse" : "")} />
                                                        {v.status === 'on-delivery' ? 'On Mission' : v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-emerald-50">{v.missionsCompleted}</span>
                                                        <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-tighter">
                                                            {v.missionsCompleted === 0 && v.missionsFailed === 0 ? 'Ready' : `${v.missionsFailed} Fails`}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {expandedRows.has(v.id) ? <ChevronUp className="h-4 w-4 text-emerald-700" /> : <ChevronDown className="h-4 w-4 text-emerald-700" />}
                                                </TableCell>
                                            </TableRow>
                                            {expandedRows.has(v.id) && (
                                                <TableRow className="bg-emerald-950/40  hover:bg-emerald-950/40 border-none transition-all animate-in slide-in-from-top-2 duration-300">
                                                    <TableCell colSpan={6} className="p-6 pt-0">
                                                        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-emerald-900 text-emerald-500/40">
                                                            {v.history.length > 0 ? v.history.map((h, idx) => (
                                                                <div key={idx} className="flex-shrink-0 w-40 space-y-3 p-2 rounded-xl bg-emerald-950 shadow-2xl border border-emerald-900/50">
                                                                    <div className="h-28 w-36 rounded-lg bg-emerald-950 overflow-hidden relative group/img">
                                                                        {h.photoUrl ? (
                                                                            <img src={h.photoUrl} alt="Delivery" className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                                                        ) : (
                                                                            <div className="h-full w-full flex items-center justify-center bg-emerald-950 text-emerald-900">
                                                                                <ImageIcon className="h-8 w-8 text-emerald-900" />
                                                                            </div>
                                                                        )}
                                                                        <div className={cn(
                                                                            "absolute top-2 right-2 h-2 w-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                                                                            h.status === 'completed' ? "bg-emerald-500" : "bg-rose-500"
                                                                        )} />
                                                                    </div>
                                                                    <div className="px-1">
                                                                        <div className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">{format(parseISO(h.timestamp), 'MMM dd')}</div>
                                                                        <div className="text-[10px] text-emerald-800 font-medium">{format(parseISO(h.timestamp), 'HH:mm')} • {h.status}</div>
                                                                    </div>
                                                                </div>
                                                            )) : (
                                                                <div className="text-sm text-emerald-800 italic py-4 flex items-center gap-2">
                                                                    <ImageIcon className="h-4 w-4 opacity-30" />
                                                                    No delivery history tracked yet
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </div>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-8">



                    <Card className="shadow-2xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center justify-between text-white">
                                <span>Recent Proofs</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-emerald-900">
                                    {data.recentProof.map((proof) => (
                                        <div key={proof.id} className="flex-shrink-0 w-28 group/p relative">
                                            <div className="h-28 w-28 rounded-xl bg-emerald-950 overflow-hidden border border-emerald-900 shadow-2xl relative">
                                                <img
                                                    src={proof.photoUrl}
                                                    alt="Proof"
                                                    className="h-full w-full object-cover "
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                    <p className="text-[9px] text-emerald-50 truncate font-bold">{proof.volunteerName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
