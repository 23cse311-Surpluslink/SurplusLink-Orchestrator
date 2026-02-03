import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Leaf, ShieldCheck, MapPin, Clock, ArrowRight, Search, Loader2, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect, useCallback } from "react";
import DonationService from "@/services/donation.service";
import { Donation } from "@/types";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function VolunteerDashboard() {
    const { user } = useAuth();
    const [activeDonation, setActiveDonation] = useState<Donation | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchActiveMission = useCallback(async () => {
        try {
            const active = await DonationService.getActiveMission();
            setActiveDonation(active);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActiveMission();
    }, [fetchActiveMission]);

    const stats = [
        {
            label: "Jobs Completed",
            value: user?.stats?.completedDonations || 0,
            icon: Truck,
            description: "Total Successful Rescues",
            color: "text-blue-500",
        },
        {
            label: "CO2 Saved",
            value: `${user?.stats?.co2Saved?.toFixed(1) || "0.0"}kg`,
            icon: Leaf,
            description: "Total Environmental Impact",
            color: "text-emerald-500",
        },
        {
            label: "Reliability",
            value: (function () {
                const completed = user?.stats?.completedDonations || 0;
                const cancelled = user?.stats?.cancelledDonations || 0;
                const total = completed + cancelled;
                if (total === 0) return "100%";
                return `${Math.round((completed / total) * 100)}%`;
            })(),
            icon: ShieldCheck,
            description: "Rescue completion rate",
            color: "text-amber-500",
        },
        {
            label: "Current Tier",
            value: user?.volunteerProfile?.tier || "Rookie",
            icon: Zap,
            description: (function () {
                const count = user?.stats?.completedDonations || 0;
                if (count < 10) return `${10 - count} more to 'Hero'`;
                if (count < 50) return `${50 - count} more to 'Champion'`;
                return "Elite 'Champion' Status";
            })(),
            color: "text-purple-500",
        },
    ];

    const getTierProgress = () => {
        const count = user?.stats?.completedDonations || 0;
        if (count < 10) return (count / 10) * 100;
        if (count < 50) return ((count - 10) / 40) * 100;
        return 100;
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 p-6"
        >
            <div className="flex flex-col gap-2 relative">
                <div className="absolute -left-4 top-0 w-1 bg-primary h-full rounded-full" />
                <h1 className="text-4xl font-black tracking-tight lg:text-6xl text-foreground">
                    Volunteer <span className="text-primary italic">Portal</span>
                </h1>
                <p className="text-muted-foreground text-lg font-medium max-w-2xl">
                    Welcome back, <span className="text-foreground font-black underline decoration-primary/30 underline-offset-4">{user?.name}</span>! Ready for your next rescue mission?
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <Card className="relative overflow-hidden hover:bg-accent/50 transition-all cursor-default group border-border/50 border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-primary/5">
                            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-150 group-hover:opacity-10 bg-current", stat.color.replace('text-', 'bg-'))} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <div className={cn("p-2 rounded-xl bg-accent/50", stat.color)}>
                                    <stat.icon className="h-4 w-4 transition-transform group-hover:rotate-12" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black tracking-tighter capitalize mb-1">{stat.value}</div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <span className={cn("size-1.5 rounded-full animate-pulse", stat.color.replace('text-', 'bg-'))} />
                                    {stat.description}
                                </p>
                                {stat.label === "Current Tier" && (
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                            <span>Progress</span>
                                            <span className="text-primary">{Math.round(getTierProgress())}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${getTierProgress()}%` }}
                                                className="h-full bg-gradient-to-r from-purple-500 to-primary rounded-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Action Area */}
            <div className="grid lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black tracking-tight">
                            {activeDonation ? "Active Mission" : "Available Nearby"}
                        </h2>
                        {!activeDonation && (
                            <Button variant="link" className="text-primary font-bold p-0" onClick={() => window.location.href = '/volunteer/available'}>
                                Browse All <ArrowRight className="ml-1 size-4" />
                            </Button>
                        )}
                    </div>

                    {activeDonation ? (
                        <Card className="relative overflow-hidden border-2 border-primary shadow-glow shadow-primary/10 bg-card group cursor-pointer" onClick={() => window.location.href = '/volunteer/active'}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Navigation className="size-24 text-primary animate-pulse" />
                            </div>
                            <CardContent className="p-0 flex flex-col md:flex-row h-full items-stretch">
                                <div className="w-full md:w-64 h-48 md:h-auto bg-muted shrink-0 relative">
                                    <img src={activeDonation.image} alt={activeDonation.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:hidden">
                                        <Badge className="bg-primary text-white border-none uppercase tracking-widest font-black text-[10px]">Active Now</Badge>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="hidden md:flex items-center gap-2 mb-2">
                                            <Badge className="bg-primary text-white border-none uppercase tracking-widest font-black text-[10px]">Active Now</Badge>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{activeDonation.id.slice(0, 8)}</span>
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight mb-1">{activeDonation.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium mb-4">
                                            <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-primary" /> {activeDonation.address}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 h-full">
                                            <div className="p-3 rounded-xl bg-accent/50 border border-border/50">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Status</p>
                                                <p className="text-xs font-bold text-primary capitalize">{activeDonation.deliveryStatus?.replace('_', ' ')}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-accent/50 border border-border/50">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Destination</p>
                                                <p className="text-xs font-bold truncate">{activeDonation.ngoAddress || activeDonation.ngoName || "NGO Center"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button className="mt-6 w-full h-12 rounded-xl font-black text-lg group-hover:bg-primary/90 transition-colors">
                                        Continue Mission <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-glow p-12 text-center group cursor-pointer" onClick={() => window.location.href = '/volunteer/available'}>
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Search className="size-32 text-primary" />
                            </div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Search className="size-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-black mb-2">Find Your Next Mission</h3>
                                <p className="text-muted-foreground font-medium max-w-sm mx-auto mb-8">
                                    There are local donors waiting for volunteers to rescue food and deliver it to nearby NGOs.
                                </p>
                                <Button className="rounded-full px-8 h-12 font-black text-lg shadow-xl shadow-primary/20" variant="hero">
                                    Start Browsing Missions
                                </Button>
                            </div>
                        </Card>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="text-2xl font-black tracking-tight">Impact History</h2>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Recent Impact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Leaf className="size-5 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Sustainability Milestone</p>
                                    <p className="text-xs text-muted-foreground font-medium">You've offset {user?.stats?.co2Saved?.toFixed(1) || "0"}kg of emissions.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Truck className="size-5 text-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Reliable Partner</p>
                                    <p className="text-xs text-muted-foreground font-medium">98% success rate in food handling.</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full font-bold h-11 border-primary/20 hover:bg-primary/5" onClick={() => window.location.href = '/volunteer/history'}>
                                View Impact Ledger
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
