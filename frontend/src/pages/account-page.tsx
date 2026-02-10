import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    User as UserIcon,
    Mail,
    Building2,
    Calendar,
    ShieldCheck,
    ArrowRight,
    MapPin,
    Camera,
    Edit2,
    Check,
    X,
    Settings as SettingsIcon,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    React.useEffect(() => {
        if (user?.name) {
            setEditName(user.name);
        }
    }, [user?.name]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    if (!user) return null;

    const handleSaveName = async () => {
        if (editName.trim() === user.name) {
            setIsEditingName(false);
            return;
        }
        setIsSaving(true);
        try {
            await updateProfile({ name: editName });
            setIsEditingName(false);
        } catch (error) {
            console.error('Failed to update name:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('avatar', file);

        setIsUploading(true);
        try {
            await updateProfile(formData);
        } catch (error) {
            console.error('Failed to upload avatar:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto space-y-12 pb-24 px-4 sm:px-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        Account Overview
                    </h1>
                    <p className="text-muted-foreground font-medium">Manage your professional profile and credentials</p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-12">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-visible bg-card relative">
                        <div className="h-40 w-full rounded-t-[2.5rem] bg-gradient-to-br from-primary via-emerald-500 to-emerald-800 opacity-90" />

                        <div className="px-8 pb-8 -mt-20 flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
                            <div className="relative group p-1 bg-card rounded-full shadow-2xl">
                                <Avatar className="h-40 w-40 rounded-full  shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                                    <AvatarImage src={user.avatar ? `${user.avatar}${user.avatar.includes('?') ? '&' : '?'}t=${Date.now()}` : undefined} alt={user.name} />
                                    <AvatarFallback className="text-4xl font-black bg-muted">
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <label className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full transition-all duration-200 cursor-pointer z-20 ${isUploading ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <div className="flex flex-col items-center gap-2">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="h-8 w-8" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                                </label>
                            </div>

                            <div className="flex-1 text-center md:text-left pt-2 pb-4">
                                <div className="flex flex-col md:flex-row items-center gap-3">
                                    <h2 className="text-3xl font-black tracking-tight">{user.organization || user.name}</h2>
                                    <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                        {user.role}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        Verified Partner
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        {user.status} Status
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-8 space-y-10">
                    <Card className="rounded-[2.5rem] border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-md">
                        <CardHeader className="pb-4 pt-8 px-8 border-b border-border/40">
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                                <Edit2 className="h-5 w-5 text-primary" />
                                Identity Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Full Name</label>
                                    {isEditingName ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="rounded-xl h-12 font-bold focus-visible:ring-primary"
                                                autoFocus
                                            />
                                            <Button
                                                size="icon"
                                                onClick={handleSaveName}
                                                disabled={isSaving}
                                                className="h-12 w-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 shrink-0"
                                            >
                                                {isSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="h-5 w-5" />}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => { setIsEditingName(false); setEditName(user.name); }}
                                                className="h-12 w-12 rounded-xl border border-border/50 shrink-0"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setIsEditingName(true)}
                                            className="group flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/40 font-bold cursor-pointer hover:bg-muted/60 transition-colors"
                                        >
                                            <span className="flex items-center gap-3">
                                                <UserIcon className="h-4 w-4 text-primary/70" />
                                                {user.name}
                                            </span>
                                            <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Email</label>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/20 font-bold text-muted-foreground/70 select-none">
                                        <Mail className="h-4 w-4 text-muted-foreground/40" />
                                        {user.email}
                                    </div>
                                </div>

                                {user.organization && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Organization</label>
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/20 font-bold">
                                            <Building2 className="h-4 w-4 text-primary/70" />
                                            {user.organization}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Account Created</label>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/20 font-bold">
                                        <Calendar className="h-4 w-4 text-primary/70" />
                                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <Card className="rounded-[2.5rem] border-none bg-primary/5 shadow-xl overflow-hidden group">
                        <CardHeader className="pt-8 px-8">
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary" />
                                Location Hub
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="p-6 rounded-3xl bg-card border-2 border-dashed border-border/60 flex flex-col items-center justify-center text-center gap-4 transition-all group-hover:border-primary/40">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground px-2">
                                    Your pickup and delivery addresses are managed globally in system settings.
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/settings')}
                                className="w-full rounded-2xl h-14 font-semibold uppercase  text-[14px] gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Update Location
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
