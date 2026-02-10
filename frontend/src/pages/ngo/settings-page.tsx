import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import NgoService, { NgoProfile } from '@/services/ngo.service';
import { Loader2, Save, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapPicker } from '@/components/ui/map-picker';

export function NgoSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [capacity, setCapacity] = useState<number>(50);
    const [facilities, setFacilities] = useState<string[]>([]);
    const [isUrgent, setIsUrgent] = useState(false);
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch fresh profile data
                const { data } = await api.get('/users/profile');
                if (data.ngoProfile) {
                    setCapacity(data.ngoProfile.dailyCapacity || 50);
                    setFacilities(data.ngoProfile.storageFacilities || []);
                    setIsUrgent(data.ngoProfile.isUrgentNeed || false);
                    setAddress(data.address || '');
                    setCoords(data.coordinates || null);
                }
            } catch (error) {
                console.error("Failed to fetch NGO profile", error);
                toast({
                    title: "Error",
                    description: "Could not load your current settings.",
                    variant: "destructive",
                });
            }
        };
        fetchSettings();
    }, [toast]);

    const handleFacilityChange = (facility: string, checked: boolean) => {
        if (checked) {
            setFacilities([...facilities, facility]);
        } else {
            setFacilities(facilities.filter(f => f !== facility));
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast({
                title: "Not Supported",
                description: "Geolocation is not supported by your browser.",
                variant: "destructive",
            });
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCoords(newCoords);

                // New: Reverse Geocode to get the real address
                const fetchAddress = async () => {
                    try {
                        const { data } = await api.post('/users/reverse-geocode', newCoords);
                        if (data.address) {
                            setAddress(data.address);
                            toast({
                                title: "Address Found!",
                                description: data.address,
                            });
                        }
                    } catch (err) {
                        console.error("Reverse geocoding failed", err);
                    }
                };
                fetchAddress();

                setFetchingLocation(false);
            },
            (error) => {
                setFetchingLocation(false);
                console.error("Error fetching location", error);
                toast({
                    title: "Location Error",
                    description: "Please allow location access to fetch coordinates.",
                    variant: "destructive",
                });
            }
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const profile: NgoProfile = {
                dailyCapacity: capacity,
                storageFacilities: facilities,
                isUrgentNeed: isUrgent
            };

            // First update the user profile (address and coordinates)
            await api.put('/users/profile', { address, coordinates: coords });

            // Then update the NGO-specific settings
            await NgoService.updateNgoProfile(profile);
            toast({
                title: "Settings Saved",
                description: "Your NGO profile has been updated successfully.",
                variant: "default",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-black tracking-tight">Organization <span className="text-primary">Settings</span></h1>
                <p className="text-muted-foreground font-medium">Configure your operational capacity and logistics preferences.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Location & Core Info */}
                <div className="space-y-8">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary/40" />
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Base of Operations
                            </CardTitle>
                            <CardDescription>
                                Set your primary distribution center location.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>Base Location & Area</Label>
                                <p className="text-xs text-muted-foreground font-medium">Select your organization's precise location on the map.</p>
                                <div className="h-80 w-full relative rounded-xl overflow-hidden border border-border/50">
                                    <MapPicker
                                        initialCenter={coords || undefined}
                                        onLocationSelect={async (newLocation) => {
                                            setCoords({ lat: newLocation.lat, lng: newLocation.lng });
                                            if (newLocation.address) {
                                                setAddress(newLocation.address);
                                            } else {
                                                // Fallback: Reverse geocode to get a readable address
                                                try {
                                                    const geocoder = new google.maps.Geocoder();
                                                    const response = await geocoder.geocode({ location: newLocation });
                                                    if (response.results[0]) {
                                                        setAddress(response.results[0].formatted_address);
                                                    }
                                                } catch (error) {
                                                    console.error("Reverse geocoding failed:", error);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="address" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Office Address</Label>
                                <div className="relative group">
                                    <Input
                                        id="address"
                                        placeholder="Enter your NGO's main location"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="h-12 rounded-xl bg-background/50 border-border/50 group-hover:border-primary/30 transition-all font-medium"
                                    />
                                </div>
                                {coords && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">
                                            GPS Locked: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="capacity" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Daily Distribution Capacity</Label>
                                <div className="relative group">
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={capacity}
                                        onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                                        min={0}
                                        className="h-12 rounded-xl bg-background/50 border-border/50 group-hover:border-primary/30 transition-all font-bold text-lg"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Meals / Day</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium italic">
                                    This helps our AI prioritize donations you can actually handle.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Facilities & Urgency */}
                <div className="space-y-8">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-emerald-400" />
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Save className="h-5 w-5 text-teal-500" />
                                Storage Capabilities
                            </CardTitle>
                            <CardDescription>
                                Match with food that requires specific handling.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-3 p-1">
                                {[
                                    { id: 'dry', label: 'Dry Storage', icon: '🍞', desc: 'Pantry, Shelves, Room Temp' },
                                    { id: 'cold', label: 'Cold Storage', icon: '❄️', desc: 'Refrigerators' },
                                    { id: 'frozen', label: 'Frozen Storage', icon: '🧊', desc: 'Deep Freezers' },
                                ].map((facility) => (
                                    <label
                                        key={facility.id}
                                        htmlFor={facility.id}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                            facilities.includes(facility.id)
                                                ? "border-primary/40 bg-primary/5 shadow-inner"
                                                : "border-border/50 bg-background/30 hover:border-border"
                                        )}
                                    >
                                        <Checkbox
                                            id={facility.id}
                                            checked={facilities.includes(facility.id)}
                                            onCheckedChange={(c) => handleFacilityChange(facility.id, c as boolean)}
                                            className="size-5 rounded-md"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{facility.icon}</span>
                                                <span className="font-bold text-sm tracking-tight">{facility.label}</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{facility.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        "border-none transition-all duration-500",
                        isUrgent ? "bg-red-500 shadow-2xl shadow-red-500/20" : "bg-card/50 backdrop-blur-sm border-border/50"
                    )}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="urgency-mode" className={cn("text-lg font-black uppercase tracking-tighter", isUrgent ? "text-white" : "text-yellow-400")}>
                                            Urgent Need Mode
                                        </Label>
                                    </div>
                                    <p className={cn("text-xs font-semibold max-w-[280px]", isUrgent ? "text-red-50" : "text-yellow-400/70")}>
                                        Turn this on to flag your NGO for priority donations in your local area during crises.
                                    </p>
                                </div>
                                <Switch
                                    id="urgency-mode"
                                    checked={isUrgent}
                                    onCheckedChange={setIsUrgent}
                                    className={cn(
                                        "scale-125",
                                        isUrgent ? "data-[state=checked]:bg-white data-[state=checked]:text-red-600" : "data-[state=checked]:bg-red-600"
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        variant="hero"
                        className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-3"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Commit Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
