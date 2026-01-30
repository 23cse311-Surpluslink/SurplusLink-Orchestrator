import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import DonationService from '@/services/donation.service';
import { Donation } from '@/types';
import { PageHeader } from '@/components/common/page-header';
import { DonationCard } from '@/components/common/donation-card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Package, Navigation } from 'lucide-react';
import { VolunteerTrackerModal } from '@/components/common/volunteer-tracker-modal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function MyClaimsPage() {
    const { toast } = useToast();
    const [claims, setClaims] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    // Tracker Modal State
    const [trackingDonation, setTrackingDonation] = useState<Donation | null>(null);

    // Rating Modal State
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadClaims = useCallback(async () => {
        setLoading(true);
        try {
            const data = await DonationService.getClaimedDonations();
            setClaims(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load your claimed donations.",
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadClaims();
    }, [loadClaims]);

    const handleComplete = async () => {
        if (!selectedDonation) return;
        setSubmitting(true);
        try {
            await DonationService.completeDonation(selectedDonation.id, parseInt(rating), comment);
            toast({
                title: "Delivery Completed Successfully! 🎉",
                description: "Thank you for confirming receipt. The loop is closed.",
                className: "bg-emerald-600 text-white border-none shadow-xl"
            });
            setSelectedDonation(null);
            setComment('');
            setRating('5');
            loadClaims(); // Refresh list
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit feedback.",
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const activeClaims = claims.filter(d => ['assigned', 'accepted', 'at_pickup', 'picked_up', 'at_delivery', 'delivered'].includes(d.status));
    const historyClaims = claims.filter(d => ['completed'].includes(d.status));

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Accepted Deliveries"
                description="Manage pickup and confirm receipt of donations you have claimed."
            />

            <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Active Pickups
                </h3>

                {loading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                ) : activeClaims.length === 0 ? (
                    <div className="p-8 border-2 border-dashed rounded-xl text-center text-muted-foreground">
                        No active pickups. Go to the feed to claim donations.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeClaims.map(claim => (
                            <div key={claim.id} className="relative group flex flex-col h-full">
                                <DonationCard donation={claim} />
                                <div className="mt-4 space-y-2">
                                    {(['accepted', 'at_pickup', 'picked_up', 'at_delivery'].includes(claim.status)) && (
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary h-11 font-bold"
                                            onClick={() => setTrackingDonation(claim)}
                                        >
                                            <Navigation className="h-4 w-4" />
                                            Track Volunteer
                                        </Button>
                                    )}
                                    <Button
                                        className="w-full gap-2 h-11 font-bold"
                                        onClick={() => setSelectedDonation(claim)}
                                        variant="hero"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Verify Receipt
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground font-medium">
                                        Click after you have received the items.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <VolunteerTrackerModal
                isOpen={!!trackingDonation}
                onClose={() => setTrackingDonation(null)}
                donation={trackingDonation}
            />

            {historyClaims.length > 0 && (
                <div className="space-y-6 pt-8 border-t">
                    <h3 className="text-lg font-bold text-muted-foreground">History</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                        {historyClaims.map(claim => (
                            <DonationCard key={claim.id} donation={claim} disabled />
                        ))}
                    </div>
                </div>
            )}

            {/* Rating Dialog */}
            <Dialog open={!!selectedDonation} onOpenChange={(o) => !o && setSelectedDonation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify & Complete Pickup</DialogTitle>
                        <DialogDescription>
                            Confirm that you have physically received the items from the donor.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rate Interaction</Label>
                            <ToggleGroup type="single" value={rating} onValueChange={(v) => v && setRating(v)} className="justify-start">
                                {[1, 2, 3, 4, 5].map(r => (
                                    <ToggleGroupItem key={r} value={r.toString()} className="h-10 w-10 data-[state=on]:bg-yellow-100 data-[state=on]:text-yellow-700 font-bold border">
                                        {r}★
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                        <div className="space-y-2">
                            <Label>Comments (Optional)</Label>
                            <Textarea
                                placeholder="Was the packaging good? Was the food handled safely?"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedDonation(null)}>Cancel</Button>
                        <Button onClick={handleComplete} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit & Complete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
