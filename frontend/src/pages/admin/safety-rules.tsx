import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { ShieldAlert, Plus, Thermometer, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SafetyRule {
    id: string;
    foodType: string;
    maxDurationHours: number;
    storageRequired: string;
    isActive: boolean;
}

export default function SafetyRulesPage() {
    const [rules, setRules] = useState<SafetyRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        foodType: '',
        maxDurationHours: 24,
        storageRequired: 'dry'
    });

    const fetchRules = useCallback(async () => {
        try {
            const res = await api.get('/admin/safety-rules');
            setRules(res.data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch safety rules',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/safety-rules', formData);
            toast({
                title: 'Success',
                description: 'Safety rule updated successfully',
            });
            fetchRules();
            setIsAdding(false);
            setFormData({ foodType: '', maxDurationHours: 24, storageRequired: 'dry' });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save rule',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <PageHeader
                    title="Safety Standards"
                    description="Configure food safety thresholds and storage requirements."
                />
                <Button
                    variant="hero"
                    className="rounded-xl h-12 gap-2 font-black uppercase text-xs"
                    onClick={() => setIsAdding(true)}
                >
                    <Plus size={16} />
                    New Standard
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-primary/20 bg-primary/5 mb-8">
                            <CardHeader>
                                <CardTitle className="text-lg">Configure New Rule</CardTitle>
                                <CardDescription>Rules apply during donation creation and volunteer pickup.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase opacity-50">Food Category</Label>
                                        <Input
                                            placeholder="e.g. Cooked Meals, Dairy"
                                            className="h-12 rounded-xl bg-background"
                                            value={formData.foodType}
                                            onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase opacity-50">Max Life (Hours)</Label>
                                        <Input
                                            type="number"
                                            className="h-12 rounded-xl bg-background"
                                            value={formData.maxDurationHours}
                                            onChange={(e) => setFormData({ ...formData, maxDurationHours: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase opacity-50">Storage Type</Label>
                                        <Select
                                            value={formData.storageRequired}
                                            onValueChange={(v) => setFormData({ ...formData, storageRequired: v })}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Specific Storage</SelectItem>
                                                <SelectItem value="dry">Dry Storage</SelectItem>
                                                <SelectItem value="cold">Cold Storage</SelectItem>
                                                <SelectItem value="frozen">Frozen Storage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" className="flex-1 h-12 rounded-xl font-black uppercase text-xs">Save</Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-12 px-4 rounded-xl"
                                            onClick={() => setIsAdding(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)
                ) : (
                    rules.map(rule => (
                        <Card key={rule.id} className="border-border/50 group hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-black uppercase tracking-wider">{rule.foodType}</CardTitle>
                                <ShieldAlert size={18} className="text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock size={14} />
                                            <span>Max Duration</span>
                                        </div>
                                        <span className="font-bold">{rule.maxDurationHours}h</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Thermometer size={14} />
                                            <span>Storage</span>
                                        </div>
                                        <Badge variant="outline" className="capitalize font-bold rounded-lg px-2 border-primary/20 text-primary bg-primary/5">
                                            {rule.storageRequired}
                                        </Badge>
                                    </div>
                                    <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-500">
                                            <CheckCircle2 size={10} />
                                            Active Rule
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                setFormData({
                                                    foodType: rule.foodType,
                                                    maxDurationHours: rule.maxDurationHours,
                                                    storageRequired: rule.storageRequired
                                                });
                                                setIsAdding(true);
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
