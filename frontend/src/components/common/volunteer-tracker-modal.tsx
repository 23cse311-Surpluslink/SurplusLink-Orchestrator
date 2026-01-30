import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Navigation,
    Phone,
    CheckCircle2,
    Clock,
    Building,
    User,
    Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VolunteerTrackerModalProps {
    isOpen: boolean;
    onClose: () => void;
    donation: any;
}

export function VolunteerTrackerModal({ isOpen, onClose, donation }: VolunteerTrackerModalProps) {
    const [eta, setEta] = useState(Math.floor(Math.random() * 15 + 5));

    // Simulate real-time movement
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setEta(prev => (prev > 1 ? prev - 1 : 1));
        }, 30000);
        return () => clearInterval(interval);
    }, [isOpen]);

    if (!donation) return null;

    const isAtPickup = donation.status === 'at_pickup';
    const isPickedUp = donation.status === 'picked_up' || donation.status === 'at_delivery';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-border/50 bg-card">
                <div className="relative h-64 bg-muted overflow-hidden">
                    {/* Mock Map Background */}
                    <div className="absolute inset-0 bg-[url('https://api.placeholder.com/1200/600')] bg-cover opacity-50 grayscale" />

                    {/* Map Simulation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="absolute inset-0 w-full h-full">
                            <motion.path
                                d="M 100 300 Q 250 150 400 300 T 550 250"
                                stroke="hsl(var(--primary))"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray="10 5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="opacity-30"
                            />
                        </svg>

                        {/* Donor Icon */}
                        <div className="absolute top-[30%] left-[20%] text-center">
                            <div className={cn(
                                "size-8 rounded-full flex items-center justify-center border-2 border-background shadow-lg",
                                isPickedUp ? "bg-muted text-muted-foreground" : "bg-emerald-500 text-white"
                            )}>
                                <Building className="size-4" />
                            </div>
                            <span className="text-[10px] font-bold uppercase mt-1 block">Donor</span>
                        </div>

                        {/* NGO Icon */}
                        <div className="absolute top-[40%] left-[70%] text-center">
                            <div className="size-8 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-lg text-white">
                                <CheckCircle2 className="size-4" />
                            </div>
                            <span className="text-[10px] font-bold uppercase mt-1 block">You</span>
                        </div>

                        {/* Moving Volunteer Icon */}
                        <motion.div
                            className="absolute size-10 rounded-full bg-white flex items-center justify-center shadow-xl border-2 border-primary"
                            animate={{
                                left: isPickedUp ? ["40%", "65%"] : ["25%", "40%"],
                                top: isPickedUp ? ["20%", "35%"] : ["35%", "20%"]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                            <Navigation className="size-5 text-primary animate-float" />
                            <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping" />
                        </motion.div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 rounded-full bg-background/50 backdrop-blur-md"
                        onClick={onClose}
                    >
                        <Shield className="size-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Badge className="bg-primary/20 text-primary border-none uppercase text-[10px] font-black tracking-widest px-2 py-1 mb-2">
                                {donation.status.replace('_', ' ')}
                            </Badge>
                            <h2 className="text-2xl font-black tracking-tight">{donation.title}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-primary">{eta}m</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Arrival</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Volunteer</p>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-secondary flex items-center justify-center">
                                    <User className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black">{donation.assignedVolunteer || "Assigned Hero"}</p>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase">5.0 ★ Verified</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="h-full rounded-2xl gap-2 font-bold" asChild>
                                <a href="tel:+919999999999">
                                    <Phone className="size-4" /> Call
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "size-4 rounded-full border-2 mt-1 shrink-0",
                                isPickedUp ? "bg-emerald-500 border-emerald-500" : "bg-background border-muted"
                            )} />
                            <div>
                                <p className="text-sm font-black">Picked up from Donor</p>
                                <p className="text-xs text-muted-foreground font-medium">{donation.address}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 opacity-50">
                            <div className="size-4 rounded-full border-2 border-muted mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-black">Arriving at your location</p>
                                <p className="text-xs text-muted-foreground font-medium">{donation.ngoAddress || "Your distribution hub"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
