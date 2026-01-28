import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { DonationCard } from '@/components/common/donation-card';
import { MapPlaceholder } from '@/components/common/map-placeholder';
import { useToast } from '@/hooks/use-toast';
import DonationService from '@/services/donation.service';
import { Donation } from '@/types';
import { RejectionModal } from '@/components/ngo/rejection-modal';
import { Loader2, MapPin, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';

export function NearbyDonationsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    const isVerified = user?.status === 'active';

    const fetchFeed = useCallback(async () => {
        try {
            const data = await DonationService.getSmartFeed();
            setDonations(data.donations);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load nearby donations.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const handleClaim = async (id: string) => {
        try {
            setDonations(prev => prev.filter(d => d.id !== id));
            toast({ title: "Donation Claimed!", description: "Check 'Accepted Donations' for next steps." });
            await DonationService.claimDonation(id);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to claim donation.", variant: "destructive" });
            fetchFeed();
        }
    };

    const handleRejectConfirm = async (reason: string) => {
        if (!rejectingId) return;
        try {
            const id = rejectingId;
            setRejectingId(null);
            setDonations(prev => prev.filter(d => d.id !== id));
            await DonationService.rejectDonation(id, reason);
            toast({ title: "Donation Rejected", description: "Preference saved." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to reject donation.", variant: "destructive" });
            fetchFeed();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Nearby Donations"
                description="Find available food items in your vicinity."
            />

            <Tabs defaultValue="list" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            List View
                        </TabsTrigger>
                        <TabsTrigger value="map" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Map View
                        </TabsTrigger>
                    </TabsList>
                    <span className="text-sm text-muted-foreground">{donations.length} items found</span>
                </div>

                <TabsContent value="list" className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/30">
                            <p className="text-muted-foreground">No donations available nearby at this moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {donations.map(d => (
                                <DonationCard
                                    key={d.id}
                                    donation={d}
                                    showActions
                                    onAccept={handleClaim}
                                    onReject={setRejectingId}
                                    disabled={!isVerified}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="map">
                    <MapPlaceholder className="h-[600px]">
                        {/* In a real implementation, we would map over donations and place markers here */}
                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur p-4 rounded-lg shadow-lg border text-left">
                            <h4 className="font-semibold text-sm mb-2">Live Pickups</h4>
                            <div className="space-y-2">
                                {donations.slice(0, 3).map(d => (
                                    <div key={d.id} className="text-xs flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="font-medium">{d.foodType}</span>
                                        <span className="text-muted-foreground">- {d.location}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </MapPlaceholder>
                </TabsContent>
            </Tabs>

            <RejectionModal
                isOpen={!!rejectingId}
                onClose={() => setRejectingId(null)}
                onConfirm={handleRejectConfirm}
            />
        </div>
    );
}
