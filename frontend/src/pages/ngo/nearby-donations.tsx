import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import DonationService from '@/services/donation.service';
import { Donation } from '@/types';
import { PageHeader } from '@/components/common/page-header';
import { DonationCard } from '@/components/common/donation-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Filter, AlertCircle } from 'lucide-react';
import { getTimeUntil } from '@/utils/formatters';

export function NearbyDonationsPage() {
    const { toast } = useToast();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    // Filters
    const [foodType, setFoodType] = useState('all');
    const [onlyExpiring, setOnlyExpiring] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Rejection State
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const loadFeed = useCallback(async () => {
        setLoading(true);
        try {
            const data = await DonationService.getSmartFeed();
            setDonations(data.donations);
        } catch (error) {
            console.error(error);
            toast({
                title: "Failed to load feed",
                description: "Could not fetch nearby donations. Please try again.",
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadFeed();
    }, [loadFeed]);

    const handleClaim = async (id: string) => {
        try {
            await DonationService.claimDonation(id);
            toast({
                title: "Donation Claimed!",
                description: "This item has been moved to your 'Accepted' list. Please arrange pickup.",
                className: "bg-green-50 border-green-200 text-green-800"
            });
            loadFeed();
        } catch (error) {
            console.error(error);
            toast({
                title: "Claim Failed",
                description: "Could not claim this donation. It might have been taken.",
                variant: 'destructive'
            });
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectId) return;
        setIsRejecting(true);
        try {
            await DonationService.rejectDonation(rejectId, rejectReason);
            toast({
                title: "Donation Hidden",
                description: "We won't show this donation to you again.",
            });
            setRejectId(null);
            setRejectReason('');
            loadFeed();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to reject donation.",
                variant: 'destructive'
            });
        } finally {
            setIsRejecting(false);
        }
    };

    const filteredDonations = donations.filter(d => {
        // Search
        if (searchQuery && !(d.title || d.foodType).toLowerCase().includes(searchQuery.toLowerCase())) return false;
        // Food Category
        if (foodType !== 'all' && d.foodCategory?.toLowerCase() !== foodType.toLowerCase()) return false;
        // Expiry (<24h)
        if (onlyExpiring) {
            const timeLeft = getTimeUntil(d.expiryTime);
            if (timeLeft.includes('d')) return false;
        }
        return true;
    });

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-0 md:gap-6 animate-fade-in -mx-4 md:mx-0">
            {/* Left: List & Filters */}
            <div className="flex-1 flex flex-col h-full overflow-hidden md:rounded-xl md:border bg-background">
                {/* Header & Filters */}
                <div className="p-4 border-b space-y-4 bg-muted/10">
                    <PageHeader
                        title="Nearby Donations"
                        description="Live feed of food available for rescue in your area."
                        className="mb-0"
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Search food items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Select value={foodType} onValueChange={setFoodType}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="cooked">Cooked</SelectItem>
                                <SelectItem value="raw">Raw</SelectItem>
                                <SelectItem value="packaged">Packaged</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="expiring"
                            checked={onlyExpiring}
                            onCheckedChange={(c) => setOnlyExpiring(c as boolean)}
                        />
                        <Label htmlFor="expiring" className="text-sm cursor-pointer">
                            Expiring Soon (within 24h)
                        </Label>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredDonations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-center text-muted-foreground p-8">
                            <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                            <h3 className="font-bold text-lg">No donations found</h3>
                            <p className="text-sm max-w-xs mt-1">
                                Try adjusting your filters or expanding your search radius in settings.
                            </p>
                        </div>
                    ) : (
                        filteredDonations.map(donation => (
                            <DonationCard
                                key={donation.id}
                                donation={donation}
                                showActions
                                onAccept={handleClaim}
                                onReject={(id) => setRejectId(id)}
                                disabled={donation.status !== 'active'}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Right: Map Placeholder */}
            <div className="hidden md:flex w-[400px] xl:w-[500px] flex-col rounded-xl border overflow-hidden bg-slate-50 relative">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <div className="text-center space-y-4 p-8">
                        <div className="relative mx-auto h-32 w-32 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                            <MapPin className="h-16 w-16 text-blue-500" />
                            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping" />
                        </div>
                        <h3 className="font-bold text-slate-700">Live Map</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                            Visualizing {filteredDonations.length} active donations within your operational radius.
                        </p>
                    </div>
                </div>
                {/* Overlay Stats */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-sm border text-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="font-bold">10 km</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Closest:</span>
                        <span className="font-bold">1.2 km</span>
                    </div>
                </div>
            </div>

            {/* Rejection Dialog */}
            <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Donation</DialogTitle>
                        <DialogDescription>
                            Let us know why you are rejecting this donation. This helps improve future matches.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Label className="mb-2 block">Reason (Optional)</Label>
                        <Textarea
                            placeholder="e.g., Too far, Insufficient storage, Not needed..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmReject} disabled={isRejecting}>
                            {isRejecting ? 'Rejecting...' : 'Reject Donation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
