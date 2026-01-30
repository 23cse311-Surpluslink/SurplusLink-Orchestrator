import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    MapPin,
    Truck,
    Clock,
    Beef,
    Package,
    Utensils,
    Info,
    Search,
    Filter,
    ArrowRight,
    TrendingUp,
    Map as MapIcon,
    List as ListIcon,
    CheckCircle2,
    AlertCircle,
    Bike,
    Navigation,
    Box
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_MISSIONS = [
    {
        id: "JOB-7721",
        title: "Fresh Deli Platter Rescue",
        type: "Cooked",
        urgency: "High",
        pickup: "Central Gourmet Deli, Sector 4",
        dropoff: "Community Kitchen, Sector 9",
        distance: "3.2 km",
        eta: "12 mins",
        quantity: "12kg / 4 Trays",
        vehicleRequirement: "scooter",
        expiry: "45 mins",
        coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    {
        id: "JOB-8812",
        title: "Organic Vegetable Batch",
        type: "Raw",
        urgency: "Normal",
        pickup: "Fresh Farmers Market, HSR",
        dropoff: "Hope NGO Center, BTM",
        distance: "5.8 km",
        eta: "22 mins",
        quantity: "45kg / 8 Crates",
        vehicleRequirement: "car",
        expiry: "4 hours",
        coordinates: { lat: 12.9141, lng: 77.6411 }
    },
    {
        id: "JOB-9903",
        title: "Sealed Dry Goods",
        type: "Packaged",
        urgency: "Low",
        pickup: "Mega Mart Warehouse",
        dropoff: "Children's Shelter, Indiranagar",
        distance: "8.1 km",
        eta: "35 mins",
        quantity: "150kg / 15 Boxes",
        vehicleRequirement: "van",
        expiry: "2 days",
        coordinates: { lat: 12.9784, lng: 77.6408 }
    }
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

export default function AvailableMissions() {
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "map">("list");
    const [selectedMission, setSelectedMission] = useState<typeof MOCK_MISSIONS[0] | null>(null);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const filteredMissions = MOCK_MISSIONS.filter(m =>
        filter === "All" || m.type === filter
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 z-20 bg-background/95 backdrop-blur-md pb-4 pt-2 -mt-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                        Available Jobs
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                            {filteredMissions.length} Near You
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Find missions that match your {MOCK_MISSIONS[0].vehicleRequirement}.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")} className="w-fit">
                        <TabsList className="bg-muted/50 border border-border/50">
                            <TabsTrigger value="list" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <ListIcon className="size-4" /> List
                            </TabsTrigger>
                            <TabsTrigger value="map" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <MapIcon className="size-4" /> Map
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {["All", "Cooked", "Raw", "Packaged"].map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(f)}
                        className={cn(
                            "rounded-full px-5 font-bold border-2 transition-all",
                            filter === f ? "border-primary shadow-glow shadow-primary/20" : "bg-card border-border/50 hover:border-primary/50"
                        )}
                    >
                        {f === "Cooked" && <Utensils className="size-3.5 mr-2" />}
                        {f === "Raw" && <Beef className="size-3.5 mr-2" />}
                        {f === "Packaged" && <Package className="size-3.5 mr-2" />}
                        {f}
                    </Button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-4"
                    >
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="border-border/50 overflow-hidden">
                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="w-full md:w-1/3 h-48 md:h-auto overflow-hidden">
                                        <Skeleton className="h-full w-full rounded-none" />
                                    </div>
                                    <div className="flex-1 p-6 space-y-4">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-24 rounded-full" />
                                            <Skeleton className="h-8 w-24 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </motion.div>
                ) : filteredMissions.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl border-2 border-dashed border-border/60 p-20 flex flex-col items-center justify-center text-center bg-muted/5 mt-10"
                    >
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                            <div className="relative size-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <Navigation className="size-10 text-primary animate-float" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black mb-2">Scanning Your Area...</h2>
                        <p className="text-muted-foreground max-w-sm mb-8 font-medium">
                            No {filter !== "All" ? filter.toLowerCase() : ""} missions found within your delivery range. Try switching your vehicle or status!
                        </p>
                        <Button className="rounded-full font-bold px-8 shadow-glow shadow-primary/30 h-12 text-lg">
                            Refresh Map
                        </Button>
                    </motion.div>
                ) : view === "list" ? (
                    <motion.div
                        key="list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid gap-5"
                    >
                        {filteredMissions.map((mission) => (
                            <motion.div key={mission.id} variants={itemVariants}>
                                <Card
                                    className="group relative border-border/60 bg-card hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
                                    onClick={() => setSelectedMission(mission)}
                                >
                                    <div className="p-5 md:p-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            {/* Left Info Column */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between md:justify-start gap-3">
                                                    <div className="flex gap-2">
                                                        <Badge className={cn(
                                                            "rounded-md px-2 py-1 uppercase text-[10px] font-black tracking-widest",
                                                            mission.urgency === "High" ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary/20 text-primary border-none"
                                                        )}>
                                                            {mission.urgency === "High" ? "Urgent Rescue" : mission.type}
                                                        </Badge>
                                                        <Badge variant="outline" className="rounded-md px-2 py-1 text-[10px] uppercase font-black tracking-widest gap-1 border-primary/20 text-primary">
                                                            <Bike className="size-3" /> Matches your Vehicle
                                                        </Badge>
                                                    </div>
                                                    <span className="md:hidden font-black text-primary text-xl">{mission.distance}</span>
                                                </div>

                                                <div>
                                                    <h3 className="text-xl md:text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                                                        {mission.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-muted-foreground mt-1 font-medium">
                                                        <Box className="size-4" />
                                                        <span>{mission.quantity}</span>
                                                        <span className="mx-1">•</span>
                                                        <Clock className="size-4" />
                                                        <span className={cn(mission.urgency === "High" && "text-destructive font-bold")}>Expires in {mission.expiry}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 pt-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        <span className="text-sm font-bold truncate max-w-[250px]">{mission.pickup}</span>
                                                        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                                                        <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                                        <span className="text-sm font-bold truncate max-w-[250px]">{mission.dropoff}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right CTA/Meta Column */}
                                            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-8 gap-4 min-w-[120px]">
                                                <div className="text-right hidden md:block">
                                                    <span className="block text-3xl font-black text-foreground">{mission.distance}</span>
                                                    <span className="block text-xs font-black uppercase tracking-widest text-muted-foreground">Est. travel</span>
                                                </div>
                                                <Button
                                                    className="rounded-xl w-full md:w-32 h-12 font-black text-lg bg-primary hover:bg-primary/90 shadow-glow shadow-primary/20 group/btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = '/volunteer/active';
                                                    }}
                                                >
                                                    Accept
                                                    <Navigation className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="map"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-3xl border border-border/50 aspect-[16/9] md:aspect-[21/9] w-full bg-muted overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-[url('https://api.placeholder.com/1200/600')] bg-cover opacity-40 grayscale pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-background/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-border/50 text-center">
                                <p className="font-black">Map View is restricted to browser only.</p>
                                <p className="text-sm text-muted-foreground">Detailed markers for {filteredMissions.length} active jobs are ready.</p>
                            </div>
                        </div>
                        {/* Simple visual markers simulation */}
                        {filteredMissions.map((m, i) => (
                            <div key={m.id} className="absolute hidden md:block" style={{ top: `${30 + i * 15}%`, left: `${40 + i * 10}%` }}>
                                <div className="relative group cursor-pointer" onClick={() => setSelectedMission(m)}>
                                    <div className="absolute inset-0 size-8 bg-primary/30 rounded-full animate-ping -translate-x-1/2 -translate-y-1/2" />
                                    <div className="relative size-8 rounded-full bg-primary border-4 border-background flex items-center justify-center shadow-lg -translate-x-1/2 -translate-y-1/2">
                                        <div className="size-2 bg-background rounded-full" />
                                    </div>
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-border/50">
                                        {m.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mission Detail Sheet */}
            <Sheet open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
                <SheetContent side="right" className="w-full sm:max-w-xl border-l-0 p-0 sm:rounded-l-3xl overflow-hidden bg-card">
                    {selectedMission && (
                        <div className="h-full flex flex-col">
                            <div className="h-64 bg-muted relative">
                                <div className="absolute inset-0 bg-[url('https://api.placeholder.com/600/400')] bg-cover grayscale opacity-50" />
                                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 left-4 size-10 rounded-full bg-background/50 backdrop-blur-md"
                                    onClick={() => setSelectedMission(null)}
                                >
                                    <ArrowRight className="size-6 rotate-180" />
                                </Button>
                            </div>

                            <div className="flex-1 p-8 -mt-10 relative bg-card rounded-t-3xl border-t border-border/50 overflow-y-auto custom-scrollbar">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-primary/20 text-primary uppercase text-xs font-black tracking-widest">{selectedMission.type}</Badge>
                                            <span className="text-sm font-black text-muted-foreground">ID: {selectedMission.id}</span>
                                        </div>
                                        <SheetTitle className="text-4xl font-black leading-tight tracking-tighter">
                                            {selectedMission.title}
                                        </SheetTitle>
                                        <SheetDescription className="text-base font-medium">
                                            Direct rescue from <span className="text-foreground font-bold">{selectedMission.pickup.split(',')[0]}</span> to <span className="text-foreground font-bold">{selectedMission.dropoff.split(',')[0]}</span>.
                                        </SheetDescription>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/50 p-4 rounded-2xl border border-border/30">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Quantity</p>
                                            <p className="text-lg font-black">{selectedMission.quantity}</p>
                                        </div>
                                        <div className="bg-muted/50 p-4 rounded-2xl border border-border/30">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Time Left</p>
                                            <p className="text-lg font-black text-destructive">{selectedMission.expiry}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Rescue Route</h4>

                                        <div className="relative space-y-10 pl-6 border-l-2 border-dashed border-border/80 ml-2">
                                            <div className="relative">
                                                <div className="absolute -left-[33px] top-1 size-4 rounded-full bg-emerald-500 border-4 border-card shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <h5 className="font-black text-lg">Pickup</h5>
                                                <p className="text-muted-foreground font-medium">{selectedMission.pickup}</p>
                                                <p className="text-xs text-primary font-bold mt-1">Provider: 5-star verified</p>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute -left-[33px] top-1 size-4 rounded-full bg-primary border-4 border-card shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                                <h5 className="font-black text-lg">Drop-off</h5>
                                                <p className="text-muted-foreground font-medium">{selectedMission.dropoff}</p>
                                                <p className="text-xs text-primary font-bold mt-1">Recipient NGO: {selectedMission.dropoff.split(',')[0]}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                            <AlertCircle className="size-5 shrink-0" />
                                            <p className="text-xs font-bold">Ensure you have {selectedMission.vehicleRequirement === 'car' ? 'enough trunk space' : 'a carrier box'} for {selectedMission.quantity}.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-border/50 bg-background/50 backdrop-blur-md">
                                <Button
                                    className="w-full h-16 rounded-2xl font-black text-xl shadow-glow shadow-primary/30 group"
                                    onClick={() => window.location.href = '/volunteer/active'}
                                >
                                    Accept Mission
                                    <CheckCircle2 className="ml-2 size-6 group-active:scale-125 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
