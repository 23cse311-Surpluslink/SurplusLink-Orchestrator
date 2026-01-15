import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Leaf, Heart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-image.jpg';

export function Hero() {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-[90vh] flex items-start overflow-hidden pt-24 md:pt-32">



            <div className="container mx-auto px-4 relative z-10 pt-4 md:pt-8">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-7 space-y-8"
                    >


                        <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight">
                            Feed the <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
                                Future,
                            </span> <br />
                            Reduce Waste.
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium opacity-90">
                            The intelligent bridge between food generators and those who need it most. Empowering local shelf-life management with <span className="text-foreground underline decoration-primary/30 underline-offset-4">real-time AI matching.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 pt-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="group flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-95"
                            >
                                Join the Mission
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="lg:col-span-5 relative mt-12 lg:mt-0"
                    >
                        <div className="relative z-10">
                            <img
                                src={heroImage}
                                alt="Sustainable food sharing"
                                className="w-full h-auto rounded-[3rem] shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
                            />
                        </div>


                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -right-4 z-20 bg-background/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-border/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Users className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-foreground">1,240+</p>
                                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Volunteers</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute -bottom-8 -left-6 z-20 bg-background/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-border/50"
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                    <Heart className="h-8 w-8 fill-current" />
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-foreground">12.4k</p>
                                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Meals Saved</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
