import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, Truck, ExternalLink, Loader2, Users } from 'lucide-react';
import * as UserService from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';

interface Volunteer {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'on_route' | 'available' | 'busy' | 'offline';
    currentTask: string | null;
    completedTasks: number;
    rating: number;
    avatar: string;
}

export function NgoVolunteersPage() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchVolunteers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UserService.getNgoVolunteers();
            setVolunteers(data);
        } catch (error) {
            console.error('Failed to fetch volunteers:', error);
            toast({
                title: 'Error',
                description: 'Failed to load volunteer network data.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchVolunteers();
    }, [fetchVolunteers]);

    const statusColors = {
        on_route: 'bg-info/20 text-info border-info/40',
        available: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40',
        busy: 'bg-amber-500/20 text-amber-500 border-amber-500/40',
        offline: 'bg-muted text-muted-foreground border-border',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Volunteer Network"
                description="Manage and track volunteers assigned to your distributions."
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground font-medium">Synchronizing Volunteer Network...</p>
                </div>
            ) : volunteers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {volunteers.map((volunteer) => (
                        <Card key={volunteer.id} className="overflow-hidden border-2 hover:border-primary/20 transition-all group">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <Avatar className="h-12 w-12 border-2 border-primary/10 transition-transform group-hover:scale-110">
                                    <AvatarImage src={volunteer.avatar} />
                                    <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-bold">{volunteer.name}</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={statusColors[volunteer.status]}>
                                            {volunteer.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-xs font-bold text-muted-foreground">★ {volunteer.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                            
                                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span className="truncate">{volunteer.email}</span>
                                    </div>
                                </div>

                                {volunteer.currentTask ? (
                                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Current Task</p>
                                        <p className="text-sm font-bold">{volunteer.currentTask}</p>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50 italic text-center">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-tighter">No active task assigned</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t text-sm">
                                    <span className="text-muted-foreground font-medium">Total Rescues:</span>
                                    <span className="font-black text-primary">{volunteer.completedTasks}</span>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 font-bold h-10 border-primary/20 hover:bg-primary/5">
                                        Message
                                    </Button>
                                   
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-2 border-dashed bg-muted/20 py-20">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Users className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Volunteers Found</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Once volunteers start accepting missions for your claimed donations, they will appear here.
                        </p>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
