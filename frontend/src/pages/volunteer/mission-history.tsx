import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Trophy,
    Leaf,
    Calendar,
    ChevronRight,
    Star,
    MessageCircle,
    Clock,
    CheckCircle2,
    Lock,
    Medal,
    Box,
    Timer,
    XCircle,
    Loader2,
    Image as ImageIcon
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import DonationService from "@/services/donation.service";
import { Donation } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { format } from "date-fns";

const ACHIEVEMENTS = [
    { id: 1, name: "First Rescue", icon: Medal, unlocked: true },
    { id: 2, name: "Night Owl", icon: Clock, unlocked: true, description: "Delivered after 8 PM" },
    { id: 3, name: "Heavy Lifter", icon: Box, unlocked: true, description: "Single mission > 25kg" },
    { id: 4, name: "Punctuality King", icon: Timer, unlocked: false, description: "10 missions under ETA" },
    { id: 5, name: "Eco Warrior", icon: Leaf, unlocked: false, description: "Save 100kg of CO2" },
    { id: 6, name: "Master Hero", icon: Trophy, unlocked: false, description: "Reach Champion Tier" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function MissionHistory() {
    const { user } = useAuth();
    const [missions, setMissions] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMission, setSelectedMission] = useState<Donation | null>(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await DonationService.getVolunteerHistory();
            setMissions(data);
        } catch (error) {
            console.error("Failed to fetch mission history", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const stats = {
        total: user?.stats?.completedDonations || 0,
        weight: missions.reduce((acc, m) => acc + (parseFloat(m.quantity) || 0), 0).toFixed(1),
        co2: user?.stats?.co2Saved?.toFixed(1) || "0.0",
        reliability: user?.stats?.completedDonations ? "98%" : "100%"
    };

    return (
        <div className="space-y-10 pb-10">
            {/* Impact Hall of Fame */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-primary/5 border border-primary/20 p-8 md:p-12 shadow-glow shadow-primary/5">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Trophy className="size-64 text-primary" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <Badge className="bg-primary/20 text-primary uppercase text-xs font-black tracking-[0.2em] px-4 py-1.5 border-none">
                            Volunteer Legacy
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Your Impact</h1>
                        <p className="text-lg text-muted-foreground font-medium max-w-md">
                            Every delivery is a step toward a zero-waste future. See the data behind your dedication.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                            <div className="flex items-center gap-2 text-sm font-bold bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
                                <Calendar className="size-4 text-primary" />
                                Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-[400px]">
                        <Card className="bg-background/40 backdrop-blur-md border-border/50">
                            <CardContent className="p-6">
                                <p className="text-3xl font-black">{stats.total}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Missions Done</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/40 backdrop-blur-md border-border/50">
                            <CardContent className="p-6">
                                <p className="text-3xl font-black text-emerald-500">{stats.weight}<span className="text-sm">kg</span></p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weight Saved</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/40 backdrop-blur-md border-border/50">
                            <CardContent className="p-6">
                                <p className="text-3xl font-black text-blue-500">{stats.co2}<span className="text-sm">kg</span></p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CO2 Offset</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/40 backdrop-blur-md border-border/50">
                            <CardContent className="p-6">
                                <p className="text-3xl font-black text-amber-500">{stats.reliability}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reliability</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Historical Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black tracking-tight">Mission History</h2>
                        {loading && <Loader2 className="animate-spin size-5 text-primary" />}
                    </div>

                    {missions.length === 0 && !loading ? (
                        <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
                            <p className="text-muted-foreground font-medium">No completed missions yet. Start your journey!</p>
                            <Button variant="link" className="text-primary font-bold mt-2" onClick={() => window.location.href = '/volunteer/available'}>
                                Browse Available Missions
                            </Button>
                        </div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                            {missions.map((m) => (
                                <motion.div key={m.id} variants={itemVariants}>
                                    <Card
                                        className="group hover:border-primary/40 transition-all cursor-pointer bg-card/60 overflow-hidden"
                                        onClick={() => setSelectedMission(m)}
                                    >
                                        <CardContent className="p-0">
                                            <div className="flex items-stretch overflow-hidden">
                                                <div className="w-2 bg-primary group-hover:w-3 transition-all shrink-0" />
                                                <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                                                {format(new Date(m.createdAt), 'MMM d, yyyy')}
                                                            </span>
                                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black tracking-widest uppercase">
                                                                {m.status}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="text-lg md:text-xl font-black">{m.ngoName || "Unknown NGO"}</h3>
                                                        <p className="text-sm text-muted-foreground font-medium truncate max-w-md">
                                                            {m.address} ⮕ {m.ngoAddress || "NGO Hub"}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col md:items-end gap-2">
                                                        <div className="flex items-center gap-4 text-sm font-bold">
                                                            <span className="flex items-center gap-1"><Box className="size-3.5" /> {m.quantity}</span>
                                                            <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Sidebar Achievements */}
                <div className="space-y-8">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black uppercase tracking-widest text-primary">Status</span>
                                <Badge className="bg-primary text-white capitalize">{user?.volunteerProfile?.tier || 'Rookie'}</Badge>
                            </div>
                            <CardTitle className="text-xl font-black">Impact Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Progress value={Math.min((stats.total / 50) * 100, 100)} className="h-3 bg-primary/10 shadow-inner" />
                            <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-xs font-bold space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-emerald-500" />
                                    {stats.total < 50 ? `${50 - stats.total} more missions for Next Badge` : "Legendary Status Reached"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-black">Achievement Gallery</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest">
                                {ACHIEVEMENTS.filter(a => a.unlocked).length} / {ACHIEVEMENTS.length} Unlocked
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                {ACHIEVEMENTS.map((badge) => (
                                    <div key={badge.id} className="group relative flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "size-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                                            badge.unlocked
                                                ? "bg-primary/10 text-primary border-2 border-primary/30"
                                                : "bg-muted text-muted-foreground/30 border-2 border-dashed border-border grayscale"
                                        )}>
                                            {badge.unlocked ? <badge.icon className="size-8" /> : <Lock className="size-8" />}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase text-center",
                                            badge.unlocked ? "text-foreground" : "text-muted-foreground/50"
                                        )}>
                                            {badge.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Mission Detail Sheet */}
            <Sheet open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
                <SheetContent side="right" className="w-full sm:max-w-2xl p-0 border-l-0 bg-card overflow-hidden flex flex-col">
                    {selectedMission && (
                        <>
                            <header className="p-8 pb-4 border-b border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="font-mono text-primary border-primary/30 uppercase tracking-widest">
                                        #{selectedMission.id.substring(0, 8)}
                                    </Badge>
                                    <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                        <Calendar className="size-4" /> {format(new Date(selectedMission.createdAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <SheetTitle className="text-3xl font-black tracking-tighter leading-tight">
                                    {selectedMission.title}
                                </SheetTitle>
                            </header>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Mass Saved</p>
                                        <p className="text-lg font-black">{selectedMission.quantity}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Category</p>
                                        <p className="text-lg font-black uppercase tracking-tighter">{selectedMission.foodCategory || "Rescue"}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Route Details</h4>
                                    <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-secondary-foreground mb-1">Pickup Point</p>
                                            <p className="font-bold">{selectedMission.address}</p>
                                            <p className="text-xs text-muted-foreground">{selectedMission.donorName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-primary mb-1">Dropoff Point</p>
                                            <p className="font-bold">{selectedMission.ngoAddress || "NGO Distribution Hub"}</p>
                                            <p className="text-xs text-muted-foreground">{selectedMission.ngoName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Proof Gallery */}
                                {(selectedMission.pickupPhoto || selectedMission.deliveryPhoto) && (
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Verification Proof</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedMission.pickupPhoto && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-center uppercase tracking-widest text-muted-foreground">Pickup</p>
                                                    <img src={selectedMission.pickupPhoto} className="rounded-2xl border-2 border-border/50 aspect-video object-cover" />
                                                </div>
                                            )}
                                            {selectedMission.deliveryPhoto && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-center uppercase tracking-widest text-muted-foreground">Delivery</p>
                                                    <img src={selectedMission.deliveryPhoto} className="rounded-2xl border-2 border-border/50 aspect-video object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedMission.deliveryNotes && (
                                    <Card className="bg-muted/30 border-none">
                                        <CardContent className="p-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Handover Notes</p>
                                            <p className="text-sm font-medium italic">"{selectedMission.deliveryNotes}"</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            <footer className="p-8 border-t border-border/50">
                                <Button className="w-full h-12 rounded-xl font-bold" variant="outline" onClick={() => setSelectedMission(null)}>
                                    Close Details
                                </Button>
                            </footer>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
