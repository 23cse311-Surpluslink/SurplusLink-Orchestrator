/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldAlert,
    Upload,
    CheckCircle2,
    FileText,
    MapPin,
    Building2,
    AlertOctagon,
    ShieldCheck,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import api from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export function VerificationBanner() {
    const { user } = useAuth();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    if (!user || user.status === 'active') return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 p-6 mb-8 group"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <AlertOctagon size={120} className="text-orange-500" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0 shadow-inner">
                        <ShieldAlert className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <h3 className="text-xl font-bold tracking-tight text-orange-900 dark:text-orange-100">Verification Required</h3>
                        <p className="text-sm font-medium text-orange-800/70 dark:text-orange-200/60 max-w-2xl">
                            To ensure the safety of our food redistribution chain, your organization must be verified before you can start posting or claiming donations.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsSheetOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
                    >
                        Complete Verification
                    </Button>
                </div>
            </motion.div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-xl w-full p-0 border-l border-border/50 bg-card/95 backdrop-blur-2xl">
                    <VerificationForm onClose={() => setIsSheetOpen(false)} />
                </SheetContent>
            </Sheet>
        </>
    );
}

function VerificationForm({ onClose }: { onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            toast({ variant: 'destructive', title: 'Document required', description: 'Please upload a valid permit or ID document.' });
            return;
        }

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('verificationDoc', file);

        try {
            await api.put('/users/verify-documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Documents submitted. We will notify you once approved.',
            });
            onClose();
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Submission failed',
                description: error.response?.data?.message || 'Check your connection and try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-8 md:p-12 relative overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
                <SheetHeader className="mb-10 relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <SheetTitle className="text-2xl font-bold tracking-tight">Organization KYC</SheetTitle>
                            <SheetDescription className="text-sm font-medium text-muted-foreground">
                                Submit credentials to become a verified partner
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} id="verification-form" className="space-y-8 relative z-10">
                    <div className="grid gap-6">
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">Legal Identity</Label>
                            <div className="grid gap-4">
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
                                    <Input
                                        name="taxId"
                                        placeholder="Tax / GST Number"
                                        className="h-12 pl-12 rounded-xl bg-muted/20 border-border/40 focus:bg-card transition-all"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
                                    <Input
                                        name="permitNumber"
                                        placeholder="Operations Permit"
                                        className="h-12 pl-12 rounded-xl bg-muted/20 border-border/40 focus:bg-card transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">Location Details</Label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
                                <Input
                                    name="address"
                                    placeholder="Enter physical address"
                                    className="h-12 pl-12 rounded-xl bg-muted/20 border-border/40 focus:bg-card transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">Credential Proof</Label>
                            <label className={cn(
                                "flex flex-col items-center justify-center w-full min-h-[160px] rounded-2xl border-2 border-dashed transition-all cursor-pointer group",
                                file ? "bg-emerald-500/5 border-emerald-500/30" : "bg-muted/10 border-border/50 hover:bg-muted/20"
                            )}>
                                <div className="flex flex-col items-center justify-center p-6 text-center">
                                    {file ? (
                                        <div className="space-y-2">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                                            <p className="font-bold text-sm text-emerald-800 dark:text-emerald-400">{file.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-primary mb-2" />
                                            <p className="text-sm font-bold text-foreground">Upload Documents</p>
                                            <p className="text-xs text-muted-foreground mt-1">NGO Certificate or Food Permit (PDF/JPG)</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                </form>
            </div>

            <div className="p-6 bg-card border-t border-border/50">
                <div className="flex gap-3">

                    <Button
                        form="verification-form"
                        disabled={isLoading}
                        type="submit"
                        className="flex-1 h-12 rounded-xl font-bold gap-2"
                        variant="hero"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Submit for Approval'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
