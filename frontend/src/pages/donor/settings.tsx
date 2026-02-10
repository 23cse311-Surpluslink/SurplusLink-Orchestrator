import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Save, Navigation, Building2, ShieldCheck } from "lucide-react";
import * as React from "react";
import { useAuth } from "@/contexts/auth-context";
import { MapPicker } from "@/components/ui/map-picker";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { staggerChildren: 0.1 }
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export default function DonorSettings() {
    const { user, refreshUser } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = React.useState(false);
    const [address, setAddress] = React.useState(user?.address || '');
    const [coords, setCoords] = React.useState(user?.coordinates || null);

    // Sync state when user data arrives/changes
    React.useEffect(() => {
        if (user) {
            setAddress(user.address || '');
            setCoords(user.coordinates || null);
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/users/profile', {
                address,
                coordinates: coords
            });

            await refreshUser();
            toast({
                title: "Settings Saved",
                description: "Your donor profile and base location have been updated.",
            });
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not update your settings. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 p-6 max-w-4xl"
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight">Donor Configuration</h1>
                <p className="text-muted-foreground">Manage your organization's base location and pickup preferences.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-8">
                    <motion.div variants={itemVariants}>
                        <Card className="border-border/50 h-full">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Organization Profile
                                </CardTitle>
                                <CardDescription>Your verified donor identity.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Organization Name</Label>
                                    <p className="font-bold text-lg">{user?.organization || user?.name}</p>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified Donor Partner</span>
                                </div>
                                <p className="text-xs text-muted-foreground italic px-1 font-medium">
                                    Note: Organization name and tax ID changes require admin verification. Please contact support to modify these details.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="border-border/50 bg-primary/5 border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase tracking-tight text-primary">Why precise location matters?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                    Our Smart Feed algorithm uses your base coordinates to match your donations with the closest available NGOs and volunteers. This minimizes transit time, ensuring that fresh food reaches those in need while still safe for consumption.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="space-y-8">
                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="h-full border-border/50 flex flex-col shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Navigation className="h-5 w-5 text-primary" />
                                    Base Location
                                </CardTitle>
                                <CardDescription>Set your primary pickup point for faster matching.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="h-80 w-full relative group rounded-2xl overflow-hidden border border-border/40">
                                    <MapPicker
                                        initialCenter={user?.coordinates?.lat ? user.coordinates : undefined}
                                        onLocationSelect={async (newLocation) => {
                                            setCoords(newLocation);
                                            // Reverse geocode to get a readable address
                                            try {
                                                const geocoder = new google.maps.Geocoder();
                                                const response = await geocoder.geocode({ location: newLocation });
                                                if (response.results[0]) {
                                                    setAddress(response.results[0].formatted_address);
                                                }
                                            } catch (error) {
                                                console.error("Reverse geocoding failed:", error);
                                            }
                                        }}
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-muted/50 border border-border/40">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                                            <span className="text-xs font-bold truncate">
                                                {address || "Location not set"}
                                            </span>
                                        </div>
                                        {coords && (
                                            <div className="text-[10px] text-muted-foreground font-mono ml-6">
                                                {coords.lat.toFixed(6)}°N, {coords.lng.toFixed(6)}°E
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full font-bold group h-12 rounded-xl h-14"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {isSaving ? "Saving Configuration..." : "Update Base Location"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
