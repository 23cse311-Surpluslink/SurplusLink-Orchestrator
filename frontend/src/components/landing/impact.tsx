import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', meals: 4000 },
    { name: 'Feb', meals: 3000 },
    { name: 'Mar', meals: 5000 },
    { name: 'Apr', meals: 4500 },
    { name: 'May', meals: 6000 },
    { name: 'Jun', meals: 7500 },
];

const stats = [
    { label: 'Meals Saved', value: '12,450+', description: 'Directly distributed' },
    { label: 'NGO Partners', value: '47+', description: 'Trusted organizations' },
    { label: 'CO2 Offset', value: '4.2t', description: 'Carbon footprint reduced' },
    { label: 'Volunteers', value: '250+', description: 'Active community' },
];

export function Impact() {
    return (
        <section id="impact" className="py-24 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-5xl font-bold mb-8"
                        >
                            Real Impact, <br />
                            <span className="text-primary">Measurable Results</span>
                        </motion.h2>
                        <p className="text-xl text-muted-foreground mb-12">
                            We track every donation and delivery to provide transparent impact reporting. Our network is growing every day, scaling our collective social contribution.
                        </p>

                        <div className="grid grid-cols-2 gap-8">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <p className="text-4xl font-extrabold text-primary mb-2">{stat.value}</p>
                                    <p className="text-lg font-bold text-foreground">{stat.label}</p>
                                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="bg-card border border-border p-8 rounded-3xl shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6">
                            <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                                LIVE GROWTH
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-8">Meals Saved Growth</h3>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '12px',
                                            color: 'hsl(var(--foreground))'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="meals"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorMeals)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
