import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function DonorImpact() {
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
