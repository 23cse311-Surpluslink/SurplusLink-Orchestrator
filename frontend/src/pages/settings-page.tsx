import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Save, ArrowLeft, Loader2, Navigation, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

export function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

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
            await api.put('/users/profile', { address });
            await refreshUser();
            toast({
                title: "Location Updated",
                description: "Your permanent address and coordinates have been updated.",
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
            className="max-w-3xl mx-auto space-y-8 pb-24 px-4 sm:px-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4 -ml-2 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => navigate('/account')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Account
                    </Button>
                    <h1 className="text-3xl font-black tracking-tight">Location Settings</h1>
                    <p className="text-muted-foreground font-medium">Configure your base of operations</p>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden">
                <div className="h-32 w-full bg-gradient-to-r from-emerald-500 to-primary opacity-20" />
                <CardHeader className="px-8 -mt-12">
                    <div className="h-16 w-16 rounded-3xl bg-card border-4 border-background flex items-center justify-center shadow-lg mb-4">
                        <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-black">Base Location</CardTitle>
                    <CardDescription className="text-base font-medium">
                        This address is used to match you with nearby {user?.role === 'ngo' ? 'donations' : user?.role === 'donor' ? 'NGOs' : 'missions'}.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 py-6 space-y-8">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                            Permanent Address
                        </Label>
                        <div className="relative group">
                            <Input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter your full street address, city, and zip"
                                className="h-14 rounded-2xl pl-12 font-bold focus-visible:ring-primary shadow-sm border-border/40 transition-all group-hover:border-primary/30"
                            />
                            <MapPin className="absolute left-4 top-4 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <p className="text-xs text-muted-foreground px-1 font-medium italic">
                            Tip: Be specific (including city and postal code) for the most accurate geocoding.
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-muted/30 border border-border/40 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${coords ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {coords ? <CheckCircle2 className="h-6 w-6" /> : <Navigation className="h-6 w-6" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-sm uppercase tracking-tight">
                                    {coords ? "Geocoded Successfully" : "Status: Address Required"}
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {coords
                                        ? `Verified Position: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                                        : "Enter an address above to verify your coordinates on the global map."}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="px-8 pb-8 flex justify-end gap-4">
                    <Button
                        variant="ghost"
                        className="rounded-2xl h-14 px-8 font-bold text-muted-foreground"
                        onClick={() => navigate('/account')}
                    >
                        Discard
                    </Button>
                    <Button
                        className="rounded-2xl h-14 px-10 font-black uppercase text-[12px] gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        onClick={handleSave}
                        disabled={isSaving || !address.trim()}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Save Location
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="rounded-[2.5rem] border-none bg-primary/5 p-8 border border-primary/10">
                <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Navigation className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-black text-sm uppercase tracking-tight text-primary">Why is this important?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                            SurplusLink uses high-precision Geospatial Intelligence to minimize the time food spends in transit. By setting a permanent base location, we can prioritize the closest available resources to your organization, drastically reducing fuel waste and ensuring food safety.
                        </p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
