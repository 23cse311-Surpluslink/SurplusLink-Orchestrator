import { useState, useEffect } from 'react';
import {
    Users,
    ShieldCheck,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Filter,
    Search,
    UserCircle,
    Building2,
    Calendar,
    ArrowRight,
    Loader2,
    ShieldAlert,
    MapPin,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/common/page-header';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [activeTab, setActiveTab] = useState('all');
    const { toast } = useToast();

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Real-time polling (every 10 seconds for user list)
    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleVerify = async (userId: string, newStatus: string) => {
        try {
            await api.patch('/users/verify', { userId, status: newStatus });
            toast({
                title: "Status Updated",
                description: `User is now ${newStatus}.`,
                variant: newStatus === 'active' ? 'success' : 'destructive'
            });
            fetchUsers();
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Could not update user status.",
                variant: "destructive"
            });
        }
    };

    const filteredUsers = users.filter(user => {
        if (user.role === 'admin') return false;
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const pendingUsers = users.filter(u => u.role !== 'admin' && u.status === 'pending' && (u.taxId || u.documentUrl));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="User Management"
                description="Monitor users and handle KYC verifications in real-time."
            >
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search identity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-[300px] h-11 bg-card/50 border-border/50 rounded-xl focus:bg-card transition-all"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 rounded-xl gap-2 px-4 font-semibold">
                                <Filter className="h-4 w-4" />
                                {filterRole === 'all' ? 'All Roles' : filterRole.toUpperCase()}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card/95 backdrop-blur-md">
                            <DropdownMenuItem onClick={() => setFilterRole('all')}>All Roles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterRole('donor')}>Donors</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterRole('ngo')}>NGOs</DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </PageHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex items-center justify-between bg-card/50 p-1.5 rounded-2xl border border-border/50 backdrop-blur-sm sticky top-0 z-10">
                    <TabsList className="bg-transparent gap-2 h-auto p-0">
                        <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 px-6 rounded-xl font-bold transition-all uppercase tracking-wider text-[10px]">
                            Full Directory
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white h-10 px-6 rounded-xl font-bold transition-all uppercase tracking-wider text-[10px] relative">
                            KYC Queue
                            {pendingUsers.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] text-white ring-2 ring-background animate-pulse">
                                    {pendingUsers.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                    <div className="px-4 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-l border-border/50">
                        {filteredUsers.length} Users Listed
                    </div>
                </div>

                <TabsContent value="all">
                    <div className="grid gap-4">
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : filteredUsers.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="grid xl:grid-cols-2 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredUsers.map((user) => (
                                        <UserCard
                                            key={user.id}
                                            user={user}
                                            onVerify={handleVerify}
                                            onReview={() => setActiveTab('pending')}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="pending">
                    <div className="grid gap-6">
                        {pendingUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 rounded-[3rem] border-2 border-dashed border-border/50 bg-muted/5">
                                <div className="p-6 rounded-[2rem] bg-emerald-500/10 text-emerald-600">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black tracking-tight">All Caught Up!</h3>
                                    <p className="text-muted-foreground font-medium">No pending verification requests at the moment.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {pendingUsers.map((user) => (
                                    <VerificationReviewCard key={user.id} user={user} onVerify={handleVerify} />
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function UserCard({ user, onVerify, onReview }: { user: User, onVerify: (id: string, s: string) => void, onReview: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative overflow-hidden rounded-[2rem] bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5"
        >
            <div className="p-6 flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border/50 group-hover:rotate-6 transition-transform">
                    {user.avatar ? (
                        <img src={user.avatar} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold tracking-tight truncate max-w-[150px]">{user.name}</h4>
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase px-2 py-0">
                                {user.role}
                            </Badge>
                        </div>
                        <StatusBadge status={user.status} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    {user.organization && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight">
                            <Building2 className="h-3 w-3" />
                            {user.organization}
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 pb-6 pt-0 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                    {user.status === 'pending' ? (
                        user.documentUrl || user.taxId ? (
                            <Button
                                variant="hero"
                                size="sm"
                                className="h-8 rounded-lg text-[12px] font-bold tracking-wide uppercase px-4 shadow-lg shadow-primary/20 bg-orange-500 hover:bg-orange-600 border-orange-600"
                                onClick={onReview}
                            >
                                Review KYC
                            </Button>
                        ) : (
                            <Badge variant="outline" className="h-8 rounded-lg text-[10px] uppercase font-black px-3 text-muted-foreground border-dashed">
                                Warning: No Docs
                            </Badge>
                        )
                    ) : (
                        user.status !== 'active' && (
                            <Button
                                variant="hero"
                                size="sm"
                                className="h-8 rounded-lg text-[14px] font-semibold"
                                onClick={() => onVerify(user.id, 'active')}
                            >
                                Reactivate
                            </Button>
                        )
                    )}

                    {user.status === 'active' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-[12px] font-bold uppercase tracking-wide text-destructive border-destructive/20 hover:bg-destructive/10"
                            onClick={() => onVerify(user.id, 'deactivated')}
                        >
                            Deactivate
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function VerificationReviewCard({ user, onVerify }: { user: User, onVerify: (id: string, s: string) => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-[2.5rem] bg-card border-2 border-orange-500/20 shadow-xl shadow-orange-500/5"
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <ShieldAlert size={120} className="text-orange-500" />
            </div>

            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-8">
                    <div className="flex items-start gap-6">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                            <Building2 className="h-8 w-8 text-orange-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-black tracking-tight">{user.organization || user.name}</h3>
                                <Badge className="bg-orange-500 text-white border-none uppercase text-[10px] font-black">
                                    KYC Pending
                                </Badge>
                            </div>
                            <p className="text-muted-foreground font-medium">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-3xl border border-border/50">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tax / Business ID</p>
                            <p className="font-bold text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                {user.taxId || 'Not Provided'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Permit Number</p>
                            <p className="font-bold text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                {user.permitNumber || 'Not Provided'}
                            </p>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Registered Address</p>
                            <p className="font-bold text-foreground flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                {user.address || 'Not Provided'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[320px] space-y-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Document Evidence</Label>
                        {user.documentUrl ? (
                            <a
                                href={user.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all group"
                            >
                                <FileText className="h-10 w-10 text-primary mb-3" />
                                <span className="text-sm font-bold text-primary flex items-center gap-2 transition-transform group-hover:translate-x-1">
                                    Review Document
                                    <ExternalLink className="h-4 w-4" />
                                </span>

                            </a>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-border/50 bg-muted/20 opacity-50">
                                <XCircle className="h-10 w-10 text-muted-foreground mb-3" />
                                <span className="text-sm font-bold text-muted-foreground">No Document Attached</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl font-semibold text-[14px] border-orange-500/20 text-orange-600 hover:bg-orange-500/5"
                            onClick={() => onVerify(user.id, 'rejected')}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="hero"
                            className="flex-1 h-14 rounded-2xl font-semibold text-[14px] shadow-2xl shadow-primary/20"
                            onClick={() => onVerify(user.id, 'active')}
                        >
                            Verify Identity
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, string> = {
        active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        deactivated: 'bg-muted text-muted-foreground border-border',
        rejected: 'bg-destructive/10 text-destructive border-destructive/20'
    };

    return (
        <Badge className={cn("uppercase text-[9px] font-black px-2 py-0.5 border", variants[status] || variants.deactivated)}>
            {status}
        </Badge>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid xl:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[180px] rounded-[2rem] bg-card animate-pulse border border-border" />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 rounded-[3rem] border-2 border-dashed border-border/50 bg-muted/5">
            <div className="p-6 rounded-[2rem] bg-muted/10 text-muted-foreground/30">
                <Users size={48} />
            </div>
            <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight">No Users Found</h3>
                <p className="text-muted-foreground font-medium">Try adjusting your search or filters.</p>
            </div>
        </div>
    );
}
