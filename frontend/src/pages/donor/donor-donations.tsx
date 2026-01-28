import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/common/page-header';
import { DonationCard } from '@/components/common/donation-card';
import DonationService from '@/services/donation.service';
import { format } from 'date-fns';

export default function DonorDonations() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

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
    const activeDonations = mappedDonations.filter(d => ['assigned', 'picked_up'].includes(d.status));
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
                            <DonationCard
                                key={donation.id}
                                donation={{ ...donation, donorName: user?.name || 'Me' }}
                                showActions
                                onView={() => { }}
                            />
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
                                onView={() => { }}
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
        </div>
    );
}
