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
        bg: 'bg-yellow-500/10'
    },
    {
        icon: ShieldCheck,
        title: 'Food Safety First',
        description: 'Integrated hygiene chain validation and timestamp checks ensure all donated food is safe for consumption.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        icon: Truck,
        title: 'Real-time Logistics',
        description: 'Track pickups and deliveries in real-time. Our volunteer network ensures rapid transit for perishable items.',
        color: 'text-green-500',
        bg: 'bg-green-500/10'
    },
    {
        icon: BarChart3,
        title: 'Impact Analytics',
        description: 'Comprehensive dashboards show meals saved, carbon footprint reduction, and social impact metrics.',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    },
    {
        icon: MapPin,
        title: 'Precise Location',
        description: 'Proximity-aware alerts notify nearby NGOs the moment a donation becomes available to minimize transit time.',
        color: 'text-red-500',
        bg: 'bg-red-500/10'
    },
    {
        icon: Clock,
        title: 'Flash Donations',
        description: 'Handle high-urgency surplus from events or institutional kitchens with our rapid response coordination.',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
    }
];

export function Features() {
    return (
        <section id="features" className="py-16 md:py-24 bg-transparent">
            <div className="container mx-auto px-4">
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
                            className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`h-7 w-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
