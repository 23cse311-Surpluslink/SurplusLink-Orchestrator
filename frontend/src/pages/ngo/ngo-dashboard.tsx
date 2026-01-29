import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Package, Clock, TrendingUp, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { DonationCard } from '@/components/common/donation-card';
import { useAuth } from '@/contexts/auth-context';
import { VerificationBanner } from '@/components/layout/verification-banner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DonationService from '@/services/donation.service';
import { Donation } from '@/types';
import { ngoMetrics } from '@/mockData/metrics';
import { Button } from '@/components/ui/button';

export default function NgoDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [nearbyCount, setNearbyCount] = useState(0);
  const [activeClaims, setActiveClaims] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [capacityWarning, setCapacityWarning] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [feedData, claimsData] = await Promise.all([
        DonationService.getSmartFeed(),
        DonationService.getMyDonations()
      ]);

      setNearbyCount(feedData.count);
      setCapacityWarning(feedData.capacityWarning);
      setActiveClaims(claimsData.filter(d => ['assigned', 'picked_up'].includes(d.status)).slice(0, 3));
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-8 animate-fade-in">
      <VerificationBanner />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader
          title="Overview"
          description={`Welcome back, ${user?.organization || 'NGO Partner'}. Here's what's happening today.`}
        />
        <div className="flex gap-2 mb-2">
          <Button asChild variant="hero" size="sm">
            <Link to="/ngo/nearby">Find Food</Link>
          </Button>

        </div>
      </div>

      {capacityWarning && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Distribution Volume</AlertTitle>
          <AlertDescription>
            Nearby donations exceed your daily capacity. Review your <Link to="/ngo/settings" className="underline font-bold">settings</Link> or coordinate extra help.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Meals Distributed" value={ngoMetrics.mealsReceived.toLocaleString()} icon={<Package className="h-5 w-5" />} trend={{ value: 12, isPositive: true }} />
        <StatCard title="Active Deliveries" value={activeClaims.length} icon={<TrendingUp className="h-5 w-5 font-bold" />} />
        <StatCard title="Avg Time" value={`${ngoMetrics.avgDeliveryTime}m`} icon={<Clock className="h-5 w-5 font-bold" />} />
        <StatCard title="Opportunities" value={nearbyCount} icon={<MapPin className="h-5 w-5 font-bold text-primary" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Current Operations
            </h3>
            <Link to="/ngo/accepted" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12 border rounded-xl bg-muted/20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeClaims.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h4 className="font-semibold text-white">No active deliveries</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                  Claim donations from the nearby feed to start distributions.
                </p>
                <Button asChild className="mt-6" variant="secondary">
                  <Link to="/ngo/nearby">Browse Feed</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeClaims.map(d => (
                <DonationCard
                  key={d.id}
                  donation={d}
                  showActions={false}
                />
              ))}
              <Button asChild variant="outline" className="w-full">
                <Link to="/ngo/accepted">Manage All Deliveries</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-none text-white overflow-hidden relative">
            <div className="absolute -right-8 -bottom-8 opacity-20">
              <MapPin className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Nearby Live Feed</CardTitle>
              <CardDescription className="text-slate-400">Real-time opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="text-3xl font-black">
                {nearbyCount} Items
              </div>
              <p className="text-sm text-slate-400">
                There are {nearbyCount} donations within your operating radius waiting to be claimed.
              </p>
              <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100">
                <Link to="/ngo/nearby">View Live Map</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">S</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Sunlight Cafe</p>
                  <p className="text-xs text-muted-foreground">"Prompt pickup, thanks!"</p>
                </div>
                <div className="text-xs font-bold text-yellow-500">★ 5.0</div>
              </div>
              <Button asChild variant="ghost" className="w-full text-xs" size="sm">
                <Link to="/ngo/feedback">View Feedback History</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

