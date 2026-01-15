import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { donations as allDonations } from '@/mockData/donations';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/common/page-header';
import { DonationCard } from '@/components/common/donation-card';

export default function DonorDonations() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [donations, setDonations] = useState(
        allDonations.filter(d => d.donorId === user?.id || d.donorId === 'donor-1')
    );

    const pendingDonations = donations.filter(d => d.status === 'pending');
    const activeDonations = donations.filter(d => ['assigned', 'picked'].includes(d.status));
    const completedDonations = donations.filter(d => ['delivered', 'expired', 'cancelled'].includes(d.status));

    const handleCancel = (id: string) => {
        setDonations(prev =>
            prev.map(d => d.id === id ? { ...d, status: 'cancelled' as const } : d)
        );
        toast({
            title: "Donation Cancelled",
            description: "The donation has been cancelled.",
        });
    };

    return (
        <div className="space-y-6">
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

            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">
                        Pending ({pendingDonations.length})
                    </TabsTrigger>
                    <TabsTrigger value="active">
                        Active ({activeDonations.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed ({completedDonations.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingDonations.map(donation => (
                            <DonationCard
                                key={donation.id}
                                donation={donation}
                                showActions
                                onCancel={handleCancel}
                                onView={() => { }}
                                onEdit={() => { }}
                            />
                        ))}
                        {pendingDonations.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground mb-4">No pending donations</p>
                                <Button variant="hero" asChild>
                                    <Link to="/donor/post">Post a Donation</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeDonations.map(donation => (
                            <DonationCard
                                key={donation.id}
                                donation={donation}
                                showActions
                                onView={() => { }}
                            />
                        ))}
                        {activeDonations.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No active donations
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedDonations.map(donation => (
                            <DonationCard
                                key={donation.id}
                                donation={donation}
                                showActions
                                onView={() => { }}
                            />
                        ))}
                        {completedDonations.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No completed donations yet
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
