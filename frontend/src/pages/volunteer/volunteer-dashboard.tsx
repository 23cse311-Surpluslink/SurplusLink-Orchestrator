import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Leaf, ShieldCheck, MapPin, Clock, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Mock data for the initial UI
const volunteerStats = [
    {
        label: "Jobs Completed",
        value: "42",
        icon: Truck,
        description: "+3 this week",
        color: "text-blue-500",
    },
    {
        label: "CO2 Saved",
        value: "125kg",
        icon: Leaf,
        description: "Equivalent to 5 trees",
        color: "text-emerald-500",
    },
    {
        label: "Reliability",
        value: "98%",
        icon: ShieldCheck,
        description: "Top 5% of volunteers",
        color: "text-amber-500",
    },
    {
        label: "Current Tier",
        value: "Hero",
        icon: Zap,
        description: "Champion in 8 jobs",
        color: "text-purple-500",
    },
];

const activeMission = {
    id: "M-1024",
    title: "Morning Bakery Rescue",
    pickup: "Artisan Bakeshop, 12th Ave",
    dropoff: "Haven Shelter, Downtown",
    deadline: "24 mins remaining",
    items: "15kg Bread & Pastries",
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function VolunteerDashboard() {
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
                <p className="text-muted-foreground text-lg">
                    Your impact today: <span className="text-primary font-semibold">Saved 12kg of food from landfill</span>
                </p>
            </div>

            {/* Active Mission Slot */}
            <motion.div variants={itemVariants}>
                <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-glow transition-all hover:border-primary/40 group">
                    <div className="absolute top-0 right-0 p-6">
                        <Badge className="bg-primary text-primary-foreground animate-pulse-slow">
                            Active Mission
                        </Badge>
                    </div>
                    <CardHeader>
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Zap className="h-6 w-6 fill-primary/20" />
                            <span className="font-mono text-sm font-bold tracking-widest uppercase">Mission #{activeMission.id}</span>
                        </div>
                        <CardTitle className="text-3xl font-bold">{activeMission.title}</CardTitle>
                        <CardDescription className="text-base text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" /> {activeMission.deadline}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pickup</p>
                                        <p className="font-semibold">{activeMission.pickup}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Drop-off</p>
                                        <p className="font-semibold">{activeMission.dropoff}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="bg-background/50 rounded-xl p-4 border border-border/50 backdrop-blur-sm">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Items to Rescue</p>
                                    <p className="text-lg font-bold">{activeMission.items}</p>
                                </div>
                                <Button className="w-full h-12 text-lg font-bold group" size="lg" onClick={() => window.location.href = '/volunteer/active'}>
                                    Manage Mission
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {volunteerStats.map((stat, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <Card className="hover:bg-accent/50 transition-colors cursor-default group border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", stat.color)} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                                <p className="text-xs font-medium text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Available Missions Quick Link */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Available Missions</h2>
                    <Button variant="link" className="text-primary font-bold p-0" onClick={() => window.location.href = '/volunteer/available'}>
                        View All <ArrowRight className="ml-1 size-4" />
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-muted/30 border-dashed border-2 flex flex-col items-center justify-center p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/volunteer/available'}>
                        <Search className="size-8 text-muted-foreground mb-3" />
                        <p className="font-bold">Find more jobs</p>
                        <p className="text-sm text-muted-foreground">Browse all rescues in your zone</p>
                    </Card>
                    <div className="hidden md:block">
                        {/* This mimics one available job briefly */}
                        <Card className="border-border/50 hover:border-primary/30 transition-all cursor-pointer" onClick={() => window.location.href = '/volunteer/available'}>
                            <CardHeader className="pb-2">
                                <Badge className="w-fit bg-primary/10 text-primary border-none mb-2">New</Badge>
                                <CardTitle className="text-base line-clamp-1">Fresh Deli Platter Rescue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mb-4">Sector 4 ⮕ Sector 9</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold">3.2 km</span>
                                    <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-primary hover:bg-primary/10">View Details</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>

            {/* Recent Activity Placeholder */}
            <motion.div variants={itemVariants} className="pt-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Your Impact History</h2>
                    <Button variant="ghost" className="text-primary font-bold" onClick={() => window.location.href = '/volunteer/history'}>Full Activity Log</Button>
                </div>
                <div className="rounded-2xl border border-dashed border-border/60 p-12 flex flex-col items-center justify-center text-center bg-muted/5">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-semibold">No finished missions lately.</p>
                    <p className="text-muted-foreground max-w-xs">Complete your active mission to see your CO2 savings and history here!</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
