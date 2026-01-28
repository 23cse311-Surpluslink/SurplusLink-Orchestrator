import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, Truck, ExternalLink } from 'lucide-react';

const mockVolunteers = [
    {
        id: '1',
        name: 'Priyansh Narang',
        email: 'priyanshnarang123@gmail.com',
        phone: '+1 234-567-8901',
        status: 'on_route',
        currentTask: 'Pick up from Pizza Hut',
        completedTasks: 42,
        rating: 4.8,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priyansh',
    },
    {
        id: '2',
        name: 'Ramesh Singh',
        email: 'rameshsingh123@gmail.com',
        phone: '+1 234-567-8902',
        status: 'available',
        currentTask: null,
        completedTasks: 128,
        rating: 4.9,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh',
    },
    {
        id: '3',
        name: 'Ravi Kumar',
        email: 'ravi.kumar123@gmail.com',
        phone: '+1 234-567-8903',
        status: 'busy',
        currentTask: 'Delivery to Central Community Center',
        completedTasks: 15,
        rating: 4.5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi',
    }
];

export function NgoVolunteersPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Volunteer Network"
                description="Manage and track volunteers assigned to your distributions."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockVolunteers.map((volunteer) => (
                    <Card key={volunteer.id} className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Avatar className="h-12 w-12 border-2 border-primary/10">
                                <AvatarImage src={volunteer.avatar} />
                                <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-lg">{volunteer.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={volunteer.status === 'available' ? 'default' : 'secondary'}>
                                        {volunteer.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">★ {volunteer.rating}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{volunteer.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span>{volunteer.email}</span>
                                </div>
                            </div>

                            {volunteer.currentTask ? (
                                <div className="p-3 rounded-lg bg-info/5 border border-info/20">
                                    <p className="text-xs font-semibold text-info uppercase tracking-wider mb-1">Current Task</p>
                                    <p className="text-sm font-medium">{volunteer.currentTask}</p>
                                </div>
                            ) : (
                                <div className="p-3 rounded-lg bg-muted/50 border border-border italic text-center">
                                    <p className="text-xs text-muted-foreground">No active task assigned</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t text-sm">
                                <span className="text-muted-foreground">Total Rescues:</span>
                                <span className="font-bold">{volunteer.completedTasks}</span>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    Message
                                </Button>
                                <Button variant="secondary" size="sm" className="flex-1">
                                    Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-8">
                    <div>
                        <h3 className="text-xl font-bold mb-1 text-primary">Need more volunteers?</h3>
                        <p className="text-muted-foreground">Your request for priority volunteer assistance is active.</p>
                    </div>
                    <Button size="lg" className="shadow-lg hover:shadow-primary/20 transition-all">
                        Recruit New Volunteers
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
