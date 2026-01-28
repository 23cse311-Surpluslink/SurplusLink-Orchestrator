import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/common/stat-card';
import { Package, Users, Leaf, Clock, TrendingUp } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

const data = [
    { month: 'Jul', meals: 450, co2: 120, donors: 12 },
    { month: 'Aug', meals: 520, co2: 145, donors: 15 },
    { month: 'Sep', meals: 480, co2: 130, donors: 18 },
    { month: 'Oct', meals: 610, co2: 180, donors: 22 },
    { month: 'Nov', meals: 750, co2: 210, donors: 25 },
    { month: 'Dec', meals: 1200, co2: 340, donors: 35 },
];

export function NgoImpactPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Impact Dashboard"
                description="Visualize the community difference you're making via SurplusLink."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Meals Shared" value="3,850" icon={<Package className="h-5 w-5" />} trend={{ value: 24, isPositive: true }} />
                <StatCard title="CO2 Offset (kg)" value="1,120" icon={<Leaf className="h-5 w-5 text-green-600" />} trend={{ value: 18, isPositive: true }} />
                <StatCard title="Partner Donors" value="48" icon={<Users className="h-5 w-5" />} trend={{ value: 12, isPositive: true }} />
                <StatCard title="Rescue Efficiency" value="94%" icon={<TrendingUp className="h-5 w-5 text-primary" />} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="col-span-1 shadow-sm border-2 border-slate-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Meal Distribution Trend
                        </CardTitle>
                        <CardDescription>Monthly volume of meals recovered and distributed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="meals" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorMeals)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 shadow-sm border-2 border-slate-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-green-600" />
                            Environmental Savings
                        </CardTitle>
                        <CardDescription>Estimated carbon footprint reduction (kg CO2-eq)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="co2" name="CO2 Saved" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Leaf className="h-40 w-40 rotate-12" />
                </div>
                <CardHeader>
                    <CardTitle className="text-2xl font-black">Environmental Impact Award</CardTitle>
                    <CardDescription className="text-slate-400">You've reached the Silver Tier in Food Rescue!</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                    <p className="max-w-2xl text-slate-300">
                        By rescuing over 1,000kg of food this year, your organization has prevented approximately 1.5 tons of CO2 emissions. That's equivalent to planting 68 trees!
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
