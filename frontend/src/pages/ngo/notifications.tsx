import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    CheckCheck,
    Clock,
    Package,
    ArrowRight,
    Loader2,
    Trash2,
    MapPin,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import NotificationService from "@/services/notification.service";
import { Notification } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

export default function NgoNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = async () => {
        try {
            await NotificationService.markAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast({ title: "Inbox cleared", description: "All notifications marked as read." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update notifications.", variant: "destructive" });
        }
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getCategory = (type: string) => {
        switch (type) {
            case 'donation_created': return 'Oppurtunity';
            case 'donation_assigned':
            case 'donation_picked_up':
            case 'donation_delivered': return 'Logistics';
            case 'donation_rejected': return 'Safety';
            default: return 'System';
        }
    };

    const filteredNotifications = notifications.filter(n =>
        filter === "All" || getCategory(n.type) === filter
    );

    const handleAction = (n: Notification) => {
        if (n.type === 'donation_created') {
            navigate('/ngo/nearby');
        } else {
            navigate('/ngo/accepted');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-0">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground h-7 px-3 text-xs font-black rounded-full shadow-lg shadow-primary/20">
                                {unreadCount} NEW
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage alerts for nearby donations and distribution updates.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold h-10 px-5"
                        onClick={markAllRead}
                        disabled={unreadCount === 0 || loading}
                    >
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4 mr-2" />}
                        Mark all read
                    </Button>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["All", "Oppurtunity", "Logistics", "Safety", "System"].map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? "default" : "outline"}
                        size="sm"
                        className={cn("rounded-full px-5 font-bold transition-all", filter === f ? "shadow-md" : "text-muted-foreground")}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </Button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="size-12 animate-spin text-primary" />
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <motion.div
                        key="list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {filteredNotifications.map((n) => (
                            <motion.div key={n.id} variants={itemVariants}>
                                <Card className={cn(
                                    "group border-border/50 bg-card hover:border-primary/40 transition-all duration-500 relative overflow-hidden rounded-[2rem]",
                                    !n.read && "border-primary/20 bg-primary/5 shadow-xl shadow-primary/5"
                                )}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-5">
                                            {/* Icon Logic */}
                                            <div className={cn(
                                                "size-14 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner",
                                                n.type === 'donation_created' ? "bg-amber-500/10 text-amber-500" :
                                                    n.type === 'donation_picked_up' ? "bg-primary/10 text-primary" :
                                                        n.type === 'donation_rejected' ? "bg-destructive/10 text-destructive" :
                                                            "bg-blue-500/10 text-blue-500"
                                            )}>
                                                {n.type === 'donation_created' ? <MapPin className="size-7" /> :
                                                    n.type === 'donation_picked_up' ? <Package className="size-7" /> :
                                                        n.type === 'donation_rejected' ? <AlertTriangle className="size-7" /> :
                                                            <Bell className="size-7" />}
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={cn("text-lg font-black tracking-tight", !n.read ? "text-foreground" : "text-muted-foreground")}>
                                                        {n.title}
                                                    </h3>
                                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest bg-muted/30 px-2 py-1 rounded-md">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl">
                                                    {n.message}
                                                </p>

                                                <div className="pt-4 flex items-center gap-3">
                                                    <Button
                                                        className="h-10 rounded-2xl font-black bg-primary hover:bg-primary/90 px-6 group/btn uppercase text-[11px] tracking-wider"
                                                        size="sm"
                                                        onClick={() => handleAction(n)}
                                                    >
                                                        {n.type === 'donation_created' ? 'Claim Now' : 'Track Operations'}
                                                        <ArrowRight className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => deleteNotification(n.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>

                                    {!n.read && (
                                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary animate-pulse" />
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-32 flex flex-col items-center justify-center text-center opacity-40 grayscale"
                    >
                        <div className="size-24 rounded-[2rem] bg-muted/30 border-2 border-dashed flex items-center justify-center mb-6">
                            <Bell className="size-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter">Quiet Day...</h2>
                        <p className="font-bold text-lg mt-2">All {filter !== 'All' ? filter.toLowerCase() : ''} alerts have been cleared.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
