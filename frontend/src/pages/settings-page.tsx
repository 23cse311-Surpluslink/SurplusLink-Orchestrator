/** General user settings page */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Save, ArrowLeft, Loader2, Navigation, CheckCircle2, Sparkles, Languages, Eye, EyeOff, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/contexts/accessibility-context';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { MapPicker } from '@/components/ui/map-picker';
import { cn } from '@/lib/utils';

export function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const { simplifiedMode, setSimplifiedMode, highContrast, setHighContrast } = useAccessibility();

    const [notificationPrefs, setNotificationPrefs] = useState(user?.notificationPreferences || {
        enabled: true,
        channels: { email: true, push: true },
        types: { donations: true, missions: true, reminders: true }
    });

    const [address, setAddress] = useState(user?.address || '');
    const [isSaving, setIsSaving] = useState(false);
    const [coords, setCoords] = useState(user?.coordinates || null);

    useEffect(() => {
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
                coordinates: coords,
                notificationPreferences: notificationPrefs
            });
            await refreshUser();
            toast({
                title: "Location Updated",
                description: "Your permanent address and precise coordinates have been updated.",
            });
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not save your location settings. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto space-y-8 animate-fade-in px-4"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4 -ml-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
                        onClick={() => navigate('/account')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Profile
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight">Location <span className="text-primary">Intelligence</span></h1>
                    <p className="text-muted-foreground font-medium text-lg text-balance">Configure your high-precision distribution coordinates.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="rounded-2xl h-12 px-8 font-bold border-border/50 hover:bg-muted"
                        onClick={() => navigate('/account')}
                    >
                        Discard
                    </Button>
                    <Button
                        className="rounded-2xl h-12 px-10 font-black uppercase text-[12px] gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        onClick={handleSave}
                        disabled={isSaving || !address.trim()}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Save Configuration
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
                {/* Left Column: Map (Wide) */}
                <Card className="lg:col-span-3 rounded-[2.5rem] border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col min-h-[600px]">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-500 to-teal-500" />
                    <CardHeader className="px-8 pt-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                        <Navigation className="h-6 w-6" />
                                    </div>
                                    Geospatial Mapping
                                </CardTitle>
                                <CardDescription className="text-base font-medium">
                                    Drag the pin to your precise entrance location.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative">
                        <div className="absolute inset-x-8 inset-b-8 top-0 bottom-8">
                            <div className="h-full w-full rounded-[2rem] overflow-hidden border-4 border-card shadow-inner relative group">
                                <MapPicker
                                    initialCenter={user?.coordinates?.lat ? user.coordinates : undefined}
                                    onLocationSelect={async (newLocation) => {
                                        setCoords({ lat: newLocation.lat, lng: newLocation.lng });
                                        if (newLocation.address) {
                                            setAddress(newLocation.address);
                                            toast({
                                                title: "Location Verified",
                                                description: newLocation.address,
                                            });
                                        } else {
                                            try {
                                                const geocoder = new google.maps.Geocoder();
                                                const response = await geocoder.geocode({ location: newLocation });
                                                if (response.results[0]) {
                                                    setAddress(response.results[0].formatted_address);
                                                    toast({
                                                        title: "Location Verified",
                                                        description: response.results[0].formatted_address,
                                                    });
                                                }
                                            } catch (error) {
                                                console.error("Reverse geocoding failed:", error);
                                            }
                                        }
                                    }}
                                />
                                <div className="absolute top-4 right-4 z-10 p-3 bg-card/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl pointer-events-none">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Live Coordinates</p>
                                    <p className="text-xs font-mono font-bold">
                                        {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : "Positioning..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Information */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden">
                        <CardHeader className="px-8 pt-8">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Verified Address
                            </Label>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            <div className="relative group">
                                <Input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter your full street address"
                                    className="h-16 rounded-2xl pl-14 font-bold text-lg focus-visible:ring-primary shadow-sm border-border/40 transition-all group-hover:border-primary/30"
                                />
                                <MapPin className="absolute left-5 top-5 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>

                            <div className={cn(
                                "p-6 rounded-3xl border transition-all duration-500",
                                coords ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                        coords ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'
                                    )}>
                                        {coords ? <CheckCircle2 className="h-6 w-6" /> : <Loader2 className="h-6 w-6 animate-spin" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-sm uppercase tracking-tight">
                                            {coords ? "High-Precision Lock" : "Acquiring Signal..."}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                            {coords
                                                ? "Our AI matching engine has locked onto your specific GPS coordinates for optimized routing."
                                                : "Tap the map or type an address to enable geospatial intelligence."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none bg-primary/5 p-8 border border-primary/10 shadow-inner">
                        <div className="flex gap-5">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary shadow-sm">
                                <Sparkles className="h-6 w-6 fill-primary/20" />
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-primary">Operational Intelligence</h4>
                                <p className="text-[13px] text-muted-foreground leading-relaxed font-semibold">
                                    By setting a precise base location, you minimize "Cold-Chain Gap" time. We prioritize donors within your thermal capability zone to ensure food safety and zero-waste logistics.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden">
                        <CardHeader className="px-8 pt-8 text-center flex flex-col items-center">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                                <Bell className="h-6 w-6" />
                            </div>
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Notification Control Center
                            </Label>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            {/* Master Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Global Notifications</Label>
                                    <p className="text-[10px] text-muted-foreground font-medium">Enable/Disable all platform alerts.</p>
                                </div>
                                <Switch
                                    checked={notificationPrefs.enabled}
                                    onCheckedChange={(val) => setNotificationPrefs({ ...notificationPrefs, enabled: val })}
                                />
                            </div>

                            {/* Channels Section */}
                            <div className={cn("space-y-3 transition-opacity duration-300", !notificationPrefs.enabled && "opacity-40 animate-pulse pointer-events-none")}>
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Channels</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold">Email</Label>
                                            <Switch
                                                className="scale-75"
                                                checked={notificationPrefs.channels.email}
                                                onCheckedChange={(val) => setNotificationPrefs({
                                                    ...notificationPrefs,
                                                    channels: { ...notificationPrefs.channels, email: val }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold">In-App/Push</Label>
                                            <Switch
                                                className="scale-75"
                                                checked={notificationPrefs.channels.push}
                                                onCheckedChange={(val) => setNotificationPrefs({
                                                    ...notificationPrefs,
                                                    channels: { ...notificationPrefs.channels, push: val }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Categories */}
                            <div className={cn("space-y-3 transition-opacity duration-300", !notificationPrefs.enabled && "opacity-40 pointer-events-none")}>
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Categories</Label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'donations', label: 'Donation Updates', desc: 'Status changes & pickup alerts.' },
                                        { id: 'missions', label: 'Mission Coordination', desc: 'Volunteer activity & matching.' },
                                        { id: 'reminders', label: 'Safety & Expiry', desc: 'Nudges for high-urgency items.' }
                                    ].map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold">{cat.label}</Label>
                                                <p className="text-[9px] text-muted-foreground font-medium">{cat.desc}</p>
                                            </div>
                                            <Switch
                                                checked={notificationPrefs.types[cat.id as keyof typeof notificationPrefs.types]}
                                                onCheckedChange={(val) => setNotificationPrefs({
                                                    ...notificationPrefs,
                                                    types: { ...notificationPrefs.types, [cat.id]: val }
                                                })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden">
                        <CardHeader className="px-8 pt-8 text-center flex flex-col items-center">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                                <Eye className="h-6 w-6" />
                            </div>
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Visual Accessibility
                            </Label>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Simplified Mode</Label>
                                    <p className="text-[10px] text-muted-foreground font-medium">Larger text & minimalist layouts.</p>
                                </div>
                                <Switch
                                    checked={simplifiedMode}
                                    onCheckedChange={setSimplifiedMode}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">High Contrast</Label>
                                    <p className="text-[10px] text-muted-foreground font-medium">Maximum readability colors.</p>
                                </div>
                                <Switch
                                    checked={highContrast}
                                    onCheckedChange={setHighContrast}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden">
                        <CardHeader className="px-8 pt-8 text-center flex flex-col items-center">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                                <Languages className="h-6 w-6" />
                            </div>
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Language Preferences
                            </Label>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 flex flex-col gap-3">
                            <Button
                                variant={i18n.language?.startsWith('en') ? 'default' : 'outline'}
                                className="rounded-xl h-12 font-bold justify-between px-6"
                                onClick={() => i18n.changeLanguage('en')}
                            >
                                English (US)
                                {i18n.language?.startsWith('en') && <CheckCircle2 className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant={i18n.language?.startsWith('hi') ? 'default' : 'outline'}
                                className="rounded-xl h-12 font-bold justify-between px-6"
                                onClick={() => i18n.changeLanguage('hi')}
                            >
                                हिंदी (Hindi)
                                {i18n.language?.startsWith('hi') && <CheckCircle2 className="h-4 w-4" />}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
