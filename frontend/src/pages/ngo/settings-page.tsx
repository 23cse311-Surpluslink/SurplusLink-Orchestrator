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
import { Loader2, Save } from 'lucide-react';

export function NgoSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [capacity, setCapacity] = useState<number>(50);
    const [facilities, setFacilities] = useState<string[]>([]);
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch fresh profile data
                const { data } = await api.get('/users/profile');
                if (data.ngoProfile) {
                    setCapacity(data.ngoProfile.dailyCapacity || 50);
                    setFacilities(data.ngoProfile.storageFacilities || []);
                    setIsUrgent(data.ngoProfile.isUrgentNeed || false);
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

    const handleSave = async () => {
        setLoading(true);
        try {
            const profile: NgoProfile = {
                dailyCapacity: capacity,
                storageFacilities: facilities,
                isUrgentNeed: isUrgent
            };
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
        <div className="container mx-auto py-8 max-w-2xl animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">NGO Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Operational Capabilities</CardTitle>
                    <CardDescription>
                        Configure your capacity and facilities to match with appropriate donations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="capacity">Daily Meal Capacity</Label>
                            <p className="text-sm text-muted-foreground">Approximate number of meals you can distribute/store per day.</p>
                            <Input
                                id="capacity"
                                type="number"
                                value={capacity}
                                onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                                min={0}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Storage Facilities</Label>
                        <p className="text-sm text-muted-foreground mb-2">Select all that apply to your facility.</p>
                        <div className="grid gap-3 border rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="cold"
                                    checked={facilities.includes('cold')}
                                    onCheckedChange={(c) => handleFacilityChange('cold', c as boolean)}
                                />
                                <Label htmlFor="cold" className="flex items-center gap-2 cursor-pointer">
                                    ❄️ Cold Storage <span className="text-xs text-muted-foreground">(Refrigeration)</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="dry"
                                    checked={facilities.includes('dry')}
                                    onCheckedChange={(c) => handleFacilityChange('dry', c as boolean)}
                                />
                                <Label htmlFor="dry" className="flex items-center gap-2 cursor-pointer">
                                    🍞 Dry Storage <span className="text-xs text-muted-foreground">(Shelves, Pantry)</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="frozen"
                                    checked={facilities.includes('frozen')}
                                    onCheckedChange={(c) => handleFacilityChange('frozen', c as boolean)}
                                />
                                <Label htmlFor="frozen" className="flex items-center gap-2 cursor-pointer">
                                    🧊 Frozen Storage <span className="text-xs text-muted-foreground">(Deep Freezers)</span>
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between space-x-2 border border-red-200 bg-red-50 p-4 rounded-lg my-6">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="urgency-mode" className="text-red-900 font-semibold flex items-center gap-2">
                                🔴 Urgent Help Needed
                            </Label>
                            <span className="text-sm text-red-700">
                                Turn this on to flag your NGO for priority donations locally.
                            </span>
                        </div>
                        <Switch
                            id="urgency-mode"
                            checked={isUrgent}
                            onCheckedChange={setIsUrgent}
                            className="data-[state=checked]:bg-red-600"
                        />
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
