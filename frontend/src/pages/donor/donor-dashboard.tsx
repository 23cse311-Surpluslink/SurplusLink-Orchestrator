import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { DonationCard } from '@/components/common/donation-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, Leaf, Clock, TrendingUp, Lock, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { VerificationBanner } from '@/components/layout/verification-banner';
import { useToast } from '@/hooks/use-toast';
import DonationService, { Donation as RawDonation } from '@/services/donation.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function DonorDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isVerified = user?.status === 'active';

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['donor-stats'],
        queryFn: DonationService.getStats,
        enabled: !!user,
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const { data: donations, isLoading: donationsLoading } = useQuery({
        queryKey: ['my-donations'],
        queryFn: DonationService.getMyDonations,
        enabled: !!user,
        refetchInterval: 10000, // Poll every 10 seconds for live updates
    });

    // Notification Logic: Watch for status changes
    useEffect(() => {
        if (donations) {
            const acceptedDonation = donations.find(d => d.status === 'assigned');
            // In a real app, you'd track which ones you've already notified about
            // For now, we'll just show a toast if any is 'assigned' (which means accepted by NGO)
            if (acceptedDonation) {
                toast({
                    title: "Donation Confirmed!",
                    description: `Your donation "${acceptedDonation.title}" has been accepted by an NGO.`,
                    variant: "default",
                });
            }
        }
    }, [donations, toast]);

    const cancelMutation = useMutation({
        mutationFn: DonationService.cancelDonation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-donations'] });
            queryClient.invalidateQueries({ queryKey: ['donor-stats'] });
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

    // Mapping backend data to DonationCard props
    const mappedDonations = donations?.map((d: RawDonation) => ({
        id: d.id || d._id,
        donorId: d.donorId,
        donorName: user?.name || 'You',
        foodType: d.title,
        quantity: d.quantity,
        expiryTime: d.expiryDate,
        pickupWindow: d.pickupWindow ? `${format(new Date(d.pickupWindow.start), 'p')} - ${format(new Date(d.pickupWindow.end), 'p')}` : 'N/A',
        location: d.pickupAddress,
        address: d.pickupAddress,
        status: d.status,
        createdAt: d.createdAt,
        image: d.photos?.[0]
    })) || [];

    const recentDonations = mappedDonations.slice(0, 3);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <VerificationBanner />
            <PageHeader
                title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}!`}
                description="Manage your food donations and track your impact."
            >
                <div className="flex gap-3">

                    <Button variant={isVerified ? "hero" : "secondary"} asChild disabled={!isVerified}>
                        {isVerified ? (
                            <Link to="/donor/post">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Post Donation
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2" >
                                <Lock className="h-4 w-4" />
                                Post Donation
                            </div>
                        )}
                    </Button>
                </div>
            </PageHeader>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Donations"
                    value={stats?.totalDonations || 0}
                    icon={<Package className="h-5 w-5" />}
                />
                <StatCard
                    title="Completed"
                    value={stats?.completedDonations || 0}
                    icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
                />
                <StatCard
                    title="Acceptance Rate"
                    value={`${stats?.acceptanceRate || 0}%`}
                    icon={<Leaf className="h-5 w-5 text-emerald-500" />}
                />
                <StatCard
                    title="Avg. Pickup Time"
                    value="--"
                    icon={<Clock className="h-5 w-5 text-primary" />}
                    description="Live tracking incoming"
                />
            </div>

            {/* Chart & Recent Donations */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="rounded-3xl border-none shadow-xl bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Impact Visualization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Mon', count: 4 },
                                    { name: 'Tue', count: 7 },
                                    { name: 'Wed', count: stats?.totalDonations || 0 },
                                    { name: 'Thu', count: 0 },
                                    { name: 'Fri', count: 0 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <ChartTooltip
                                        cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xl tracking-tight">Recent Activity</h3>
                        <Button variant="ghost" size="sm" asChild className="rounded-full">
                            <Link to="/donor/donations">View History</Link>
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {donationsLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-32 w-full bg-muted animate-pulse rounded-2xl" />)
                        ) : recentDonations.length > 0 ? (
                            recentDonations.map(donation => (
                                <DonationCard
                                    key={donation.id}
                                    donation={donation}
                                    showActions
                                    onCancel={() => handleCancel(donation.id)}
                                />
                            ))
                        ) : (
                            <Card className="border-2 border-dashed border-muted bg-transparent p-12 text-center rounded-[2rem]">
                                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="h-8 w-8 text-primary" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">No Active Donations</h4>
                                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                                    You haven't posted any food surplus recently. Start by clicking the button below.
                                </p>
                                <Button variant="hero" asChild className="rounded-full px-8">
                                    <Link to="/donor/post">
                                        Post Donation
                                    </Link>
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
