import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
    {
        number: '01',
        title: 'Post Surplus',
        description: 'Restaurants and venues list surplus food with quality details and perishability timestamps.',
        image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&q=80&w=800'
    },
    {
        number: '02',
        title: 'Instant Matching',
        description: 'Our AI finds the nearest NGO with capacity and interest, notifying them instantly.',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'
    },
    {
        number: '03',
        title: 'Secure Pickup',
        description: 'Verified volunteers or NGO transport coordinates pickup using our real-time tracking.',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        number: '04',
        title: 'Direct Delivery',
        description: 'Food is delivered safely to the shelter or community kitchen, and impact is recorded.',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800'
    }
];

export function Process() {
    return (
        <section id="how-it-works" className="py-24 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-3xl md:text-5xl font-bold mb-6"
                        >
                            The SurplusLink <span className="text-primary">Ecosystem</span>
                        </motion.h2>
                        <p className="text-xl text-muted-foreground">
                            A seamless flow from donation to delivery, secured by technology at every step.
                        </p>
                    </div>

                </div>

                <div className="relative">
                   

                    <div className="grid lg:grid-cols-4 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <div className="relative mb-8 pt-4">
                                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-black shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform relative z-10">
                                        {step.number}
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-20 h-20 rounded-2xl border-2 border-primary/20 scale-110 group-hover:rotate-12 transition-transform" />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>

                                    <div className="rounded-2xl overflow-hidden aspect-video border border-border mt-4">
                                        <img
                                            src={step.image}
                                            alt={step.title}
                                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>

                                    <ul className="space-y-2 pt-2">
                                        {['Automated alerts', 'Safety verification'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                                                <Check className="h-4 w-4 text-primary" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
