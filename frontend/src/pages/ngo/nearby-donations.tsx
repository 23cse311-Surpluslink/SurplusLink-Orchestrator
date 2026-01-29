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
import { Loader2, MapPin, Filter, AlertCircle, Search } from 'lucide-react';
import { getTimeUntil } from '@/utils/formatters';

export function NearbyDonationsPage() {
    const { toast } = useToast();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [foodType, setFoodType] = useState('all');
    const [onlyExpiring, setOnlyExpiring] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectCategory, setRejectCategory] = useState<string>('');
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const loadFeed = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await DonationService.getSmartFeed();
            setDonations(data.donations);
        } catch (error) {
            console.error(error);
            if (!silent) {
                toast({
                    title: "Failed to load feed",
                    description: "Could not fetch nearby donations. Please try again.",
                    variant: 'destructive'
                });
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadFeed();
        const interval = setInterval(() => loadFeed(true), 15000); // 15s Live Feed
        return () => clearInterval(interval);
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
        if (!rejectId || !rejectCategory) {
            toast({ title: "Reason Required", description: "Please select a safety category.", variant: "destructive" });
            return;
        }
        setIsRejecting(true);
        try {
            const finalReason = `[${rejectCategory}] ${rejectReason}`;
            await DonationService.rejectDonation(rejectId, finalReason);
            toast({
                title: "Donation Flagged",
                description: "Thank you for helping keep the platform safe.",
            });
            setRejectId(null);
            setRejectCategory('');
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
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 animate-fade-in -mx-4 md:mx-0 md:h-[calc(100vh-4rem)]">
            <div className="flex-1 flex flex-col h-full overflow-hidden md:rounded-xl md:border bg-background">
                <div className="p-4 border-b space-y-4 bg-muted/10">
                    <PageHeader
                        title="Nearby Donations"
                        description="Live feed of food available for rescue in your area."
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Search food items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredDonations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 animate-in fade-in duration-500">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                <div className="bg-background relative p-4 rounded-full border shadow-sm">
                                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-foreground mb-2">No donations found</h3>
                            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                                We couldn't find any donations matching your current filters. Try expanding your search radius or clearing filters.
                            </p>
                            <Button variant="outline" onClick={() => { setSearchQuery(''); setFoodType('all'); setOnlyExpiring(false); }} className="rounded-full px-6">
                                Clear Filters
                            </Button>
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

            <div className="flex w-full md:w-[400px] xl:w-[500px] h-[350px] md:h-auto shrink-0 flex-col rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50 relative shadow-xl transition-all duration-500 hover:shadow-2xl mt-4 md:mt-0">
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                    <div className="absolute inset-0 opacity-[0.4]"
                        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    </div>

                    <div className="text-center space-y-6 p-8 relative z-10">
                        <div className="relative mx-auto h-32 w-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                            <MapPin className="h-12 w-12 text-blue-500 animate-bounce drop-shadow-md" />
                            <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full animate-ping duration-[3000ms]" />
                            <div className="absolute inset-0 border border-blue-500/20 rounded-full animate-[ping_4s_ease-out_infinite]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-800 text-xl tracking-tight">Live Donation Map</h3>
                            <p className="text-sm text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                                Monitoring <span className="text-blue-600 font-bold">{filteredDonations.length}</span> active sources in your network.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-sm">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-slate-600 font-medium">System Online</span>
                        </div>
                        <span className="text-slate-400 font-mono tracking-wider">RADAR: ACTIVE</span>
                    </div>
                </div>
            </div>

            <Dialog open={!!rejectId} onOpenChange={(o) => {
                if (!o) {
                    setRejectId(null);
                    setRejectCategory('');
                    setRejectReason('');
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Safety Concern</DialogTitle>
                        <DialogDescription>
                            Flagging this donation helps protect the community. The donor will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Primary Concern</Label>
                            <Select onValueChange={setRejectCategory} value={rejectCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a safety category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Safety: Hygiene">Hygiene / Safety Risk</SelectItem>
                                    <SelectItem value="Safety: Expired">Expired / Spoiled Food</SelectItem>
                                    <SelectItem value="Safety: Storage">Improper Storage</SelectItem>
                                    <SelectItem value="Logistics: Distance">Logistics / Too Far</SelectItem>
                                    <SelectItem value="Other">Other Reason</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Additional Details (Optional)</Label>
                            <Textarea
                                placeholder="Describe the issue (e.g., 'Uncovered food', 'Visible mold')..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="resize-none"
                            />
                        </div>

                        {rejectCategory?.startsWith('Safety') && (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-2 text-sm text-amber-800 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>This will flag the donation and notify the donor immediately.</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setRejectId(null);
                            setRejectCategory('');
                            setRejectReason('');
                        }}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmReject} disabled={isRejecting || !rejectCategory}>
                            {isRejecting ? 'Submitting...' : 'Flag & Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
