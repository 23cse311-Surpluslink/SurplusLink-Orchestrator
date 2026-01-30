import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { PlusCircle, AlertCircle, Clock, MapPin, Package, Navigation } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/common/page-header';
import { DonationCard } from '@/components/common/donation-card';
import { VolunteerTrackerModal } from '@/components/common/volunteer-tracker-modal';
import DonationService from '@/services/donation.service';
import { format } from 'date-fns';
import { Donation } from '@/types';

export default function DonorDonations() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [trackingDonation, setTrackingDonation] = useState<Donation | null>(null);

    const { data: donations, isLoading } = useQuery({
        queryKey: ['my-donations'],
        queryFn: DonationService.getMyDonations,
        enabled: !!user,
        refetchInterval: 15000,
    });

    const cancelMutation = useMutation({
        mutationFn: DonationService.cancelDonation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-donations'] });
            toast({
                title: "Donation Cancelled",
                description: "The donation has been successfully cancelled.",
            });
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast({
                variant: "destructive",
                title: "Error",
                description: apiError.response?.data?.message || (error instanceof Error ? error.message : "Failed to cancel donation."),
            });
        }
    });

    const handleCancel = (id: string) => {
        if (confirm("Are you sure you want to cancel this donation?")) {
            cancelMutation.mutate(id);
        }
    };

    const mappedDonations = donations || [];

    const pendingDonations = mappedDonations.filter(d => d.status === 'active');
    const activeDonations = mappedDonations.filter(d => ['assigned', 'accepted', 'at_pickup', 'picked_up', 'at_delivery', 'delivered'].includes(d.status));
    const completedDonations = mappedDonations.filter(d => ['completed', 'expired', 'cancelled', 'rejected'].includes(d.status));

    if (isLoading) {
        return <div className="p-8 text-center">Loading donations...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="My Donations"
                description="Track and manage all your food donations."
            >
                <Button variant="hero" asChild>
                    <Link to="/donor/post">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Donation
                    </Link>
                </Button>
            </PageHeader>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="pending" className="rounded-lg px-6">
                        Pending ({pendingDonations.length})
                    </TabsTrigger>
                    <TabsTrigger value="active" className="rounded-lg px-6">
                        Active ({activeDonations.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-lg px-6">
                        History ({completedDonations.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingDonations.map(donation => (
                            <DonationCard
                                key={donation.id}
                                donation={{ ...donation, donorName: user?.name || 'Me' }}
                                showActions
                                onCancel={() => handleCancel(donation.id)}
                            />
                        ))}
                        {pendingDonations.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-muted/20 border-2 border-dashed border-muted rounded-[2rem]">
                                <p className="text-muted-foreground mb-4">No active donations at the moment.</p>
                                <Button variant="hero" asChild>
                                    <Link to="/donor/post">Post a Donation</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="active" className="mt-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeDonations.map(donation => (
                            <div key={donation.id} className="space-y-4">
                                <DonationCard
                                    donation={{ ...donation, donorName: user?.name || 'Me' }}
                                    showActions
                                    onView={() => setSelectedDonation(donation)}
                                />
                                {(['accepted', 'at_pickup', 'picked_up', 'at_delivery'].includes(donation.status)) && (
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary h-11 font-bold"
                                        onClick={() => setTrackingDonation(donation)}
                                    >
                                        <Navigation className="h-4 w-4" />
                                        Track Volunteer
                                    </Button>
                                )}
                            </div>
                        ))}
                        {activeDonations.length === 0 && (
                            <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/10 rounded-[2rem]">
                                No active pickups in progress.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedDonations.map(donation => (
                            <DonationCard
                                key={donation.id}
                                donation={{ ...donation, donorName: user?.name || 'Me' }}
                                showActions
                                onView={() => setSelectedDonation(donation)}
                            />
                        ))}
                        {completedDonations.length === 0 && (
                            <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/10 rounded-[2rem]">
                                No donation history yet.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <VolunteerTrackerModal
                isOpen={!!trackingDonation}
                onClose={() => setTrackingDonation(null)}
                donation={trackingDonation}
            />

            <Dialog open={!!selectedDonation} onOpenChange={(o) => !o && setSelectedDonation(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Donation Details</DialogTitle>
                        <DialogDescription>ID: {selectedDonation?.id}</DialogDescription>
                    </DialogHeader>
                    {selectedDonation && (
                        <div className="space-y-4">
                            {/* Status Badge */}
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">{selectedDonation.title}</h3>
                                <Badge variant={selectedDonation.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                    {selectedDonation.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            {/* Rejection Alert */}
                            {selectedDonation.status === 'rejected' && (
                                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex gap-3 text-destructive animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-sm">Rejected by NGO</h4>
                                        <p className="text-sm mt-1 text-destructive/90 leading-relaxed">
                                            {selectedDonation.rejectionReason || "This donation was flagged for safety or logistics reasons."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="text-muted-foreground flex items-center gap-1"><Package className="h-3 w-3" /> Quantity</span>
                                    <p className="font-medium">{selectedDonation.quantity}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Expiry</span>
                                    <p className="font-medium text-destructive">{selectedDonation.expiryDate ? format(new Date(selectedDonation.expiryDate), 'MMM d, h:mm a') : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-3 rounded-lg text-sm">
                                <p className="text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup Address</p>
                                <p className="font-medium">{selectedDonation.pickupAddress || selectedDonation.address}</p>
                            </div>

                            {/* Claimed Info */}
                            {selectedDonation.claimedBy && (
                                <div className="bg-blue-50/50 p-3 rounded-lg text-sm border border-blue-100">
                                    <p className="text-blue-800 font-medium mb-1">Claimed By</p>
                                    <p className="text-blue-600">{selectedDonation.ngoName || "NGO"}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setSelectedDonation(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
