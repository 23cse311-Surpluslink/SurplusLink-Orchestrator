import React, { useState, useEffect, useCallback } from "react";
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
    Box,
    Loader2
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
import DonationService from "@/services/donation.service";
import { Donation } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

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
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [view, setView] = useState<"list" | "map">("list");
    const [missions, setMissions] = useState<Donation[]>([]);
    const [selectedMission, setSelectedMission] = useState<Donation | null>(null);
    const [filter, setFilter] = useState("All");

    const fetchMissions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await DonationService.getAvailableMissions();
            setMissions(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch available missions.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchMissions();
    }, [fetchMissions]);

    const handleAccept = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setAcceptingId(id);
        try {
            await DonationService.acceptMission(id);
            toast({
                title: "Mission Accepted! 🚀",
                description: "Proceed to the active mission tab to start the rescue.",
                className: "bg-emerald-600 text-white border-none shadow-xl"
            });
            fetchMissions();
            setSelectedMission(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to accept mission. It might have been taken.",
                variant: "destructive"
            });
        } finally {
            setAcceptingId(null);
        }
    };

    const getUrgency = (expiry: string) => {
        const hours = (new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60);
        if (hours < 2) return "High";
        if (hours < 6) return "Normal";
        return "Low";
    };

    const filteredMissions = missions.filter(m =>
        filter === "All" || m.foodCategory === filter.toLowerCase()
    );

    const isTooHeavy = (quantity: string) => {
        const kg = parseInt(quantity.match(/\d+/)?.[0] || "0");
        return user?.volunteerProfile?.maxWeight ? kg > user.volunteerProfile.maxWeight : false;
    };

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
                    <p className="text-muted-foreground text-sm font-medium">
                        {user?.volunteerProfile?.vehicleType
                            ? `Matching results for your ${user.volunteerProfile.vehicleType}.`
                            : "Configure your vehicle in settings for better matching."
                        }
                    </p>
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
                                <Navigation className="size-10 mt-1 text-primary " />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black mb-2">Scanning Your Area...</h2>
                        <p className="text-muted-foreground max-w-sm mb-8 font-medium">
                            No {filter !== "All" ? filter.toLowerCase() : ""} missions found within your delivery range. Try switching your vehicle or status!
                        </p>
                        <Button className="rounded-full font-bold px-8 shadow-glow shadow-primary/30 h-12 text-lg" onClick={fetchMissions}>
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
                        {filteredMissions.map((mission) => {
                            const tooHeavy = isTooHeavy(mission.quantity);
                            const urgency = getUrgency(mission.expiryTime);

                            return (
                                <motion.div key={mission.id} variants={itemVariants}>
                                    <Card
                                        className={cn(
                                            "group relative border-border/60 bg-card hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]",
                                            tooHeavy && "opacity-60 grayscale-[0.5]"
                                        )}
                                        onClick={() => setSelectedMission(mission)}
                                    >
                                        <div className="p-5 md:p-6">
                                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                                {/* Left Info Column */}
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-start justify-between md:justify-start gap-3">
                                                        <div className="flex gap-2">
                                                            <Badge className={cn(
                                                                "rounded-md px-2 py-1 uppercase text-[10px] font-black tracking-widest border-none",
                                                                urgency === "High"
                                                                    ? "bg-destructive text-destructive-foreground animate-pulse"
                                                                    : (!mission.foodCategory
                                                                        ? "bg-amber-500/20 text-amber-500"
                                                                        : "bg-primary/20 text-primary")
                                                            )}>
                                                                {urgency === "High"
                                                                    ? "Urgent Rescue"
                                                                    : (mission.foodCategory || "Expiring Soon")
                                                                }
                                                            </Badge>
                                                            {tooHeavy ? (
                                                                <Badge variant="destructive" className="rounded-md px-2 py-1 text-[10px] uppercase font-black tracking-widest gap-1">
                                                                    <AlertCircle className="size-3" /> Too Heavy
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="rounded-md px-2 py-1 text-[10px] uppercase font-black tracking-widest gap-1 border-primary/20 text-primary">
                                                                    <Bike className="size-3" /> Vehicle Matched
                                                                </Badge>
                                                            )}
                                                        </div>
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
                                                            <span className={cn(urgency === "High" && "text-destructive font-bold")}>
                                                                Expires {new Date(mission.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-3 pt-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                            <span className="text-sm font-bold truncate max-w-[200px]">{mission.address}</span>
                                                            <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                                                            <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                                            <span className="text-sm font-bold truncate max-w-[200px]">{mission.ngoAddress || "NGO Hub"}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right CTA/Meta Column */}
                                                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-8 gap-4 min-w-[120px]">
                                                    <div className="text-right hidden md:block">
                                                        <span className="block text-3xl font-black text-foreground">{(Math.random() * 5 + 1).toFixed(1)} km</span>
                                                        <span className="block text-xs font-black uppercase tracking-widest text-muted-foreground">Est. distance</span>
                                                    </div>
                                                    <Button
                                                        disabled={tooHeavy || acceptingId === mission.id}
                                                        className="rounded-xl w-full md:w-32 h-12 font-black text-lg bg-primary hover:bg-primary/90 shadow-glow shadow-primary/20 group/btn"
                                                        onClick={(e) => handleAccept(e, mission.id!)}
                                                    >
                                                        {acceptingId === mission.id ? (
                                                            <Loader2 className="animate-spin size-5" />
                                                        ) : (
                                                            <>
                                                                Accept
                                                                <Navigation className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
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
                            <div className="h-64 bg-muted relative overflow-hidden">
                                {selectedMission.image || (selectedMission.photos && selectedMission.photos.length > 0) ? (
                                    <img
                                        src={selectedMission.photos?.[0] || selectedMission.image}
                                        alt={selectedMission.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[url('https://api.placeholder.com/600/400')] bg-cover grayscale opacity-50" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 left-4 size-10 rounded-full bg-background/50 backdrop-blur-md z-10"
                                    onClick={() => setSelectedMission(null)}
                                >
                                    <ArrowRight className="size-6 rotate-180" />
                                </Button>
                            </div>

                            <div className="flex-1 p-8 -mt-10 relative bg-card rounded-t-3xl border-t border-border/50 overflow-y-auto custom-scrollbar">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-primary/20 text-primary uppercase text-xs font-black tracking-widest">{selectedMission.foodCategory}</Badge>
                                            <span className="text-sm font-black text-muted-foreground">ID: {selectedMission.id?.substring(0, 8).toUpperCase()}</span>
                                        </div>
                                        <SheetTitle className="text-4xl font-black leading-tight tracking-tighter">
                                            {selectedMission.title}
                                        </SheetTitle>
                                        <SheetDescription className="text-base font-medium">
                                            Direct rescue from <span className="text-foreground font-bold">{selectedMission.donorName}</span> to <span className="text-foreground font-bold">{selectedMission.ngoName || "Assigned NGO Hub"}</span>.
                                        </SheetDescription>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/50 p-4 rounded-2xl border border-border/30">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Quantity</p>
                                            <p className="text-lg font-black">{selectedMission.quantity}</p>
                                        </div>
                                        <div className="bg-muted/50 p-4 rounded-2xl border border-border/30">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Deadline</p>
                                            <p className="text-lg font-black text-destructive">
                                                {new Date(selectedMission.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Rescue Route</h4>

                                        <div className="relative space-y-10 pl-6 border-l-2 border-dashed border-border/80 ml-2">
                                            <div className="relative">
                                                <div className="absolute -left-[33px] top-1 size-4 rounded-full bg-emerald-500 border-4 border-card shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <h5 className="font-black text-lg">Pickup</h5>
                                                <p className="text-muted-foreground font-medium">{selectedMission.address}</p>
                                                <p className="text-xs text-primary font-bold mt-1">Provider: {selectedMission.donorName}</p>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute -left-[33px] top-1 size-4 rounded-full bg-primary border-4 border-card shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                                <h5 className="font-black text-lg">Drop-off</h5>
                                                <p className="text-muted-foreground font-medium">{selectedMission.ngoAddress || "NGO Hub Location"}</p>
                                                <p className="text-xs text-primary font-bold mt-1">Recipient NGO: {selectedMission.ngoName || "TBD"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <div className={cn(
                                            "flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold",
                                            isTooHeavy(selectedMission.quantity)
                                                ? "bg-destructive/10 border-destructive/20 text-destructive"
                                                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                        )}>
                                            <AlertCircle className="size-5 shrink-0" />
                                            <p>
                                                {isTooHeavy(selectedMission.quantity)
                                                    ? `Action Required: This load (${selectedMission.quantity}) exceeds your vehicle limits.`
                                                    : `Safety First: Check food temperature and seals upon arrival.`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-border/50 bg-background/50 backdrop-blur-md">
                                <Button
                                    disabled={isTooHeavy(selectedMission.quantity) || acceptingId === selectedMission.id}
                                    className="w-full h-16 rounded-2xl font-black text-xl shadow-glow shadow-primary/30 group"
                                    onClick={(e) => handleAccept(e, selectedMission.id!)}
                                >
                                    {acceptingId === selectedMission.id ? (
                                        <Loader2 className="animate-spin size-6" />
                                    ) : (
                                        <>
                                            Accept Mission
                                            <CheckCircle2 className="ml-2 size-6 group-active:scale-125 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
