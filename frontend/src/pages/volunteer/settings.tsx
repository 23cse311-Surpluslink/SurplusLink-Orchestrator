import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Truck, Bike, Car, HardHat, MapPin, Save, Navigation } from "lucide-react";
import * as React from "react";
import { useAuth } from "@/contexts/auth-context";

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
    const { user, updateVolunteerVehicle } = useAuth();
    const [capacity, setCapacity] = React.useState([user?.volunteerProfile?.maxWeight || 50]);
    const [vehicle, setVehicle] = React.useState<'bicycle' | 'scooter' | 'car' | 'van'>(
        (user?.volunteerProfile?.vehicleType as any) || "bicycle"
    );

    const handleSave = async () => {
        await updateVolunteerVehicle(vehicle, capacity[0]);
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
                                    onValueChange={(v) => v && setVehicle(v as any)}
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

                    {/* Capacity Slider */}
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
                    {/* Location Preview */}
                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="h-full border-border/50 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Navigation className="h-5 w-5 text-primary" />
                                    Positioning
                                </CardTitle>
                                <CardDescription>Your current operational zone.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden border border-border/50 group">
                                    <div className="absolute inset-0 bg-[url('https://api.placeholder.com/600/400')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

                                    {/* Mock Map UI elements */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                                            <div className="relative bg-primary h-4 w-4 rounded-full border-2 border-white shadow-xl" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-md p-3 rounded-xl border border-border/50 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span className="text-xs font-bold truncate">Koramangala, Bangalore (1.2km radius)</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full font-bold group" onClick={handleSave}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Configuration
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
