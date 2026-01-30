/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [simulatedToken, setSimulatedToken] = useState('');
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setIsSubmitted(true);
            if (response.data.resetToken) {
                setSimulatedToken(response.data.resetToken);
            }
            toast({
                variant: "success",
                title: "Reset link sent",
                description: "If an account exists, you will receive a reset link.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Request failed",
                description: error.response?.data?.message || "Something went wrong",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative py-12 px-6">
            <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="absolute top-8 left-8 z-50">
                <Link to="/login" className="group flex items-center gap-2 bg-card/50 backdrop-blur-md border border-border/50 px-5 py-2.5 rounded-2xl hover:bg-card hover:border-primary/30 transition-all shadow-sm">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold">Back to Login</span>
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-6 relative z-10"
            >
                <div className="flex justify-center mb-10">
                    <Logo size="lg" />
                </div>

                <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 rounded-[2rem] overflow-hidden">
                    {!isSubmitted ? (
                        <>
                            <CardHeader className="p-8 pb-0 text-center">
                                <CardTitle className="text-3xl font-black tracking-tight">Recover Password</CardTitle>
                                <CardDescription className="text-muted-foreground font-medium mt-2">
                                    Enter your registered email address and we'll send you a recovery link.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/60" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                className="h-11 rounded-xl pl-11 bg-muted/30 border-border/40 focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest gap-2" variant="hero" disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Send Instructions'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </>
                    ) : (
                        <div className="p-10 text-center space-y-6">
                            <div className="h-20 w-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight">Check your email</h3>
                                <p className="text-muted-foreground font-medium">
                                    We've sent password reset instructions to your email address.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Simulated Link (Dev Only)</p>
                                <Link
                                    to={`/reset-password/${simulatedToken}`}
                                    className="text-xs font-bold text-primary hover:underline break-all"
                                >
                                    Click here to reset (Simulates email link)
                                </Link>
                            </div>

                            <Button asChild variant="outline" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest border-border/60 hover:bg-muted/50 mt-4">
                                <Link to="/login">Return to login</Link>
                            </Button>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
