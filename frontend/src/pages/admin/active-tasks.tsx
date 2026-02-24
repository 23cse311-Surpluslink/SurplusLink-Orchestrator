import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/common/page-header';
import { Truck, MapPin, Building2, User as UserIcon, AlertTriangle, XCircle, RotateCcw, Pause, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Donation } from '@/types';

interface ActiveTask {
    _id: string;
    title: string;
    status: string;
    deliveryStatus: string;
    donor: { name: string; organization: string };
    claimedBy?: { name: string; organization: string };
    volunteer?: { name: string };
    createdAt: string;
}

export default function ActiveTasksPage() {
    const [tasks, setTasks] = useState<ActiveTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [interventionId, setInterventionId] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const { toast } = useToast();

    const fetchActiveTasks = useCallback(async () => {
        try {
            const res = await api.get('/donations');
            const active = res.data.filter((t: Donation) => t.status !== 'completed' && t.status !== 'expired');
            setTasks(active as unknown as ActiveTask[]);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch active tasks',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchActiveTasks();
    }, [fetchActiveTasks]);

    const handleIntervene = async (donationId: string, action: 'cancel' | 'reassign' | 'pause') => {
        if (!reason) {
            toast({ title: 'Validation', description: 'Please provide a reason for intervention', variant: 'destructive' });
            return;
        }

        try {
            await api.post('/admin/intervene-task', { donationId, action, reason });
            toast({ title: 'Success', description: `Task has been ${action}ed.` });
            fetchActiveTasks();
            setInterventionId(null);
            setReason('');
        } catch (error) {
            toast({ title: 'Error', description: 'Intervention failed', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Task Intervention"
                description="Monitor and manage active donation tasks in real-time."
            />

            <div className="grid gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)
                ) : tasks.length === 0 ? (
                    <Card className="border-dashed flex flex-col items-center justify-center p-12">
                        <Truck size={32} className="text-muted-foreground opacity-30 mb-4" />
                        <CardTitle>No Active Tasks</CardTitle>
                        <p className="text-muted-foreground">The platform is currently idle or all tasks are completed.</p>
                    </Card>
                ) : (
                    tasks.map(task => (
                        <Card key={task._id} className="border-border/50 overflow-hidden">
                            <div className="p-6 grid md:grid-cols-4 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{task.title}</h3>
                                            <p className="text-xs text-muted-foreground">ID: {task._id}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">Donor</p>
                                            <div className="flex items-center gap-2 text-sm font-bold">
                                                <Building2 size={14} className="text-muted-foreground" />
                                                {task.donor.organization || task.donor.name}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">NGO Claimed</p>
                                            <div className="flex items-center gap-2 text-sm font-bold">
                                                <Building2 size={14} className="text-muted-foreground" />
                                                {task.claimedBy?.organization || 'Pending'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">Volunteer</p>
                                            <div className="flex items-center gap-2 text-sm font-bold">
                                                <UserIcon size={14} className="text-muted-foreground" />
                                                {task.volunteer?.name || 'Unassigned'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">Status</p>
                                            <Badge variant="outline" className="h-6 gap-1 capitalize font-bold text-[10px]">
                                                <Activity size={10} />
                                                {task.deliveryStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex flex-col justify-between border-l border-border/50 pl-6">
                                    {interventionId === task._id ? (
                                        <div className="space-y-3">
                                            <Textarea
                                                placeholder="Reason for intervention (required)..."
                                                className="h-20 text-sm rounded-xl resize-none"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                            />
                                            <div className="grid grid-cols-3 gap-2">
                                                <Button size="sm" variant="destructive" className="rounded-lg text-[10px] uppercase font-black" onClick={() => handleIntervene(task._id, 'cancel')}>Cancel</Button>
                                                <Button size="sm" variant="default" className="rounded-lg text-[10px] uppercase font-black" onClick={() => handleIntervene(task._id, 'reassign')}>Reassign</Button>
                                                <Button size="sm" variant="secondary" className="rounded-lg text-[10px] uppercase font-black" onClick={() => handleIntervene(task._id, 'pause')}>Pause</Button>
                                            </div>
                                            <Button variant="ghost" className="w-full h-8 text-[10px] uppercase font-bold" onClick={() => setInterventionId(null)}>Back</Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-full items-center justify-center gap-4">
                                            <AlertTriangle className="text-orange-500 opacity-50" size={32} />
                                            <Button
                                                variant="hero"
                                                className="bg-orange-500 hover:bg-orange-600 h-10 w-full rounded-xl gap-2 font-black uppercase text-xs"
                                                onClick={() => setInterventionId(task._id)}
                                            >
                                                Intervene Task
                                            </Button>
                                            <p className="text-[10px] text-muted-foreground font-medium text-center italic">
                                                Interrupting active tasks notifies all stakeholders immediately.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
