import { motion } from 'framer-motion';
import {
    Utensils,
    Truck,
    BarChart3,
    ShieldCheck,
    Clock,
    MapPin,
    Zap,
    Globe
} from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'Smart Matching',
        description: 'AI-driven algorithms connect surplus food generators with the most suitable NGOs based on location and capacity.',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
    },
    {
        icon: ShieldCheck,
        title: 'Food Safety First',
        description: 'Integrated hygiene chain validation and timestamp checks ensure all donated food is safe for consumption.',
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
        image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=800&sig=1'
    },
    {
        icon: Truck,
        title: 'Real-time Logistics',
        description: 'Track pickups and deliveries in real-time. Our volunteer network ensures rapid transit for perishable items.',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800&sig=2'
    },
    {
        icon: BarChart3,
        title: 'Impact Analytics',
        description: 'Comprehensive dashboards show meals saved, carbon footprint reduction, and social impact metrics.',
        color: 'text-teal-500',
        bg: 'bg-teal-500/10',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop'
    },
    {
        icon: MapPin,
        title: 'Precise Location',
        description: 'Proximity-aware alerts notify nearby NGOs the moment a donation becomes available to minimize transit time.',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop'
    },
    {
        icon: Clock,
        title: 'Flash Donations',
        description: 'Handle high-urgency surplus from events or institutional kitchens with our rapid response coordination.',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
    }
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-transparent relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl md:text-5xl font-bold mb-6"
                    >
                        Powerful Features for <span className="text-primary">Social Impact</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-xl text-muted-foreground"
                    >
                        SurplusLink is more than just a donation platform. It's a technology-driven ecosystem built for efficiency and safety.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative p-8 rounded-[2.5rem] bg-transparent border border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5"
                        >
                            {/* Background Image Layer */}
                            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <img
                                    src={feature.image}
                                    className="w-full h-full object-cover brightness-90 contrast-110 transition-transform duration-700 group-hover:scale-110"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                            </div>

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 ring-1 ring-inset ring-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
                                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
