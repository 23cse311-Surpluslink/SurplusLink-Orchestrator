import React from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Clock,
    ArrowRight,
    Navigation,
    Box,
    Loader2,
    Bike,
    AlertCircle,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Donation } from "@/types";
import { getTimeUntil } from "@/utils/formatters";

interface MissionCardProps {
    mission: Donation;
    onAccept: (id: string) => void;
    onView: (mission: Donation) => void;
    isAccepting: boolean;
    isTooHeavy: boolean;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export function MissionCard({ mission, onAccept, onView, isAccepting, isTooHeavy }: MissionCardProps) {
    const timeLeft = getTimeUntil(mission.expiryTime);
    const isUrgent = timeLeft.includes('min') || (timeLeft.includes('h') && parseInt(timeLeft) < 3);
    const isVerified = mission.donorTrustScore && mission.donorTrustScore > 4.5;

    // Use backend distance if available, otherwise mock it for UI
    const distanceText = mission.distance
        ? (mission.distance < 1000 ? `${mission.distance}m away` : `${(mission.distance / 1000).toFixed(1)} km away`)
        : "Live nearby";

    return (
        <motion.div variants={itemVariants}>
            <Card
                className={cn(
                    "group relative border-border/60 bg-card hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]",
                    isTooHeavy && "opacity-60 grayscale-[0.5]"
                )}
                onClick={() => onView(mission)}
            >
                <div className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {isUrgent ? (
                                    <Badge className="bg-destructive text-destructive-foreground animate-pulse rounded-md px-2 py-1 uppercase text-[10px] font-black tracking-widest border-none">
                                        Urgent Rescue
                                    </Badge>
                                ) : (
                                    <Badge className="bg-primary/20 text-primary rounded-md px-2 py-1 uppercase text-[10px] font-black tracking-widest border-none">
                                        {mission.foodCategory || "Rescue"}
                                    </Badge>
                                )}

                                {isVerified && (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 rounded-md px-2 py-1 uppercase text-[10px] font-black tracking-widest flex gap-1 items-center">
                                        <ShieldCheck className="size-3" /> Trusted Partner
                                    </Badge>
                                )}

                                {isTooHeavy ? (
                                    <Badge variant="destructive" className="rounded-md px-2 py-1 text-[10px] uppercase font-black tracking-widest gap-1 border-none">
                                        <AlertCircle className="size-3" /> Too Heavy
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="rounded-md px-2 py-1 text-[10px] uppercase font-black tracking-widest gap-1 border-primary/20 text-primary">
                                        <Bike className="size-3" /> Vehicle Matched
                                    </Badge>
                                )}
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
                                    <span className={cn(isUrgent && "text-destructive font-bold")}>
                                        Expiring in {timeLeft}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <MapPin className="size-4 text-emerald-500" />
                                    <span className="text-sm font-bold truncate max-w-[200px]">{mission.address}</span>
                                    <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                                    <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                    <span className="text-sm font-bold truncate max-w-[200px]">{mission.ngoName || "NGO Hub"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-8 gap-4 min-w-[140px]">
                            <div className="text-right hidden md:block">
                                <span className="block text-2xl font-black text-foreground">{distanceText}</span>
                                <span className="block text-xs font-black uppercase tracking-widest text-muted-foreground">Est. distance</span>
                            </div>
                            <Button
                                disabled={isTooHeavy || isAccepting}
                                className="rounded-xl w-full md:w-36 h-12 font-black text-lg bg-primary hover:bg-primary/90 shadow-glow shadow-primary/20 group/btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAccept(mission.id);
                                }}
                            >
                                {isAccepting ? (
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
}
