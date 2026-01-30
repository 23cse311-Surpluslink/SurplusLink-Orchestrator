import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Phone,
    AlertTriangle,
    Navigation,
    CheckCircle2,
    Clock,
    ArrowRight,
    User,
    Building,
    ChevronRight,
    Info,
    XCircle,
    Camera,
    RefreshCw,
    Upload,
    MessageSquare,
    Trophy,
    PartyPopper,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DonationService from "@/services/donation.service";
import { Donation } from "@/types";
import { useAuth } from "@/contexts/auth-context";

const STEPS = [
    { id: "accepted", label: "Accepted", detail: "Heading to Pickup", dbStatus: "accepted" },
    { id: "arrived_pickup", label: "Arrived", detail: "Picking up items", dbStatus: "at_pickup" },
    { id: "in_transit", label: "In Transit", detail: "Heading to NGO", dbStatus: "picked_up" },
    { id: "arrived_ngo", label: "Arrived", detail: "Delivering at NGO", dbStatus: "at_delivery" },
    { id: "completed", label: "Finished", detail: "Mission Complete", dbStatus: "delivered" }
];

export default function ActiveMission() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [mission, setMission] = useState<Donation | null>(null);
    const [pickupImage, setPickupImage] = useState<File | null>(null);
    const [pickupImageUrl, setPickupImageUrl] = useState<string | null>(null);
    const [deliveryImage, setDeliveryImage] = useState<File | null>(null);
    const [deliveryImageUrl, setDeliveryImageUrl] = useState<string | null>(null);
    const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const { toast } = useToast();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchActiveMission = useCallback(async () => {
        setLoading(true);
        try {
            const missions = await DonationService.getAvailableMissions();
            // In a real app, we'd have a specific endpoint for the current active mission
            // For now, we find the one assigned to us that isn't completed
            const active = missions.find(m =>
                m.assignedVolunteer === user?.id &&
                ['accepted', 'at_pickup', 'picked_up', 'at_delivery'].includes(m.status)
            );
            if (active) {
                setMission(active);
            }
        } catch (error) {
            console.error("Failed to fetch active mission", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchActiveMission();
    }, [fetchActiveMission]);

    const getCurrentStepIndex = () => {
        if (!mission) return 0;
        const index = STEPS.findIndex(s => s.dbStatus === mission.status);
        return index === -1 ? 0 : index;
    };

    const currentStepIndex = getCurrentStepIndex();
    const currentStep = STEPS[currentStepIndex];

    const updateStatus = async (newStatus: string) => {
        if (!mission?.id) return;
        setIsUpdating(true);
        try {
            await DonationService.updateDeliveryStatus(mission.id, newStatus);
            toast({ title: "Status Updated", description: `You are now ${newStatus.replace('_', ' ')}` });
            fetchActiveMission();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePickupSync = async () => {
        if (!mission?.id || !pickupImage) return;
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('photo', pickupImage);
            await DonationService.confirmPickup(mission.id, formData);
            setIsPickupModalOpen(false);
            fetchActiveMission();
            toast({ title: "Pickup Confirmed", description: "Photo proof uploaded successfully." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to upload pickup proof.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeliverySync = async () => {
        if (!mission?.id || !deliveryImage) return;
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('photo', deliveryImage);
            formData.append('notes', deliveryNotes);
            await DonationService.confirmDelivery(mission.id, formData);
            await refreshUser();
            setIsDeliveryModalOpen(false);
            setIsFinished(true);
        } catch (error) {
            toast({ title: "Error", description: "Failed to complete delivery.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'pickup' | 'delivery') => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'pickup') {
                setPickupImage(file);
                setPickupImageUrl(url);
            } else {
                setDeliveryImage(file);
                setDeliveryImageUrl(url);
            }
        }
    };

    const getActionConfig = () => {
        if (!mission) return { text: "No active mission", action: () => { } };

        switch (mission.status) {
            case "accepted":
                return { text: "I've Arrived at Donor", action: () => updateStatus("at_pickup") };
            case "at_pickup":
                return { text: "Verify & Pick Up", action: () => setIsPickupModalOpen(true) };
            case "picked_up":
                return { text: "I've Arrived at NGO", action: () => updateStatus("at_delivery") };
            case "at_delivery":
                return { text: "Complete Delivery", action: () => setIsDeliveryModalOpen(true) };
            default:
                return { text: "Return to Dashboard", action: () => window.location.href = "/volunteer" };
        }
    };

    const action = getActionConfig();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!mission && !isFinished) {
        return (
            <div className="flex flex-col h-screen items-center justify-center p-6 text-center">
                <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <XCircle className="size-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-black">No Active Mission</h2>
                <p className="text-muted-foreground max-w-xs mt-2">Browse the available jobs to start a food rescue!</p>
                <Button className="mt-8 rounded-xl px-8" onClick={() => window.location.href = "/volunteer/available"}>
                    Find Missions
                </Button>
            </div>
        );
    }

    if (isFinished) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-6"
            >
                <div className="max-w-md w-full text-center space-y-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="relative inline-block"
                    >
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                        <div className="relative size-32 rounded-full bg-primary flex items-center justify-center shadow-glow shadow-primary/40">
                            <CheckCircle2 className="size-16 text-white" />
                        </div>
                        <div className="absolute -top-4 -right-4">
                            <PartyPopper className="size-10 text-amber-500 animate-bounce" />
                        </div>
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter">Mission Accomplished!</h1>
                        <p className="text-xl text-muted-foreground font-medium">
                            You just saved <span className="text-primary font-bold">{mission?.quantity}</span> from going to waste.
                        </p>
                    </div>

                    <Card className="bg-primary/5 border-primary/20 overflow-hidden">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-primary/10">
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Your Impact Portfolio</span>
                            <Badge className="bg-primary text-white uppercase tracking-tighter">Tier: {user?.volunteerProfile?.tier || 'Rookie'}</Badge>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div className="text-left">
                                <p className="text-2xl font-black">{user?.stats?.co2Saved?.toFixed(1) || (Math.random() * 5 + 2).toFixed(1)} kg</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Total CO2 Reduced</p>
                            </div>
                            <div className="text-left">
                                <p className="text-2xl font-black">{user?.stats?.completedDonations || 1}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Successful Rescues</p>
                            </div>
                        </div>
                    </Card>

                    <Button
                        size="lg"
                        className="w-full h-16 rounded-2xl text-xl font-black shadow-glow shadow-primary/20 group"
                        onClick={() => window.location.href = "/volunteer"}
                    >
                        Back to Dashboard
                        <ArrowRight className="ml-2 size-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="relative flex flex-col h-[calc(100vh-120px)] w-full overflow-hidden -m-4 lg:-m-8">
            {/* Top Stepper */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-b from-background via-background/80 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h2 className="text-xl font-extrabold tracking-tight">Mission Execution</h2>
                        <Badge variant="outline" className="font-mono bg-background/50 border-primary/20 text-primary uppercase">
                            ID: {mission?.id?.substring(0, 8)}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                        {STEPS.map((step, idx) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center flex-1">
                                    <div className={cn(
                                        "h-1.5 w-full rounded-full transition-all duration-500",
                                        idx <= currentStepIndex ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),.5)]" : "bg-muted"
                                    )} />
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider mt-2 hidden md:block",
                                        idx === currentStepIndex ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <ChevronRight className="size-4 text-muted/30 mt-[-18px] hidden md:block" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <p className="md:hidden text-center text-xs font-black text-primary mt-2 uppercase tracking-widest animate-pulse">
                        {currentStep.detail}
                    </p>
                </div>
            </div>

            {/* Live Map Area (Mock) */}
            <div className="relative flex-1 bg-muted/30 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://api.placeholder.com/1200/800')] bg-cover opacity-40 grayscale pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="absolute inset-0 w-full h-full">
                        <motion.path
                            d="M 200 400 Q 400 300 600 500 T 1000 450"
                            stroke="hsl(var(--primary))"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray="20 10"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="opacity-40"
                        />
                    </svg>
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-[40%] left-[20%] size-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/50">
                        <div className="size-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                    </motion.div>
                    <div className="absolute top-[30%] left-[40%] text-center">
                        <div className="size-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-card shadow-lg mb-1">
                            <Building className="size-5 text-white" />
                        </div>
                        <Badge className="bg-card/90 text-[10px] font-black border-emerald-500/20 text-emerald-500 uppercase">PICKUP</Badge>
                    </div>
                    <div className="absolute top-[50%] left-[80%] text-center">
                        <div className="size-10 bg-primary rounded-2xl flex items-center justify-center border-4 border-card shadow-lg mb-1">
                            <CheckCircle2 className="size-5 text-white" />
                        </div>
                        <Badge className="bg-card/90 text-[10px] font-black border-primary/20 text-primary uppercase">NGO</Badge>
                    </div>
                </div>

                <div className="absolute bottom-32 left-4 right-4 md:left-auto md:right-8 md:bottom-36 md:w-80">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Navigation className="size-4 text-primary animate-float" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Next Stop</p>
                                    <p className="text-sm font-bold truncate max-w-[120px]">
                                        {currentStepIndex < 2 ? mission.donorName : mission.ngoName}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-primary">{(Math.random() * 10 + 2).toFixed(0)} min</p>
                                <p className="text-[10px] font-black uppercase text-muted-foreground">{(Math.random() * 3 + 1).toFixed(1)} km</p>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div className="h-full bg-primary" animate={{ width: ["20%", "45%", "80%"] }} transition={{ duration: 10, repeat: Infinity }} />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="relative z-30 bg-card border-t border-border/50 p-6 md:px-12 pb-8 md:pb-12 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-1 gap-4">
                            <div className="p-4 rounded-xl bg-accent/30 border border-border/50 text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Current Contact</p>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-secondary flex items-center justify-center">
                                        <User className="size-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold truncate">
                                            {currentStepIndex < 2 ? mission.donorName : mission.ngoName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate uppercase font-bold tracking-tighter">
                                            {currentStepIndex < 2 ? "Donor Representative" : "NGO Coordinator"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="flex-1 h-14 rounded-xl gap-2 font-black uppercase text-xs tracking-widest" asChild>
                                    <a href={`tel:+919999999999`}>
                                        <Phone className="size-4" /> Call Partner
                                    </a>
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 p-5 rounded-xl bg-primary/5 border border-primary/10 text-left">
                            <div className="flex items-start gap-4">
                                <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                    <MapPin className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Destination</p>
                                    <p className="font-bold leading-tight line-clamp-2">
                                        {currentStepIndex < 2 ? mission.address : (mission.ngoAddress || "NGO Distribution Center")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            size="lg"
                            disabled={isUpdating}
                            className="flex-1 h-16 rounded-2xl text-xl font-black shadow-glow group"
                            onClick={action.action}
                        >
                            {isUpdating ? <Loader2 className="animate-spin size-6" /> : action.text}
                            {!isUpdating && <ArrowRight className="ml-3 size-6 group-hover:translate-x-2 transition-transform" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Pickup Proof Modal */}
            <Dialog open={isPickupModalOpen} onOpenChange={setIsPickupModalOpen}>
                <DialogContent className="max-w-md rounded-3xl border-border/50 overflow-hidden p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-black">Proof of Pickup</DialogTitle>
                        <DialogDescription className="font-medium">Capture a photo of the food items to verify condition.</DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-4 space-y-6 text-center">
                        <div
                            className={cn(
                                "relative aspect-video rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center bg-muted/30 overflow-hidden group",
                                pickupImageUrl && "border-solid border-primary/40"
                            )}
                        >
                            {pickupImageUrl ? (
                                <>
                                    <img src={pickupImageUrl} alt="Pickup" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-full font-bold"
                                            onClick={() => {
                                                setPickupImage(null);
                                                setPickupImageUrl(null);
                                            }}
                                        >
                                            <RefreshCw className="size-4 mr-2" /> Retake
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="flex flex-col items-center gap-3 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Camera className="size-8" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">Tap to take photo</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'pickup')}
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            className="w-full h-14 rounded-xl font-black text-lg"
                            disabled={!pickupImage || isUpdating}
                            onClick={handlePickupSync}
                        >
                            {isUpdating ? <Loader2 className="animate-spin size-5" /> : "Confirm Pickup"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delivery Proof Modal */}
            <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
                <DialogContent className="max-w-md rounded-3xl border-border/50 overflow-hidden p-0">
                    <DialogHeader className="p-6 pb-0 text-left">
                        <DialogTitle className="text-2xl font-black">Proof of Delivery</DialogTitle>
                        <DialogDescription className="font-medium text-left">Capture handover photo at {mission.ngoName}.</DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-4 space-y-6 text-left">
                        <div
                            className={cn(
                                "relative aspect-video rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center bg-muted/30 overflow-hidden group mb-4",
                                deliveryImageUrl && "border-solid border-primary/40"
                            )}
                        >
                            {deliveryImageUrl ? (
                                <>
                                    <img src={deliveryImageUrl} alt="Delivery" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-full font-bold"
                                            onClick={() => {
                                                setDeliveryImage(null);
                                                setDeliveryImageUrl(null);
                                            }}
                                        >
                                            <RefreshCw className="size-4 mr-2" /> Retake
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="flex flex-col items-center gap-3 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Camera className="size-8" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">Tap to take photo</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'delivery')}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Delivery Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="e.g. Left with security, food was cold..."
                                className="rounded-xl border-border/50 min-h-[100px] font-medium"
                                value={deliveryNotes}
                                onChange={(e) => setDeliveryNotes(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full h-14 rounded-xl font-black text-lg shadow-glow shadow-primary/20"
                            disabled={!deliveryImage || isUpdating}
                            onClick={handleDeliverySync}
                        >
                            {isUpdating ? <Loader2 className="animate-spin size-5" /> : "Confirm Handover"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
