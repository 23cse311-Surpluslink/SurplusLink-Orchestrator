import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    CheckCheck,
    Clock,
    Package,
    ArrowRight,
    ShieldCheck,
    Zap,
    Trash2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import NotificationService from "@/services/notification.service";
import { Notification } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

export default function VolunteerNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const { toast } = useToast();

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
            toast({ title: "In-box cleared", description: "All notifications marked as read." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update notifications.", variant: "destructive" });
        }
    };

    const deleteNotification = (id: string) => {
        // Backend doesn't have delete currently in the service, but we can filter locally
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getCategory = (type: string) => {
        switch (type) {
            case 'match':
            case 'priority_dispatch':
            case 'pickup':
            case 'delivery': return 'Mission';
            case 'hygiene': return 'Progress';
            default: return 'System';
        }
    };

    const filteredNotifications = notifications.filter(n =>
        filter === "All" || getCategory(n.type) === filter
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                        Inbox
                        {unreadCount > 0 && (
                            <Badge className="bg-primary text-white h-7 px-3 text-sm font-black rounded-full shadow-glow shadow-primary/20">
                                {unreadCount} New
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Stay updated with your latest mission alerts and feedback.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full font-bold border-border/50 hover:bg-primary/5 hover:text-primary transition-colors h-10 px-5"
                        onClick={markAllRead}
                        disabled={unreadCount === 0 || loading}
                    >
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4 mr-2" />}
                        Mark all read
                    </Button>
                </div>
            </header>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {["All", "System", "Mission", "Progress"].map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(f)}
                        className={cn(
                            "rounded-full px-5 font-bold border-2 transition-all h-9",
                            filter === f ? "border-primary shadow-glow shadow-primary/20" : "bg-card border-border/50 hover:border-primary/50 text-muted-foreground"
                        )}
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
                                    "group border-border/50 bg-card hover:border-primary/30 transition-all duration-300 relative overflow-hidden",
                                    !n.read && "border-primary/20 bg-primary/5 shadow-sm shadow-primary/5"
                                )}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-5">
                                            {/* Icon Strategy */}
                                            <div className={cn(
                                                "size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                                n.type === 'match' || n.type === 'priority_dispatch' ? "bg-amber-500/10 text-amber-500" :
                                                    n.type === 'pickup' ? "bg-primary/10 text-primary" :
                                                        n.type === 'delivery' ? "bg-blue-500/10 text-blue-500" :
                                                            "bg-emerald-500/10 text-emerald-500"
                                            )}>
                                                {n.type === 'match' || n.type === 'priority_dispatch' ? <Zap className="size-6" /> :
                                                    n.type === 'pickup' ? <Clock className="size-6" /> :
                                                        n.type === 'delivery' ? <Package className="size-6" /> :
                                                            <ShieldCheck className="size-6" />}
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={cn("text-lg font-black tracking-tight", !n.read ? "text-foreground" : "text-muted-foreground")}>
                                                        {n.title}
                                                    </h3>
                                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                                    {n.message}
                                                </p>

                                                {(n.type === 'match' || n.type === 'priority_dispatch') && (
                                                    <div className="pt-3">
                                                        <Button className="h-9 rounded-xl font-bold bg-primary hover:bg-primary/90 px-4 group/btn" size="sm" onClick={() => window.location.href = '/volunteer/available'}>
                                                            View Mission
                                                            <ArrowRight className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Overlay */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => deleteNotification(n.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>

                                    {/* Unread Glow Indicator */}
                                    {!n.read && (
                                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
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
                        className="py-20 flex flex-col items-center justify-center text-center opacity-40 grayscale"
                    >
                        <div className="size-24 rounded-full bg-muted flex items-center justify-center mb-6">
                            <Bell className="size-12" />
                        </div>
                        <h2 className="text-2xl font-black">All Clean!</h2>
                        <p className="font-medium">No {filter !== 'All' ? filter.toLowerCase() : ''} notifications at the moment.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
