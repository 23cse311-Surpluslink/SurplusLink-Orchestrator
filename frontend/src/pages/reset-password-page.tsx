/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords do not match",
                description: "Please ensure both password fields match.",
            });
            setIsLoading(false);
            return;
        }

        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setIsSuccess(true);
            toast({
                variant: "success",
                title: "Security Updated",
                description: "Your password has been successfully reset.",
            });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Reset failed",
                description: error.response?.data?.message || "Token may be invalid or expired.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative py-12 px-6">
            {/* Background elements to match login theme */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-6 relative z-10"
            >
                <div className="flex justify-center mb-10">
                    <Logo size="lg" />
                </div>

                <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 rounded-[2rem] overflow-hidden">
                    {!isSuccess ? (
                        <>
                            <CardHeader className="p-8 pb-0 text-center">
                                <CardTitle className="text-3xl font-black tracking-tight">Set New Password</CardTitle>
                                <CardDescription className="text-muted-foreground font-medium mt-2">
                                    Your old password has been cleared. Please choose a strong new one.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password font-black">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/60" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="h-11 rounded-xl pl-11 pr-12 bg-muted/30 border-border/40"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-3.5 text-muted-foreground/60 hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/60" />
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="h-11 rounded-xl pl-11 bg-muted/30 border-border/40"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest gap-2" variant="hero" disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Update Password'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </>
                    ) : (
                        <div className="p-10 text-center space-y-6">
                            <div className="h-20 w-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="h-10 w-10 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight">Security Updated</h3>
                                <p className="text-muted-foreground font-medium">
                                    Success! Your password has been changed. You will be redirected to the login page shortly.
                                </p>
                            </div>
                            <Button asChild variant="hero" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest mt-4">
                                <Link to="/login">Sign In Now</Link>
                            </Button>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
