import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { DonationCard } from '@/components/common/donation-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, Leaf, Clock, TrendingUp, Lock } from 'lucide-react';
import { getDonationsByDonor } from '@/mockData/donations';
import { donorMetrics } from '@/mockData/metrics';
import { useAuth } from '@/contexts/auth-context';
import { VerificationBanner } from '@/components/layout/verification-banner';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DonorDashboard() {
    const { user } = useAuth();
    const donations = getDonationsByDonor(user?.id || 'donor-1').slice(0, 3);
    const isVerified = user?.status === 'active';

    return (
        <div className="space-y-8">
            <VerificationBanner />
            <PageHeader
                title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}!`}
                description="Manage your food donations and track your impact."
            >
                <Button variant={isVerified ? "hero" : "secondary"} asChild disabled={!isVerified}>
                    {isVerified ? (
                        <Link to="/donor/post">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Post Donation
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                            <Lock className="h-4 w-4" />
                            Post Donation
                        </div>
                    )}
                </Button>
            </PageHeader>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Donations"
                    value={donorMetrics.totalDonations}
                    icon={<Package className="h-5 w-5" />}
                    trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                    title="Meals Saved"
                    value={donorMetrics.mealsSaved.toLocaleString()}
                    icon={<TrendingUp className="h-5 w-5" />}
                    trend={{ value: 8, isPositive: true }}
                />
                <StatCard
                    title="CO₂ Reduced"
                    value={`${donorMetrics.co2Reduced} tons`}
                    icon={<Leaf className="h-5 w-5" />}
                    description="Environmental impact"
                />
                <StatCard
                    title="Avg. Pickup Time"
                    value="38 min"
                    icon={<Clock className="h-5 w-5" />}
                    description="From posting to pickup"
                />
            </div>

            {/* Chart & Recent Donations */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={donorMetrics.monthlyBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                    <XAxis dataKey="month" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="meals"
                                        fill="hsl(var(--primary))"
                                        radius={[4, 4, 0, 0]}
                                        name="Meals Saved"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Recent Donations</h3>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/donor/donations">View All</Link>
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {donations.map(donation => (
                            <DonationCard key={donation.id} donation={donation} />
                        ))}

                        {donations.length === 0 && (
                            <Card className="p-8 text-center">
                                <p className="text-muted-foreground mb-4">No donations yet</p>
                                <Button variant="hero" asChild>
                                    <Link to="/donor/post">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create Your First Donation
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
