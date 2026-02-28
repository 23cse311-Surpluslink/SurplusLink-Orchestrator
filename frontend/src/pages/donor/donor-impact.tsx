import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Leaf, TrendingUp, Award, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import DonationService from '@/services/donation.service';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['hsl(152, 60%, 36%)', 'hsl(16, 85%, 60%)', 'hsl(200, 85%, 50%)', 'hsl(38, 95%, 50%)'];

const foodTypeData = [
  { name: 'Prepared Meals', value: 45 },
  { name: 'Bakery Items', value: 25 },
  { name: 'Fresh Produce', value: 20 },
  { name: 'Other', value: 10 }
];

import { DonationStats } from '@/types';
import { useTranslation } from 'react-i18next';

export default function DonorImpact() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await DonationService.getStats();
        setMetrics(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load impact metrics", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [toast]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Impact Summary"
        description="See the positive difference you're making in your community."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Meals Saved"
          value={metrics?.mealsSaved?.toLocaleString() || "0"}
          icon={<Package className="h-5 w-5" />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="CO₂ Prevented"
          value={`${metrics?.co2Reduced || "0"} kg`}
          icon={<Leaf className="h-5 w-5" />}
          description="Direct environmental offset"
        />
        <StatCard
          title="Total Donations"
          value={metrics?.totalDonations || 0}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Acceptance Rate"
          value={`${metrics?.acceptanceRate || "0"}%`}
          icon={<Award className="h-5 w-5" />}
          description="Donations utilized"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Meals Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.monthlyBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="month" className="text-xs" axisLine={false} tickLine={false} />
                  <YAxis className="text-xs" axisLine={false} tickLine={false} />
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
                    name="Meals"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={foodTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {foodTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CO2 Impact */}
      {/* Sustainability Credits & Badges */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-gradient-to-br from-primary/10 to-emerald-500/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Sustainability Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="text-5xl font-black text-primary mb-2">
              {metrics?.sustainabilityCredits || 0}
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Available Credits</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Badges & Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge className="h-16 w-32 flex flex-col items-center justify-center gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-200">
                <Leaf className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase">Eco Warrior</span>
              </Badge>
              <Badge className="h-16 w-32 flex flex-col items-center justify-center gap-1 bg-primary/10 text-primary border-primary/20 opacity-50">
                <Package className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase">1k Meals</span>
              </Badge>
              <Badge className="h-16 w-32 flex flex-col items-center justify-center gap-1 bg-amber-500/10 text-amber-700 border-amber-200 opacity-50">
                <Award className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase">Certified Safe</span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environmental Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.monthlyBreakdown || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="month" className="text-xs" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} kg`, 'CO₂ Reduced']}
                />
                <Bar
                  dataKey="co2"
                  fill="hsl(var(--success))"
                  radius={[0, 4, 4, 0]}
                  name="CO₂ Reduced (kg)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
