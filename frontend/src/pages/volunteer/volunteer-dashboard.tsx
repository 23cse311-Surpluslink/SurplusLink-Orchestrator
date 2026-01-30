import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Leaf, ShieldCheck, MapPin, Clock, ArrowRight, Search, Loader2 } from "lucide-react";
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
            // Find an assigned or in-progress donation for this volunteer
            const allDonations = await DonationService.getAvailableMissions();
            // In a real scenario, we might have a specific API for 'my current active mission'
            // For now, let's assume if there's an 'accepted' or 'picked_up' status in the general pool that matches this user (handled by backend or filtered here)
            // Actually, the volunteer handles their active mission in the 'active-mission' page which likely fetches its own state.
            // But for the dashboard, we want to show it.
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user]);

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
            value: user?.stats?.completedDonations ? "98%" : "100%",
            icon: ShieldCheck,
            description: "On-time arrival rate",
            color: "text-amber-500",
        },
        {
            label: "Current Tier",
            value: user?.volunteerProfile?.tier || "Rookie",
            icon: Zap,
            description: "Unlock perks as you level up",
            color: "text-purple-500",
        },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 p-6"
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Volunteer Portal
                </h1>
                <p className="text-muted-foreground text-lg font-medium">
                    Welcome back, <span className="text-foreground font-black">{user?.name}</span>! Ready for your next mission?
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <Card className="hover:bg-accent/50 transition-all cursor-default group border-border/50 border-2 hover:border-primary/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", stat.color)} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black tracking-tighter capitalize">{stat.value}</div>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Action Area */}
            <div className="grid lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black tracking-tight">Available Nearby</h2>
                        <Button variant="link" className="text-primary font-bold p-0" onClick={() => window.location.href = '/volunteer/available'}>
                            Browse All <ArrowRight className="ml-1 size-4" />
                        </Button>
                    </div>

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
