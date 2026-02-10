import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Truck, Bike, Car, HardHat, MapPin, Save, Navigation } from "lucide-react";
import * as React from "react";
import { useAuth } from "@/contexts/auth-context";
import { MapPicker } from "@/components/ui/map-picker";
import api from "@/lib/api";

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

export default function VolunteerSettings() {
    const { user, updateVolunteerVehicle, refreshUser } = useAuth();
    const [isSaving, setIsSaving] = React.useState(false);
    const [capacity, setCapacity] = React.useState([user?.volunteerProfile?.maxWeight || 50]);
    const [vehicle, setVehicle] = React.useState<'bicycle' | 'scooter' | 'car' | 'van'>(
        (user?.volunteerProfile?.vehicleType as 'bicycle' | 'scooter' | 'car' | 'van') || "bicycle"
    );
    const [address, setAddress] = React.useState(user?.address || '');
    const [coords, setCoords] = React.useState(user?.coordinates || null);

    // Sync state when user data arrives/changes
    React.useEffect(() => {
        if (user) {
            setCapacity([user.volunteerProfile?.maxWeight || 50]);
            setVehicle((user.volunteerProfile?.vehicleType as 'bicycle' | 'scooter' | 'car' | 'van') || "bicycle");
            setAddress(user.address || '');
            setCoords(user.coordinates || null);
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update Vehicle info
            await updateVolunteerVehicle(vehicle, capacity[0]);

            // Update Location if changed
            await api.put('/users/profile', {
                address,
                coordinates: coords
            });

            await refreshUser();
        } catch (error) {
            console.error("Failed to save settings:", error);
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
                <h1 className="text-3xl font-black tracking-tight">Vehicle Configuration</h1>
                <p className="text-muted-foreground">Setup your delivery preferences and capacity limits.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-8">
                    {/* Vehicle Selection */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-primary" />
                                    Primary Vehicle
                                </CardTitle>
                                <CardDescription>What vehicle will you use for rescues?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ToggleGroup
                                    type="single"
                                    value={vehicle}
                                    onValueChange={(v) => v && setVehicle(v as 'bicycle' | 'scooter' | 'car' | 'van')}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <ToggleGroupItem
                                        value="bicycle"
                                        className="h-24 flex-col gap-2 border-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                                    >
                                        <Bike className="h-8 w-8" />
                                        <span className="font-bold">Bicycle</span>
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="scooter"
                                        className="h-24 flex-col gap-2 border-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                                    >
                                        <HardHat className="h-8 w-8" />
                                        <span className="font-bold">Scooter</span>
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="car"
                                        className="h-24 flex-col gap-2 border-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                                    >
                                        <Car className="h-8 w-8" />
                                        <span className="font-bold">Car</span>
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="van"
                                        className="h-24 flex-col gap-2 border-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                                    >
                                        <Truck className="h-8 w-8" />
                                        <span className="font-bold">Van</span>
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-xl">Payload Capacity</CardTitle>
                                <CardDescription>Maximum weight you can carry safely.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="text-4xl font-black text-primary">{capacity[0]}<span className="text-sm text-muted-foreground ml-1">kg</span></div>
                                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Limit reached</div>
                                </div>
                                <Slider
                                    value={capacity}
                                    onValueChange={setCapacity}
                                    max={500}
                                    step={5}
                                    className="py-4"
                                />
                                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                    <span>0 KG</span>
                                    <span>250 KG</span>
                                    <span>500 KG</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="space-y-8">
                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="h-full border-border/50 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Navigation className="h-5 w-5 text-primary" />
                                    Positioning
                                </CardTitle>
                                <CardDescription>Set your operational base for mission routing.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="h-80 w-full relative group">
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
                                                {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full font-bold group h-12 rounded-xl"
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
                                    {isSaving ? "Saving..." : "Save Configuration"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
