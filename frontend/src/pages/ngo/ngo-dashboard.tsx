import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Package, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { DonationCard } from '@/components/common/donation-card';
import { useAuth } from '@/contexts/auth-context';
import { VerificationBanner } from '@/components/layout/verification-banner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import DonationService from '@/services/donation.service';
import { Donation } from '@/types';
import { RejectionModal } from '@/components/ngo/rejection-modal';
import { ngoMetrics } from '@/mockData/metrics'; // Keeping mock metrics for charts/stats for now as per minimal change scope, unless API provides them.

export default function NgoDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [capacityWarning, setCapacityWarning] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false); // For local loading states

  const isVerified = user?.status === 'active';

  const fetchFeed = useCallback(async () => {
    try {
      const data = await DonationService.getSmartFeed();
      setDonations(data.donations);
      setCapacityWarning(data.capacityWarning);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load donation feed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleClaim = async (id: string) => {
    try {
      // Optimistic update
      setDonations(prev => prev.filter(d => d.id !== id));
      toast({ title: "Donation Claimed!", description: "It has been moved to your 'My Claims' list." });

      await DonationService.claimDonation(id);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to claim donation.", variant: "destructive" });
      fetchFeed(); // Revert/Refresh
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingId) return;

    try {
      const id = rejectingId;
      setRejectingId(null); // Close modal immediately

      // Optimistic update
      setDonations(prev => prev.filter(d => d.id !== id));

      await DonationService.rejectDonation(id, reason);
      toast({ title: "Donation Rejected", description: "This item has been removed from your feed." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to reject donation.", variant: "destructive" });
      fetchFeed();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <VerificationBanner />
      <PageHeader title="NGO Dashboard" description="Browse and claim nearby food donations tailored to your needs." />

      {capacityWarning && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Volume</AlertTitle>
          <AlertDescription>
            Donations exceed your configured daily capacity. Please check your settings or claim only what you can manage.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Meals Received" value={ngoMetrics.mealsReceived.toLocaleString()} icon={<Package className="h-5 w-5" />} trend={{ value: 12, isPositive: true }} />
        <StatCard title="Avg. Delivery Time" value={`${ngoMetrics.avgDeliveryTime} min`} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Active Pickups" value={ngoMetrics.activePickups} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Nearby Donations" value={donations.length} icon={<MapPin className="h-5 w-5" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xl">Smart Feed</h3>
            <span className="text-sm text-muted-foreground">{donations.length} available</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-slate-50">
              <p className="text-muted-foreground">No matching donations found nearby.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {donations.map(d => (
                <DonationCard
                  key={d.id}
                  donation={d}
                  showActions
                  onAccept={handleClaim} /* Mapped to Claim button */
                  onReject={handleRejectClick} /* Opens modal */
                  disabled={!isVerified}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
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
        </div>
      </div>

      <RejectionModal
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
