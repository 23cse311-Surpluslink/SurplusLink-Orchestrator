
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Package, Clock, TrendingUp, Lock } from 'lucide-react';
import { getPendingDonations } from '@/mockData/donations';
import { ngoMetrics } from '@/mockData/metrics';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { DonationCard } from '@/components/common/donation-card';
import { useAuth } from '@/contexts/auth-context';
import { VerificationBanner } from '@/components/layout/verification-banner';

export default function NgoDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [donations, setDonations] = useState(getPendingDonations());
  const isVerified = user?.status === 'active';

  const handleAccept = (id: string) => {
    setDonations(prev => prev.filter(d => d.id !== id));
    toast({ title: "Donation Accepted!", description: "A volunteer will be assigned shortly." });
  };

  return (
    <div className="space-y-8">
      <VerificationBanner />
      <PageHeader title="NGO Dashboard" description="Browse and accept nearby food donations." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Meals Received" value={ngoMetrics.mealsReceived.toLocaleString()} icon={<Package className="h-5 w-5" />} trend={{ value: 12, isPositive: true }} />
        <StatCard title="Avg. Delivery Time" value={`${ngoMetrics.avgDeliveryTime} min`} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Active Pickups" value={ngoMetrics.activePickups} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Nearby Donations" value={donations.length} icon={<MapPin className="h-5 w-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Monthly Deliveries</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ngoMetrics.monthlyReceived}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="meals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Meals" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Available Donations</h3>
          {donations.slice(0, 3).map(d => (
            <DonationCard
              key={d.id}
              donation={d}
              showActions
              onAccept={handleAccept}
              onReject={() => setDonations(prev => prev.filter(don => don.id !== d.id))}
              disabled={!isVerified}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
