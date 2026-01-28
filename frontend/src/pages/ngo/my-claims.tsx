import { useState, useEffect } from 'react';
import { Donation } from '@/types';
import DonationService from '@/services/donation.service';
import { DonationCard } from '@/components/common/donation-card';
import { RatingDialog } from '@/components/ngo/rating-dialog';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MyClaimsPage() {
    const { toast } = useToast();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [completingId, setCompletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const data = await DonationService.getMyDonations();
            // Filter for active claims (assigned)
            // Or maybe the API returns all. We can filter client side if needed.
            // Assuming we want 'assigned' ones specifically for "Active Deliveries"
            // But maybe 'picked_up' too?
            const activeClaims = data.filter(d => ['assigned', 'picked_up'].includes(d.status));
            setDonations(activeClaims);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load claims.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteClick = (id: string) => {
        setCompletingId(id);
    };

    const handleRatingConfirm = async (rating: number, comment: string) => {
        if (!completingId) return;

        try {
            await DonationService.completeDonation(completingId, rating, comment);
            toast({
                title: "Donation Completed",
                description: "Thank you for confirming receipt and rating!",
                variant: "default",
            });
            // Remove from list or refresh
            setDonations(prev => prev.filter(d => d.id !== completingId));
            setCompletingId(null);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to complete donation.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto py-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Active Deliveries</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : donations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No active deliveries found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donations.map((donation) => (
                        <div key={donation.id} className="relative group">
                            <DonationCard
                                donation={donation}
                                // We don't use standard actions from card here, we want "Confirm Receipt"
                                showActions={false}
                            />
                            <div className="mt-2">
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleCompleteClick(donation.id)}
                                >
                                    Confirm Receipt
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <RatingDialog
                isOpen={!!completingId}
                onClose={() => setCompletingId(null)}
                onConfirm={handleRatingConfirm}
            />
        </div>
    );
}
