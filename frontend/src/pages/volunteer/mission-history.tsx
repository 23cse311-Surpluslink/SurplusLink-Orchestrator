import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
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
    MapPin,
    Image as ImageIcon,
    CheckCircle2,
    Lock,
    Medal,
    TrendingUp,
    Box,
    Timer,
    XCircle
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

// Mock Past Missions
const PAST_MISSIONS = [
    {
        id: "M-9521",
        title: "Weekend Veggie Rescue",
        date: "Jan 24, 2026",
        time: "14:20",
        duration: "32 mins",
        eta_original: "35 mins",
        ngoName: "Hope Shelter",
        weight: "22kg",
        co2: "4.5kg",
        status: "Delivered",
        rating: 5,
        feedback: "Efficient delivery, saved the weekend meals!",
        pickupPhoto: "https://api.placeholder.com/300/200?text=Pickup+Proof",
        deliveryPhoto: "https://api.placeholder.com/300/200?text=Delivery+Proof",
        route: "Artisan Bakery ⮕ Hope Shelter"
    },
    {
        id: "M-9410",
        title: "Leftover Catering Collection",
        date: "Jan 18, 2026",
        time: "20:45",
        duration: "45 mins",
        eta_original: "40 mins",
        ngoName: "City Food Bank",
        weight: "15kg",
        co2: "3.1kg",
        status: "Delivered",
        rating: 4.5,
        feedback: "Everything arrived fresh. Thank you!",
        pickupPhoto: "https://api.placeholder.com/300/200?text=Catering+Pickup",
        deliveryPhoto: "https://api.placeholder.com/300/200?text=Food+Bank+Delivery",
        route: "Grand Hotel ⮕ City Food Bank"
    },
    {
        id: "M-9302",
        title: "Grocery Surplus Run",
        date: "Jan 12, 2026",
        time: "09:15",
        duration: "28 mins",
        eta_original: "30 mins",
        ngoName: "Indira Canteen",
        weight: "35kg",
        co2: "7.2kg",
        status: "Delivered",
        rating: 5,
        feedback: "High-quality produce, well handled.",
        pickupPhoto: "https://api.placeholder.com/300/200?text=Grocery+Proof",
        deliveryPhoto: "https://api.placeholder.com/300/200?text=Canteen+Delivery",
        route: "Fresh Mart ⮕ Indira Canteen"
    }
];

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
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function MissionHistory() {
    const [selectedMission, setSelectedMission] = useState<typeof PAST_MISSIONS[0] | null>(null);

    return (
        <div className="space-y-10 pb-10">
            {/* Impact Hall of Fame (Hero Stats) */}
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
                                Member since Nov 2025
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-[400px]">
                        <Card className="bg-background/40 backdrop-blur-md border-border/50">
                            <CardContent className="p-6">
                                <p className="text-3xl font-black">42</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Missions Done</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/40 backdrop-blur-md border-border/50">
                            <CardContent className="p-6">
                                <p className="text-3xl font-black text-emerald-500">125<span className="text-sm">kg</span></p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weight Saved</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/40 backdrop-blur-md border-border/50">
                            <CardContent className="p-6">
                                <p className="text-3xl font-black text-blue-500">32<span className="text-sm">kg</span></p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CO2 Offset</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/40 backdrop-blur-md border-border/50">
                            <CardContent className="p-6">
                                <p className="text-3xl font-black text-amber-500">98%</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reliability</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Historical Timeline (Main Feed) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black tracking-tight">Mission History</h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="rounded-full font-bold">Filter</Button>
                            <Button variant="outline" size="sm" className="rounded-full font-bold">Export</Button>
                        </div>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {PAST_MISSIONS.map((m) => (
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
                                                        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{m.date}</span>
                                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black tracking-widest uppercase">
                                                            Delivered
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-lg md:text-xl font-black">{m.ngoName}</h3>
                                                    <p className="text-sm text-muted-foreground font-medium">{m.route}</p>
                                                </div>

                                                <div className="flex flex-col md:items-end gap-2">
                                                    {m.rating && (
                                                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md text-amber-500 text-xs font-bold w-fit">
                                                            <Star className="size-3 fill-amber-500" />
                                                            {m.rating} NGO Rating
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm font-bold">
                                                        <span className="flex items-center gap-1"><Box className="size-3.5" /> {m.weight}</span>
                                                        <span className="flex items-center gap-1 text-emerald-500"><Leaf className="size-3.5" /> {m.co2}</span>
                                                        <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {m.feedback && (
                                            <div className="px-5 pb-5 md:px-6 md:pb-6 pl-[42px] flex items-start gap-2">
                                                <MessageCircle className="size-4 text-primary shrink-0 mt-1" />
                                                <p className="text-sm italic text-muted-foreground font-medium line-clamp-1 border-l-2 border-primary/20 pl-3">
                                                    "{m.feedback}"
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Sidebar Status & Achievements */}
                <div className="space-y-8">
                    {/* Tier Progress */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black uppercase tracking-widest text-primary">Current Progress</span>
                                <Badge className="bg-primary text-white">Hero Tier</Badge>
                            </div>
                            <CardTitle className="text-xl font-black">To Champion</CardTitle>
                            <CardDescription className="text-sm font-medium">850 / 1000 XP (5 missions left)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Progress value={85} className="h-3 bg-primary/10 shadow-inner" />
                            <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-xs font-bold space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-emerald-500" />
                                    Next Perk: Priority Access to Large Missions
                                </div>
                                <div className="flex items-center gap-2 opacity-50">
                                    <div className="size-2 rounded-full bg-muted-foreground" />
                                    Future Perk: Custom Hero Tier Badge
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Badge Gallery */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-black">Achievement Gallery</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest">3 / 6 Unlocked</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                {ACHIEVEMENTS.map((badge) => (
                                    <div key={badge.id} className="group relative flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "size-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                                            badge.unlocked
                                                ? "bg-primary/10 text-primary border-2 border-primary/30 rotate-0"
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

                                        {/* Achievement Tooltip Simulator */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground p-2 rounded-lg text-[10px] font-bold border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                            {badge.description || "Coming soon!"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Mission Inspect View (Sheet) */}
            <Sheet open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
                <SheetContent side="right" className="w-full sm:max-w-2xl p-0 border-l-0 bg-card overflow-hidden flex flex-col">
                    {selectedMission && (
                        <React.Fragment>
                            <header className="p-8 pb-4 border-b border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="font-mono text-primary border-primary/30 uppercase tracking-[0.2em]">{selectedMission.id}</Badge>
                                    <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                        <Calendar className="size-4" /> {selectedMission.date} at {selectedMission.time}
                                    </p>
                                </div>
                                <SheetTitle className="text-3xl font-black tracking-tighter leading-tight">
                                    {selectedMission.title}
                                </SheetTitle>
                            </header>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                                {/* Performance Data */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Time Profile</p>
                                        <p className="text-lg font-black">{selectedMission.duration}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">Original ETA: {selectedMission.eta_original}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Mass Saved</p>
                                        <p className="text-lg font-black">{selectedMission.weight}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">Food Items</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Planet Score</p>
                                        <p className="text-lg font-black text-emerald-500">{selectedMission.co2}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">CO2 Equiv.</p>
                                    </div>
                                </div>

                                {/* Route History */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Detailed Route Archive</h4>
                                    <div className="relative space-y-8 pl-6 border-l-2 border-primary/20 ml-2">
                                        <div className="relative">
                                            <div className="absolute -left-[33px] top-1 size-4 rounded-full bg-emerald-500 border-4 border-card shadow-lg" />
                                            <h5 className="font-bold text-lg">Rescue Point</h5>
                                            <p className="text-sm text-muted-foreground font-medium">{selectedMission.route.split('⮕')[0]}</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[33px] top-1 size-4 rounded-full bg-primary border-4 border-card shadow-lg" />
                                            <h5 className="font-bold text-lg">Goal Destination</h5>
                                            <p className="text-sm text-muted-foreground font-medium text-primary font-bold">{selectedMission.ngoName}</p>
                                            <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">Completed at {selectedMission.time}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Proof Archive */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Verification Proofs</h4>
                                        <ImageIcon className="size-4 text-muted-foreground" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase text-center tracking-widest">Pickup Evidence</p>
                                            <div className="aspect-square rounded-2xl bg-muted overflow-hidden border-2 border-border/50 group cursor-zoom-in">
                                                <img src={selectedMission.pickupPhoto} alt="Pickup" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase text-center tracking-widest">Delivery Handover</p>
                                            <div className="aspect-square rounded-2xl bg-muted overflow-hidden border-2 border-border/50 group cursor-zoom-in">
                                                <img src={selectedMission.deliveryPhoto} alt="Delivery" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recognition */}
                                <Card className="bg-amber-500/5 border-amber-500/10">
                                    <CardContent className="p-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-amber-500">NGO Endorsement</h4>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className={cn("size-3.5", i <= Math.floor(selectedMission.rating) ? "fill-amber-500 text-amber-500" : "text-amber-500/30")} />)}
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium italic text-amber-900/80 leading-relaxed bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                                            "{selectedMission.feedback}"
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <footer className="p-8 border-t border-border/50 flex gap-4">
                                <Button variant="outline" className="flex-1 font-bold h-12 rounded-xl">Report Detail Error</Button>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setSelectedMission(null)}>
                                    <XCircle className="size-6 text-muted-foreground" />
                                </Button>
                            </footer>
                        </React.Fragment>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
